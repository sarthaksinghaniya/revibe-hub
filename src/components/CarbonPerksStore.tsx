import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  TreePine,
  Award,
  Tag,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { soundFx } from "@/lib/soundFx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PerkItem {
  id: string;
  title: string;
  brand: string;
  costCC: number;
  category: "voucher" | "tree" | "certificate";
  discountText: string;
  description: string;
  codePrefix: string;
  icon: any;
  color: string;
}

export const PERK_ITEMS: PerkItem[] = [
  {
    id: "perk_bamboo",
    title: "Bamboo Toothbrush & Essentials Kit",
    brand: "Bamboo India",
    costCC: 40,
    category: "voucher",
    discountText: "25% OFF",
    description: "Get 25% discount on zero-waste bamboo personal care essentials.",
    codePrefix: "BAMBOO-W2W",
    icon: Tag,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "perk_compost",
    title: "Home Aerobic Composter Starter Kit",
    brand: "Daily Dump",
    costCC: 100,
    category: "voucher",
    discountText: "₹250 OFF",
    description: "Turn kitchen wet waste into black gold with an odor-free terracotta composter.",
    codePrefix: "COMPOST-W2W",
    icon: ShoppingBag,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "perk_tree",
    title: "Plant a Real Native Tree with Geo-tagging",
    brand: "SankalpTaru Partner",
    costCC: 250,
    category: "tree",
    discountText: "1 TREE SPONSORED",
    description: "Plant a native peepal/neem sapling in India. Receive GPS coordinates & certificate.",
    codePrefix: "TREE-PLANT",
    icon: TreePine,
    color: "text-green-400 bg-green-500/15 border-green-500/40",
  },
  {
    id: "perk_apparel",
    title: "Organic Fairtrade Cotton Apparel",
    brand: "No Nasties",
    costCC: 75,
    category: "voucher",
    discountText: "15% OFF",
    description: "100% organic, solar-powered sustainable clothing and canvas bags.",
    codePrefix: "ORGANIC-W2W",
    icon: Gift,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/30",
  },
  {
    id: "perk_cert",
    title: "Verified Green Citizen Digital Badge",
    brand: "W2W Environmental Foundation",
    costCC: 30,
    category: "certificate",
    discountText: "OFFICIAL BADGE",
    description: "Shareable verified carbon offset credentials for LinkedIn & resumes.",
    codePrefix: "CERT-W2W",
    icon: Award,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
];

export interface RedemptionRecord {
  id: string;
  perkId: string;
  perkTitle: string;
  brand: string;
  costCC: number;
  code: string;
  timestamp: number;
}

const REDEMPTION_STORAGE_KEY = "w2w_perk_redemptions";

export function getRedemptionHistory(): RedemptionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REDEMPTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRedemption(record: RedemptionRecord): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRedemptionHistory();
    localStorage.setItem(REDEMPTION_STORAGE_KEY, JSON.stringify([record, ...current]));
  } catch (e) {
    console.error("Failed to save redemption record", e);
  }
}

interface CarbonPerksStoreProps {
  userCredits: number;
  onDeductCredits?: (deducted: number) => void;
}

export const CarbonPerksStore = ({
  userCredits,
  onDeductCredits,
}: CarbonPerksStoreProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [activeModalPerk, setActiveModalPerk] = useState<PerkItem | null>(null);
  const [latestCode, setLatestCode] = useState<string | null>(null);
  const [viewHistory, setViewHistory] = useState(false);

  useEffect(() => {
    setRedemptions(getRedemptionHistory());
  }, []);

  const handleRedeem = (perk: PerkItem) => {
    if (userCredits < perk.costCC) {
      const needed = perk.costCC - userCredits;
      toast.error(`Need ${needed} more Carbon Credits to unlock this perk.`);
      return;
    }

    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedCode = `${perk.codePrefix}-${uniqueSuffix}`;

    const record: RedemptionRecord = {
      id: `red_${Date.now()}`,
      perkId: perk.id,
      perkTitle: perk.title,
      brand: perk.brand,
      costCC: perk.costCC,
      code: generatedCode,
      timestamp: Date.now(),
    };

    saveRedemption(record);
    setRedemptions(getRedemptionHistory());
    setLatestCode(generatedCode);
    setActiveModalPerk(perk);

    if (onDeductCredits) {
      onDeductCredits(perk.costCC);
    }

    if (perk.category === "tree") {
      soundFx.playLevelUpFanfare();
      toast.success("🌳 Native Tree Sponsored! Verification certificate generated.");
    } else {
      soundFx.playCoinSound();
      toast.success(`🎉 ${perk.brand} reward code unlocked!`);
    }
  };

  const copyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      toast.success("📋 Coupon code copied to clipboard!");
    }
  };

  const filtered = PERK_ITEMS.filter((item) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Vouchers") return item.category === "voucher";
    if (activeCategory === "Trees") return item.category === "tree";
    if (activeCategory === "Badges") return item.category === "certificate";
    return true;
  });

  return (
    <div className="mt-8 p-6 rounded-3xl glass-card border border-primary/20 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-data px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider font-bold">
              Carbon Rewards Store
            </span>
          </div>
          <h3 className="text-xl font-display font-bold text-foreground">
            Redeem Credits for <span className="text-primary">Real-World Impact</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turn your scanned carbon credits into partner brand vouchers or plant verified trees.
          </p>
        </div>

        <button
          onClick={() => setViewHistory(!viewHistory)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-alt border border-border text-xs font-display font-semibold hover:bg-muted transition-colors self-start sm:self-auto"
        >
          <Award size={14} className="text-primary" />
          <span>My Perks ({redemptions.length})</span>
        </button>
      </div>

      {viewHistory ? (
        /* My Redeemed Perks View */
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-display font-bold text-foreground uppercase tracking-wider">
              Your Redeemed Perks & Certificates
            </h4>
            <button
              onClick={() => setViewHistory(false)}
              className="text-xs text-primary font-data hover:underline"
            >
              ← Back to Store
            </button>
          </div>

          {redemptions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-surface-alt/50 border border-border/60">
              <Gift size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">You haven't redeemed any perks yet.</p>
              <button
                onClick={() => setViewHistory(false)}
                className="mt-3 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-display font-bold"
              >
                Browse Store
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {redemptions.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-surface-alt border border-border flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-data text-primary font-bold">{r.brand}</span>
                    <p className="text-xs font-display font-bold text-foreground mt-0.5">{r.perkTitle}</p>
                    <span className="text-[10px] font-data text-muted-foreground">
                      Redeemed for {r.costCC} CC • {new Date(r.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCode(r.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/25 text-xs font-data font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Copy size={12} />
                    <span>{r.code}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Store Catalog */
        <div className="space-y-4">
          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["All", "Vouchers", "Trees", "Badges"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-data transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                    : "bg-surface-alt border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map((perk) => {
              const Icon = perk.icon;
              const canAfford = userCredits >= perk.costCC;
              const progressPct = Math.min(100, (userCredits / perk.costCC) * 100);

              return (
                <div
                  key={perk.id}
                  className="p-4 rounded-2xl bg-surface-alt border border-border/80 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`p-2 rounded-xl border ${perk.color}`}>
                        <Icon size={18} />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-data font-bold bg-primary/10 text-primary border border-primary/20">
                        {perk.discountText}
                      </span>
                    </div>

                    <span className="text-[10px] font-data text-muted-foreground font-semibold">
                      {perk.brand}
                    </span>
                    <h4 className="text-sm font-display font-bold text-foreground mt-0.5 leading-snug">
                      {perk.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {perk.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-data font-bold text-foreground">
                        {perk.costCC} Carbon Credits
                      </span>
                      <span className="text-[10px] font-data text-muted-foreground">
                        {userCredits} / {perk.costCC} CC
                      </span>
                    </div>

                    {!canAfford && (
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-2.5">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleRedeem(perk)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-display font-bold transition-all flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-95"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Redeem Perk</span>
                        </>
                      ) : (
                        <span>Need {perk.costCC - userCredits} more CC</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reward Unlocked Modal */}
      <Dialog
        open={!!activeModalPerk}
        onOpenChange={(open) => {
          if (!open) {
            setActiveModalPerk(null);
            setLatestCode(null);
          }
        }}
      >
        <DialogContent className="max-w-sm rounded-3xl bg-card border-border p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 animate-bounce">
            <Sparkles size={28} />
          </div>

          <DialogTitle className="text-lg font-display font-bold text-foreground">
            Perk Unlocked Successfully!
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1 font-body">
            You successfully redeemed <strong>{activeModalPerk?.title}</strong> from {activeModalPerk?.brand}.
          </p>

          {latestCode && (
            <div className="my-4 p-3.5 rounded-2xl bg-surface-alt border border-primary/30 flex items-center justify-between gap-2">
              <span className="text-xs font-data font-bold text-primary tracking-wider">
                {latestCode}
              </span>
              <button
                onClick={() => copyCode(latestCode)}
                className="p-1.5 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90"
                title="Copy Code"
              >
                <Copy size={14} />
              </button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Use this code during checkout at {activeModalPerk?.brand} or present it at redemption.
          </p>

          <button
            onClick={() => {
              setActiveModalPerk(null);
              setLatestCode(null);
            }}
            className="w-full mt-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs"
          >
            Done
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
