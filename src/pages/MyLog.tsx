import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Leaf, Trophy, Droplets, Sparkles, Share2, ExternalLink, Globe } from "lucide-react";
import EcoFingerprint from "@/components/EcoFingerprint";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { EcoWrappedCard } from "@/components/GenZ/EcoWrappedCard";
import { InterCampusBattles } from "@/components/GenZ/InterCampusBattles";
import { toast } from "sonner";

interface ScanItem {
  id: string;
  item_name: string;
  category: string;
  material: string | null;
  carbon_saved: number;
  credits_earned: number;
  created_at: string;
}

const categoryDot: Record<string, string> = {
  recyclable: "bg-category-recycle",
  compostable: "bg-category-compost",
  hazardous: "bg-category-hazard",
  landfill: "bg-category-landfill",
  upcyclable: "bg-category-upcycle",
};

const categoryLabel: Record<string, string> = {
  recyclable: "Recyclable",
  compostable: "Compostable",
  hazardous: "Hazardous",
  landfill: "Landfill",
  upcyclable: "Upcyclable",
};

const MyLog = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<any>(null);
  const [ecoWrappedOpen, setEcoWrappedOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [{ data: scanData }, { data: creditData }] = await Promise.all([
      supabase
        .from("scan_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("carbon_credits")
        .select("*")
        .eq("user_id", user!.id)
        .single(),
    ]);

    if (scanData) setScans(scanData as ScanItem[]);
    if (creditData) setCredits(creditData);
    setLoading(false);
  };

  // Compute category counts for fingerprint
  const catCounts = scans.reduce(
    (acc, s) => {
      const cat = s.category as keyof typeof acc;
      if (cat in acc) acc[cat]++;
      return acc;
    },
    { recyclable: 0, compostable: 0, hazardous: 0, landfill: 0, upcyclable: 0 }
  );

  const totalCO2 = scans.reduce((sum, s) => sum + Number(s.carbon_saved || 0), 0);
  const totalItems = scans.length;
  const streakCount = credits?.current_streak ?? 0;

  // Group by date
  const grouped: { label: string; items: ScanItem[] }[] = [];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  scans.forEach((scan) => {
    const d = new Date(scan.created_at).toDateString();
    const label = d === today ? "Today" : d === yesterday ? "Yesterday" : new Date(scan.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const existing = grouped.find((g) => g.label === label);
    if (existing) existing.items.push(scan);
    else grouped.push({ label, items: [scan] });
  });

  const xp = profile?.total_xp ?? 0;
  const level = xp < 200 ? "Eco Newbie" : xp < 500 ? "Green Scout" : xp < 1000 ? "Eco Warrior" : "Planet Hero";
  const nextLevelXp = xp < 200 ? 200 : xp < 500 ? 500 : xp < 1000 ? 1000 : 5000;

  // India Social Media Sharing Handlers (WhatsApp, Instagram, Facebook)
  const handleWhatsAppShare = () => {
    const msg = `🌱 I've saved ${totalCO2.toFixed(1)}kg of CO₂ across ${totalItems} waste scans on W2W UpcycleIT! 🔥 ${streakCount}-day streak active. Join the eco movement! ♻️`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Opened WhatsApp for Status share!");
  };

  const handleInstagramShare = () => {
    setEcoWrappedOpen(true);
  };

  const handleFacebookShare = () => {
    const msg = `🌱 I've saved ${totalCO2.toFixed(1)}kg of CO₂ across ${totalItems} waste scans on W2W UpcycleIT! Join the eco movement!`;
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Opened Facebook share!");
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 lg:pt-24 px-4 max-w-5xl mx-auto">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">My Bio-Digital Log</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Track your carbon impact, flex your streaks, and battle campuses</p>
          </div>

          {/* Gen-Z Eco Wrapped Launch Banner */}
          <button
            onClick={() => setEcoWrappedOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-primary/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-display font-bold hover:scale-[1.02] transition-transform shadow-md"
          >
            <Sparkles size={16} className="animate-spin text-emerald-400" />
            <span>View Gen-Z Eco Wrapped 2026</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Gen-Z Social Flexing Toolbar (WhatsApp Status, Instagram Reels, Facebook) */}
            <div className="p-4 rounded-2xl bg-card border border-border mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                <span className="text-xs font-display font-bold text-foreground">
                  Flex Your Impact on Socials (India 🇮🇳)
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 text-xs font-data font-bold hover:bg-emerald-600/25 transition-colors"
                >
                  <Share2 size={13} /> WhatsApp Status
                </button>
                <button
                  onClick={handleInstagramShare}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-600/15 text-pink-400 border border-pink-500/30 text-xs font-data font-bold hover:bg-pink-600/25 transition-colors"
                >
                  <Sparkles size={13} /> Instagram Story
                </button>
                <button
                  onClick={handleFacebookShare}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30 text-xs font-data font-bold hover:bg-blue-600/25 transition-colors"
                >
                  <ExternalLink size={13} /> Facebook
                </button>
              </div>
            </div>

            {/* Main Desktop & Mobile Layout */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-6">
              {/* Left column - stats */}
              <div className="lg:col-span-1 space-y-4 mb-6 lg:mb-0">
                {/* Eco Fingerprint */}
                <motion.div
                  className="p-5 rounded-2xl glass-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-[10px] font-data text-muted-foreground uppercase tracking-[0.15em] mb-3 text-center">
                    Your Eco Fingerprint
                  </p>
                  <EcoFingerprint
                    recyclable={catCounts.recyclable}
                    compostable={catCounts.compostable}
                    hazardous={catCounts.hazardous}
                    landfill={catCounts.landfill}
                    upcyclable={catCounts.upcyclable}
                  />
                  <p className="text-[10px] text-muted-foreground text-center mt-3 max-w-[200px] mx-auto leading-relaxed">
                    A unique pattern shaped by your scanning habits
                  </p>
                </motion.div>

                {/* Impact Summary with Bio-Digital Carbon Streak */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Leaf, value: totalItems.toString(), label: "Items Scanned", color: "text-category-compost" },
                    { icon: Droplets, value: `${totalCO2.toFixed(1)}kg`, label: "CO₂ Saved", color: "text-category-recycle" },
                    { icon: Flame, value: `${streakCount}d 🔥`, label: "Bio-Digital Streak", color: "text-destructive" },
                    { icon: Trophy, value: level, label: "Level", color: "text-category-upcycle" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className="p-4 rounded-2xl glass-card"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <stat.icon size={16} className={stat.color} />
                      <div className="text-xl font-display font-bold text-foreground mt-2 tabular-nums">{stat.value}</div>
                      <div className="text-[10px] font-data text-muted-foreground uppercase">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* XP Bar */}
                <div className="p-4 rounded-2xl glass-card">
                  <div className="flex justify-between text-xs font-data text-muted-foreground mb-2">
                    <span>{level}</span>
                    <span>{xp} / {nextLevelXp} XP</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (xp / nextLevelXp) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Right column - timeline */}
              <div className="lg:col-span-2">
                {scans.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl glass-card">
                    <Leaf size={32} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No scans yet. Start scanning to build your log!</p>
                  </div>
                ) : (
                  grouped.map((day, di) => (
                    <div key={di} className="mb-6">
                      <h3 className="text-xs font-data text-muted-foreground uppercase tracking-wider mb-3">{day.label}</h3>
                      <div className="space-y-2">
                        {day.items.map((item, ii) => (
                          <motion.div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-2xl glass-card"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (di * 3 + ii) * 0.04 }}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${categoryDot[item.category] || "bg-muted-foreground"}`} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-display font-bold text-foreground truncate">{item.item_name}</div>
                              <div className="flex items-center gap-2 text-[10px] font-data text-muted-foreground">
                                <span>{categoryLabel[item.category] || item.category}</span>
                                {item.material && <><span>•</span><span>{item.material}</span></>}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs font-data text-primary font-bold">+{item.credits_earned} CC</div>
                              <div className="text-[10px] font-data text-muted-foreground">
                                {new Date(item.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Inter-Campus Battles Leaderboard */}
            <InterCampusBattles />
          </>
        )}
      </div>

      {/* Eco Wrapped Modal */}
      <EcoWrappedCard
        open={ecoWrappedOpen}
        onClose={() => setEcoWrappedOpen(false)}
        userName={profile?.display_name || "Eco Warrior"}
        totalScans={totalItems}
        totalCO2Kg={totalCO2}
        streakDays={streakCount}
        topCategory="Recyclable"
        levelName={level}
      />
    </div>
  );
};

export default MyLog;
