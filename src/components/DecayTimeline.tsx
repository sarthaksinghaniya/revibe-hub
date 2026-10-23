import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Share2, Sparkles, CheckCircle2, AlertTriangle, Copy, History } from "lucide-react";
import { toast } from "sonner";

export interface DecayItem {
  name: string;
  time: string;
  years: number;
  emoji: string;
  fact: string;
  color: string;
  category: "organic" | "paper" | "textile" | "composite" | "metal" | "plastic" | "glass";
}

export const decayData: DecayItem[] = [
  { name: "Banana Peel", time: "2 weeks", years: 0.04, emoji: "🍌", fact: "Composting produces rich humus, enriching topsoil within days.", color: "hsl(var(--cat-compost))", category: "organic" },
  { name: "Newspaper", time: "6 weeks", years: 0.12, emoji: "📰", fact: "Recycling a newspaper saves a tree that filters 27 kg of pollutants annually.", color: "hsl(var(--cat-recycle))", category: "paper" },
  { name: "Cotton T-shirt", time: "6 months", years: 0.5, emoji: "👕", fact: "Natural cotton fibers degrade quickly, but synthetic blends last centuries.", color: "hsl(var(--cat-upcycle))", category: "textile" },
  { name: "Milk Carton", time: "5 years", years: 5, emoji: "🥛", fact: "Polyethylene film sandwiching paperboard prevents natural soil bacteria from digesting it.", color: "hsl(var(--cat-recycle))", category: "composite" },
  { name: "Cigarette Butt", time: "10 years", years: 10, emoji: "🚬", fact: "Cellulose acetate filters leach arsenic, lead, and nicotine into waterways.", color: "hsl(var(--cat-hazard))", category: "plastic" },
  { name: "Tin Can", time: "50 years", years: 50, emoji: "🥫", fact: "Steel corrodes in wet soil, but recycling saves 75% of virgin mining energy.", color: "hsl(var(--cat-recycle))", category: "metal" },
  { name: "Aluminium Can", time: "200 years", years: 200, emoji: "🥤", fact: "Aluminium never loses its elemental strength and can be recycled infinitely.", color: "hsl(var(--cat-recycle))", category: "metal" },
  { name: "Plastic Bottle", time: "450 years", years: 450, emoji: "🧴", fact: "PET polymer bonds resist bacteria. It only micro-fragments under UV sunlight.", color: "hsl(var(--cat-landfill))", category: "plastic" },
  { name: "Styrofoam Cup", time: "500 years", years: 500, emoji: "☕", fact: "Polystyrene cannot be digested by any living organism and persists indefinitely.", color: "hsl(var(--cat-landfill))", category: "plastic" },
  { name: "Glass Bottle", time: "1 million years", years: 1000000, emoji: "🍾", fact: "Composed of silica sand; ancient Egyptian glass artifacts are still intact today.", color: "hsl(var(--cat-recycle))", category: "glass" },
];

export function getDecompositionYear(years: number, fromYear = 2026): number {
  if (years >= 100000) return fromYear + 1000000;
  return Math.round(fromYear + years);
}

export function getHumanGenerations(years: number): number {
  if (years < 1) return 0;
  return Math.max(1, Math.round(years / 25)); // ~25 years per human generation
}

export function isDecomposedByYear(years: number, targetYear: number, fromYear = 2026): boolean {
  const elapsed = targetYear - fromYear;
  return elapsed >= years;
}

const getLogPosition = (years: number): number => {
  if (years <= 0) return 0;
  const minLog = Math.log10(0.04);
  const maxLog = Math.log10(1000000);
  const pos = (Math.log10(years) - minLog) / (maxLog - minLog);
  return Math.max(0, Math.min(100, pos * 100));
};

const DecayTimeline = () => {
  const currentYear = 2026;
  const [selected, setSelected] = useState<number | null>(7); // Default to Plastic Bottle
  const [mode, setMode] = useState<"standard" | "timemachine">("timemachine");
  const [travelYear, setTravelYear] = useState<number>(2476);

  const selectedItem = selected !== null ? decayData[selected] : null;

  const copyImpactQuote = (item: DecayItem) => {
    const decayYear = getDecompositionYear(item.years, currentYear);
    const gens = getHumanGenerations(item.years);
    const yearText = item.years >= 100000 ? "1 Million+ Years AD" : `${decayYear} AD`;
    const quote = `Did you know? If you throw a ${item.name} today in ${currentYear}, it won't fully decompose until ${yearText} (${gens > 0 ? `${gens} human generations` : "a few weeks"})! Scan and divert waste with W2W.`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(quote);
      toast.success("📋 Impact stat copied! Ready to share on social media.");
    }
  };

  return (
    <div className="w-full rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-data text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 tracking-[0.15em] uppercase font-bold">
              Time Machine Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-tight">
            How long does your <span className="text-primary">trash</span> last?
          </h2>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-muted/80 border border-border/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("timemachine")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
              mode === "timemachine"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock size={13} />
            <span>Time Machine</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("standard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${
              mode === "standard"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History size={13} />
            <span>Lifespan Scale</span>
          </button>
        </div>
      </div>

      {mode === "timemachine" ? (
        /* Time Machine Century Scrubber */
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-alt/70 border border-primary/20 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] font-data text-muted-foreground uppercase tracking-wider">
                  W2W Future Calendar Simulation
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-display font-black text-primary font-data tracking-tight">
                    {travelYear} AD
                  </span>
                  <span className="text-xs font-data text-muted-foreground">
                    (+{travelYear - currentYear} years from now)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-display font-bold text-foreground block">
                  ~{getHumanGenerations(travelYear - currentYear)} Generations
                </span>
                <span className="text-[10px] font-data text-muted-foreground">into the future</span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={2026}
              max={3000}
              step={5}
              value={travelYear}
              onChange={(e) => setTravelYear(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-data text-muted-foreground mt-2">
              <span>Today (2026)</span>
              <span>2250 AD</span>
              <span>2500 AD</span>
              <span>2750 AD</span>
              <span>3000 AD</span>
            </div>
          </div>

          {/* Time Machine Status Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {decayData.map((item, i) => {
              const decomposed = isDecomposedByYear(item.years, travelYear, currentYear);
              const decayYear = getDecompositionYear(item.years, currentYear);
              const isSelected = selected === i;

              return (
                <button
                  key={item.name}
                  onClick={() => setSelected(i)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : decomposed
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                      : "border-border/60 bg-card hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{item.emoji}</span>
                    {decomposed ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-data text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.5 rounded">
                        <CheckCircle2 size={10} /> Gone
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[9px] font-data text-amber-400 font-bold bg-amber-500/15 px-1.5 py-0.5 rounded">
                        <AlertTriangle size={10} /> Intact
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-display font-bold text-foreground truncate">{item.name}</p>
                  <p className="text-[10px] font-data text-muted-foreground mt-0.5">
                    {decomposed ? `Vanished ~${decayYear} AD` : `Lasts till ${decayYear} AD`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard Logarithmic Scale Timeline */
        <div className="relative">
          <div className="flex justify-between text-[9px] font-data text-muted-foreground mb-3 px-1">
            <span>2 weeks</span>
            <span>1 year</span>
            <span>50 yrs</span>
            <span>500 yrs</span>
            <span>1M years</span>
          </div>

          {/* Track */}
          <div className="relative h-3 rounded-full bg-gradient-to-r from-category-compost/30 via-category-hazard/30 to-category-landfill/40 overflow-visible mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-category-compost/40 via-category-hazard/30 to-category-landfill/50" />

            {decayData.map((item, i) => {
              const pos = getLogPosition(item.years);
              const isSelected = selected === i;
              return (
                <button
                  key={item.name}
                  className="absolute top-1/2 -translate-y-1/2 z-10 group"
                  style={{ left: `${pos}%` }}
                  onClick={() => setSelected(i)}
                  title={`${item.name}: ${item.time}`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[10px] cursor-pointer shadow-md"
                    style={{ backgroundColor: item.color }}
                    animate={isSelected ? { scale: [1, 1.3, 1.2], boxShadow: `0 0 14px ${item.color}` } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
              );
            })}
          </div>

          {/* Grid of items */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {decayData.map((item, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={item.name}
                  onClick={() => setSelected(i)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary/50 bg-primary/10 shadow-sm"
                      : "border-border/50 bg-card hover:bg-card/90"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{item.emoji}</span>
                    <span className="text-[11px] font-display font-bold text-foreground truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-data text-muted-foreground">{item.time}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Item Detail Card */}
      <AnimatePresence mode="wait">
        {selectedItem && (
          <motion.div
            key={selectedItem.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-6 p-5 rounded-2xl border border-primary/25 bg-card/90 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="text-3xl p-2 rounded-2xl bg-surface-alt border border-border">
                  {selectedItem.emoji}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-display font-bold text-foreground">{selectedItem.name}</h3>
                    <span
                      className="text-[10px] font-data font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${selectedItem.color}20`, color: selectedItem.color }}
                    >
                      Takes {selectedItem.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    {selectedItem.fact}
                  </p>
                </div>
              </div>

              {/* Share button */}
              <button
                onClick={() => copyImpactQuote(selectedItem)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors text-xs font-display font-semibold self-end sm:self-auto"
                title="Copy Impact Fact to Clipboard"
              >
                <Copy size={13} className="text-primary" />
                <span>Share Stat</span>
              </button>
            </div>

            {/* Generational impact banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-border/60">
              <div className="p-2.5 rounded-xl bg-surface-alt/70 border border-border/50">
                <span className="text-[10px] font-data text-muted-foreground block">Decomposes In</span>
                <span className="text-sm font-display font-bold text-foreground">{selectedItem.time}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-alt/70 border border-border/50">
                <span className="text-[10px] font-data text-muted-foreground block">Projected Year</span>
                <span className="text-sm font-data font-bold text-primary">
                  {selectedItem.years >= 100000 ? "1M+ AD" : `${getDecompositionYear(selectedItem.years, currentYear)} AD`}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-alt/70 border border-border/50">
                <span className="text-[10px] font-data text-muted-foreground block">Descendant Generations</span>
                <span className="text-sm font-display font-bold text-foreground">
                  ~{getHumanGenerations(selectedItem.years)} Generations
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-alt/70 border border-border/50">
                <span className="text-[10px] font-data text-muted-foreground block">Circular Value</span>
                <span className="text-sm font-data font-bold text-emerald-400">
                  {selectedItem.category === "plastic" || selectedItem.category === "metal" || selectedItem.category === "glass"
                    ? "100% Upcyclable"
                    : "100% Compostable"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DecayTimeline;
