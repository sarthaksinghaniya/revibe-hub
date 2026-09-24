import { supabase } from "@/integrations/supabase/client";

import { co2GramsForItem, mintFromReservoir, type Category } from "./co2Formula";

export interface ScanItem {
  name: string;
  category: "recyclable" | "compostable" | "hazardous" | "landfill" | "upcyclable";
  material: string;
  confidence: number;
  disposal_steps: string[];
  upcycle_ideas: string[];
  co2_saved_kg: number;
  water_saved_liters: number;
  credits_awarded: number;
  reduced_credits: boolean;
}

export interface MultiScanResult {
  items: ScanItem[];
  total_credits: number;
  scan_type: "single" | "multi";
}

function hashImage(b64: string): string {
  const len = b64.length;
  const head = b64.slice(0, 500);
  const tail = b64.slice(-500);
  return `${len}:${head.length}:${tail.length}:${btoa(head.slice(0, 80) + tail.slice(0, 80))}`;
}

// ── Vision scan via Supabase edge function (uses server GROQ_API_KEY) ────────
async function callGroqVision(
  imageBase64: string
): Promise<{ items: any[]; scan_type: "single" | "multi" }> {
  const { data, error } = await supabase.functions.invoke("scan-waste", {
    body: { image: imageBase64 },
  });

  if (error) {
    console.error("scan-waste invoke error:", error);
    throw new Error(error.message || "Scan failed. Please try again.");
  }
  if ((data as any)?.error) {
    throw new Error((data as any).error);
  }

  const items = Array.isArray((data as any)?.items) ? (data as any).items : [];
  if (items.length === 0) throw new Error("No items detected");

  const scan_type: "single" | "multi" =
    (data as any)?.scan_type || (items.length > 1 ? "multi" : "single");

  return { items, scan_type };
}

// ── Main export (all credits / dedup / streak logic unchanged) ───────────────
export async function scanWasteImage(imageBase64: string): Promise<MultiScanResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const imgHash = hashImage(imageBase64);

  // Dedup check: same hash within last 24h for this user
  if (user) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: dup } = await supabase
      .from("scan_history")
      .select("id")
      .eq("user_id", user.id)
      .eq("image_hash", imgHash)
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();

    if (dup) {
      throw new Error("You've already scanned this item today");
    }
  }

  // ── AI call via Groq ─────────────────────────────────────────────────────
  const groqData = await callGroqVision(imageBase64);
  const items: any[] = groqData.items;
  const scanType: "single" | "multi" =
    groqData.scan_type || (items.length > 1 ? "multi" : "single");

  const enriched: ScanItem[] = [];

  if (user) {
    // Anti-farming: cap CC-earning items per category to 3/hour (extras still log CO₂ at 30%)
    const sixtyMinAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("scan_history")
      .select("category, credits_earned")
      .eq("user_id", user.id)
      .gte("created_at", sixtyMinAgo);

    const catCounts: Record<string, number> = {};
    (recent || []).forEach((r: any) => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });

    let totalCo2G = 0;

    for (const it of items) {
      const cat = String(it.category).toLowerCase() as Category;
      const count = catCounts[cat] || 0;
      const reduced = count >= 3;

      // Compute CO₂ grams (Indian baseline). Reduced scans count at 30%.
      let co2G = co2GramsForItem(cat, false, Number(it.co2_saved_kg) || 0);
      if (reduced) co2G = Math.round(co2G * 0.3);

      catCounts[cat] = count + 1;
      totalCo2G += co2G;

      try {
        await supabase.from("scan_history").insert({
          user_id: user.id,
          item_name: it.name,
          category: cat as any,
          disposal_method: (it.disposal_steps || []).join(" → "),
          material: it.material,
          carbon_saved: co2G / 1000, // store kg in legacy column for back-compat
          credits_earned: 0,         // CC no longer per-scan
          image_hash: imgHash,
          reduced_credits: reduced,
          source: "scan",
        } as any);
      } catch (e) {
        console.warn("Save scan failed", e);
      }

      enriched.push({
        name: it.name,
        category: cat,
        material: it.material,
        confidence: it.confidence,
        disposal_steps: it.disposal_steps || [],
        upcycle_ideas: it.upcycle_ideas || [],
        co2_saved_kg: co2G / 1000,
        water_saved_liters: Number(it.water_saved_liters) || 0,
        credits_awarded: 0,
        reduced_credits: reduced,
      });
    }

    // ── Reservoir update + CC mint ─────────────────────────────────────────
    let mintedCC = 0;
    if (totalCo2G > 0) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data: existing } = await supabase
          .from("carbon_credits")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (existing) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          let newStreak = existing.current_streak;
          if (existing.last_scan_date === yesterday) newStreak += 1;
          else if (existing.last_scan_date !== today) newStreak = 1;

          const prevPending = Number((existing as any).co2_pending_g) || 0;
          const lifetime = Number((existing as any).co2_saved_g) || 0;

          const { mintedCC: minted, newPendingG } = mintFromReservoir(
            prevPending,
            totalCo2G,
            newStreak,
          );
          mintedCC = minted;

          await supabase
            .from("carbon_credits")
            .update({
              total_credits: existing.total_credits + minted,
              co2_saved_g: lifetime + totalCo2G,
              co2_pending_g: newPendingG,
              current_streak: newStreak,
              longest_streak: Math.max(existing.longest_streak, newStreak),
              last_scan_date: today,
            } as any)
            .eq("user_id", user.id);
        }
      } catch (e) {
        console.warn("reservoir update failed", e);
      }
    }

    return {
      items: enriched,
      total_credits: mintedCC, // CC actually minted to wallet this scan (often 0)
      scan_type: scanType,
    };
  }

  // No user — preview-only result
  for (const it of items) {
    const cat = String(it.category).toLowerCase() as Category;
    const co2G = co2GramsForItem(cat, false, Number(it.co2_saved_kg) || 0);
    enriched.push({
      name: it.name,
      category: cat,
      material: it.material,
      confidence: it.confidence,
      disposal_steps: it.disposal_steps || [],
      upcycle_ideas: it.upcycle_ideas || [],
      co2_saved_kg: co2G / 1000,
      water_saved_liters: Number(it.water_saved_liters) || 0,
      credits_awarded: 0,
      reduced_credits: false,
    });
  }

  return {
    items: enriched,
    total_credits: 0,
    scan_type: scanType,
  };
}