import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Flame, Trophy, TrendingUp, Award, Crown, Shield, Star, CheckCircle2, Leaf, Gift, ArrowUpRight, Wallet, IndianRupee, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CO2_PROFILE, G_PER_CC, verifiedTonneCC, co2Equivalents } from "@/lib/co2Formula";
import { useCashRewards } from "@/hooks/useCashRewards";
import { toast } from "sonner";

const badges = [
  { name: "Eco Starter", threshold: 100, icon: Star, color: "text-category-compost" },
  { name: "Green Guardian", threshold: 500, icon: Shield, color: "text-category-recycle" },
  { name: "Planet Protector", threshold: 1000, icon: Crown, color: "text-category-upcycle" },
  { name: "Earth Champion", threshold: 5000, icon: Award, color: "text-[hsl(var(--cat-hazard))]" },
];

const weeklyMock = [
  { day: "Mon", credits: 24 },
  { day: "Tue", credits: 36 },
  { day: "Wed", credits: 18 },
  { day: "Thu", credits: 45 },
  { day: "Fri", credits: 30 },
  { day: "Sat", credits: 52 },
  { day: "Sun", credits: 12 },
];

const CarbonWallet = () => {
  const { user } = useAuth();
  const { rewardState, withdrawUPI } = useCashRewards();

  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [verifiedRecent, setVerifiedRecent] = useState<any[]>([]);

  // UPI Withdrawal Dialog State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from("carbon_credits")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setCredits(data);

        const { data: verified } = await (supabase
          .from("scan_history") as any)
          .select("*")
          .eq("user_id", user.id)
          .eq("source", "verified_dropoff")
          .order("created_at", { ascending: false });
        setVerifiedCount(verified?.length || 0);
        setVerifiedRecent((verified || []).slice(0, 5));
      } catch (e) {
        console.error("Error loading wallet data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleUPIWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount to withdraw.");
      return;
    }
    if (amt > rewardState.cashBalance) {
      toast.error(`Insufficient balance. Your current balance is ₹${rewardState.cashBalance}`);
      return;
    }
    if (!upiId || !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. 9876543210@paytm or name@upi).");
      return;
    }

    setIsSubmittingWithdrawal(true);
    setTimeout(() => {
      const res = withdrawUPI(amt, upiId);
      setIsSubmittingWithdrawal(false);
      if (res.success) {
        toast.success(res.message, { duration: 6000 });
        setWithdrawModalOpen(false);
        setWithdrawAmount("");
      } else {
        toast.error(res.message);
      }
    }, 600);
  };

  const streakMultiplier = credits
    ? credits.current_streak >= 7 ? 3 : credits.current_streak >= 5 ? 2 : credits.current_streak >= 3 ? 1.5 : 1
    : 1;

  const totalCredits = credits?.total_credits ?? 0;
  const nextBadge = badges.find((b) => totalCredits < b.threshold);
  const maxBar = weeklyMock.reduce((m, d) => Math.max(m, d.credits), 1);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 lg:pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">Carbon Wallet</h1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Main credit card */}
            <motion.div
              className="relative p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground overflow-hidden mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-foreground/10 -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-primary-foreground/5 translate-y-6 -translate-x-6" />
              <p className="text-xs font-data uppercase tracking-wider opacity-80">Personal Carbon Credits</p>
              <p className="text-5xl font-display font-bold mt-1 tabular-nums">{totalCredits}</p>
              <p className="text-[10px] font-data opacity-70 mt-1">1 CC = 1 kg CO₂ saved (Indian baseline)</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} />
                  <span className="text-xs font-data">{credits?.current_streak ?? 0} day streak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={14} />
                  <span className="text-xs font-data">{streakMultiplier}x mint bonus</span>
                </div>
              </div>
            </motion.div>

            {/* CASH REWARDS BALANCE CARD (₹2 per 5 scans) */}
            <motion.div
              className="relative p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-emerald-900/60 to-zinc-900 border border-emerald-500/30 text-white overflow-hidden mb-4 shadow-lg"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-data font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1">
                      <Gift size={11} /> Cash Rewards Balance
                    </span>
                    <span className="text-[10px] font-data text-emerald-200/70">₹2 per 5 scans</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-extrabold text-emerald-400 tabular-nums">
                      ₹{rewardState.cashBalance}
                    </span>
                    <span className="text-xs font-data text-emerald-200/80">
                      (Lifetime: ₹{rewardState.totalEarned})
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/70 mt-1">
                    Progress: <strong className="text-emerald-300">{rewardState.milestoneCount} / 5 scans</strong> completed for next ₹2
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setWithdrawAmount(rewardState.cashBalance > 0 ? String(rewardState.cashBalance) : "2");
                      setWithdrawModalOpen(true);
                    }}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-display font-bold text-sm shadow-md hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Wallet size={16} />
                    <span>UPI Withdrawal</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-emerald-500/20">
                <div className="flex justify-between text-[11px] font-data text-emerald-200/80 mb-1.5">
                  <span>5-Scan Milestone Progress</span>
                  <span>{rewardState.milestoneCount} / 5 Scans</span>
                </div>
                <div className="h-2 rounded-full bg-emerald-950/80 overflow-hidden border border-emerald-500/20">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${(rewardState.milestoneCount / 5) * 100}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* CO₂ Reservoir — pending grams toward next CC */}
            {(() => {
              const pendingG = Number(credits?.co2_pending_g) || 0;
              const lifetimeG = Number(credits?.co2_saved_g) || 0;
              const pct = Math.min(100, (pendingG / G_PER_CC) * 100);
              const eq = co2Equivalents(lifetimeG);
              const tonneCC = verifiedTonneCC(lifetimeG);
              return (
                <motion.div
                  className="p-4 rounded-2xl glass-card mb-4"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-data text-muted-foreground uppercase tracking-wider">CO₂ Reservoir</p>
                    <span className="text-[10px] font-data text-primary">
                      {Math.round(pendingG)} / {G_PER_CC} g → next CC
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden mb-3">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-base font-display font-bold text-foreground tabular-nums">
                        {(lifetimeG / 1000).toFixed(2)}
                      </p>
                      <p className="text-[9px] font-data text-muted-foreground">kg CO₂ lifetime</p>
                    </div>
                    <div>
                      <p className="text-base font-display font-bold text-foreground tabular-nums">
                        {tonneCC.toFixed(4)}
                      </p>
                      <p className="text-[9px] font-data text-muted-foreground">verified tonne CC</p>
                    </div>
                    <div>
                      <p className="text-base font-display font-bold text-foreground tabular-nums">
                        {Math.round(eq.bottlesEquivalent)}
                      </p>
                      <p className="text-[9px] font-data text-muted-foreground">bottles equiv.</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] font-data text-muted-foreground">
                    <span className="flex items-center gap-1"><Leaf size={11} className="text-category-compost" />{eq.treeDays.toFixed(0)} tree-days</span>
                    <span>≈ {eq.carKm.toFixed(2)} km of car emissions avoided</span>
                  </div>
                </motion.div>
              );
            })()}

            {/* Streak & multiplier */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <motion.div className="p-4 rounded-xl glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <Flame size={18} className="text-destructive mb-2" />
                <p className="text-2xl font-display font-bold text-foreground">{credits?.current_streak ?? 0}</p>
                <p className="text-[10px] font-data text-muted-foreground">Current Streak</p>
              </motion.div>
              <motion.div className="p-4 rounded-xl glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <Trophy size={18} className="text-category-upcycle mb-2" />
                <p className="text-2xl font-display font-bold text-foreground">{credits?.longest_streak ?? 0}</p>
                <p className="text-[10px] font-data text-muted-foreground">Longest Streak</p>
              </motion.div>
            </div>

            {/* Weekly graph */}
            <motion.div
              className="p-4 rounded-xl glass-card mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-bold text-foreground">This Week</h3>
                <TrendingUp size={14} className="text-primary" />
              </div>
              <div className="flex items-end justify-between gap-2 h-28">
                {weeklyMock.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className="w-full rounded-t-md bg-primary/20"
                      style={{ height: `${(d.credits / maxBar) * 100}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                    >
                      <div
                        className="w-full h-full rounded-t-md bg-primary"
                        style={{ opacity: 0.4 + (d.credits / maxBar) * 0.6 }}
                      />
                    </motion.div>
                    <span className="text-[9px] font-data text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Badges */}
            <div className="mb-6">
              <h3 className="text-sm font-display font-bold text-foreground mb-3">Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, i) => {
                  const Icon = badge.icon;
                  const earned = totalCredits >= badge.threshold;
                  return (
                    <motion.div
                      key={badge.name}
                      className={`p-4 rounded-xl border ${
                        earned ? "glass-card border-primary/30" : "bg-muted/30 border-border opacity-50"
                      }`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: earned ? 1 : 0.5, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <Icon size={20} className={earned ? badge.color : "text-muted-foreground"} />
                      <p className="text-xs font-display font-bold text-foreground mt-2">{badge.name}</p>
                      <p className="text-[10px] font-data text-muted-foreground">{badge.threshold} CC</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Next milestone */}
            {nextBadge && (
              <motion.div
                className="p-4 rounded-xl glass-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs font-data text-muted-foreground uppercase tracking-wider mb-2">Next Milestone</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-display font-bold text-foreground">{nextBadge.name}</span>
                  <span className="text-xs font-data text-primary">{totalCredits}/{nextBadge.threshold} CC</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalCredits / nextBadge.threshold) * 100)}%` }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />
                </div>
              </motion.div>
            )}

            {/* CO₂ savings table (Indian baseline) */}
            <div className="mt-6 p-4 rounded-xl glass-card">
              <p className="text-xs font-data text-muted-foreground uppercase tracking-wider mb-1">CO₂ Saved per Item</p>
              <p className="text-[10px] text-muted-foreground mb-3">Verified drop-offs earn ×2. 1,000 g = 1 CC.</p>
              <div className="space-y-2">
                {[
                  { key: "recyclable",  color: "bg-category-recycle" },
                  { key: "compostable", color: "bg-category-compost" },
                  { key: "upcyclable",  color: "bg-category-upcycle" },
                  { key: "hazardous",   color: "bg-category-hazard" },
                  { key: "landfill",    color: "bg-category-landfill" },
                ].map((r) => {
                  const p = CO2_PROFILE[r.key as keyof typeof CO2_PROFILE];
                  return (
                    <div key={r.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${r.color} flex-shrink-0`} />
                        <span className="text-xs text-foreground">{p.label}</span>
                        <span className="text-[10px] text-muted-foreground truncate">· {p.example}</span>
                      </div>
                      <span className="text-xs font-data text-primary font-bold tabular-nums flex-shrink-0">
                        +{p.gPerItem} g
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verified Drop-offs */}
            <div className="mt-6 p-4 rounded-xl glass-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-data text-muted-foreground uppercase tracking-wider">Verified Drop-offs</p>
                <span className="text-xs font-data text-category-compost font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> {verifiedCount}
                </span>
              </div>
              {verifiedRecent.length === 0 ? (
                <p className="text-xs text-muted-foreground">Log a drop-off at a facility to earn ×2 CO₂ credit.</p>
              ) : (
                <div className="space-y-2">
                  {verifiedRecent.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-data bg-category-compost/15 text-category-compost border border-category-compost/30 flex-shrink-0">
                          Verified ✓
                        </span>
                        <span className="text-foreground truncate">{v.item_name}</span>
                      </div>
                      <span className="font-data text-primary font-bold flex-shrink-0 tabular-nums">
                        +{Math.round((Number(v.carbon_saved) || 0) * 1000)}g CO₂
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* UPI WITHDRAWAL MODAL */}
      <AnimatePresence>
        {withdrawModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl relative"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
            >
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">UPI Cash Withdrawal</h3>
                  <p className="text-xs text-muted-foreground">Transfer scan rewards directly to your UPI app</p>
                </div>
              </div>

              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs font-data">
                <span className="text-muted-foreground">Available Cash Balance:</span>
                <span className="text-emerald-400 font-bold text-base tabular-nums">₹{rewardState.cashBalance}</span>
              </div>

              <form onSubmit={handleUPIWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-xs font-data text-muted-foreground mb-1">
                    UPI ID (e.g. 9876543210@paytm / user@upi)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mobile@paytm or name@okicici"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-sm text-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-data text-muted-foreground">
                      Withdrawal Amount (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(rewardState.cashBalance))}
                      className="text-[11px] font-data text-emerald-400 hover:underline"
                    >
                      Use Max (₹{rewardState.cashBalance})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={rewardState.cashBalance || 100}
                    step="1"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-sm text-foreground focus:outline-none focus:border-emerald-500 transition-colors tabular-nums"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-display font-bold text-sm border border-border hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingWithdrawal || rewardState.cashBalance <= 0}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-display font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingWithdrawal ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>Transfer ₹{withdrawAmount || "0"}</span>
                        <ArrowUpRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarbonWallet;
