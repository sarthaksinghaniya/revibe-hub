import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DecayItem {
  name: string;
  time: string;
  years: number;
  emoji: string;
  fact: string;
  color: string;
}

const decayData: DecayItem[] = [
  { name: "Banana Peel", time: "2 weeks", years: 0.04, emoji: "🍌", fact: "Composting one banana peel produces enough methane to charge your phone for 30 minutes.", color: "hsl(var(--cat-compost))" },
  { name: "Newspaper", time: "6 weeks", years: 0.12, emoji: "📰", fact: "Recycling a Sunday newspaper saves a tree that filters 27 kg of air pollutants per year.", color: "hsl(var(--cat-recycle))" },
  { name: "Cotton T-shirt", time: "6 months", years: 0.5, emoji: "👕", fact: "Growing cotton for one t-shirt uses 2,700 litres of water — what you drink in 3 years.", color: "hsl(var(--cat-upcycle))" },
  { name: "Milk Carton", time: "5 years", years: 5, emoji: "🥛", fact: "The thin polyethylene lining is why most cartons end up in landfill despite looking recyclable.", color: "hsl(var(--cat-recycle))" },
  { name: "Cigarette Butt", time: "10 years", years: 10, emoji: "🚬", fact: "4.5 trillion butts are littered yearly — the single most common ocean debris found worldwide.", color: "hsl(var(--cat-hazard))" },
  { name: "Tin Can", time: "50 years", years: 50, emoji: "🥫", fact: "Recycling one aluminium can saves enough energy to play 3 hours of music on your speaker.", color: "hsl(var(--cat-recycle))" },
  { name: "Styrofoam Cup", time: "500 years", years: 500, emoji: "☕", fact: "Styrofoam doesn't biodegrade — it photodegrades into smaller toxic particles that enter the food chain.", color: "hsl(var(--cat-landfill))" },
  { name: "Plastic Bottle", time: "450 years", years: 450, emoji: "🧴", fact: "A plastic bottle made today will still exist in the year 2475. Your great×15 grandchildren will inherit it.", color: "hsl(var(--cat-landfill))" },
  { name: "Glass Bottle", time: "1 million years", years: 1000000, emoji: "🍾", fact: "Glass is 100% recyclable and can be recycled endlessly without any loss in quality or purity.", color: "hsl(var(--cat-recycle))" },
];

const getLogPosition = (years: number): number => {
  if (years <= 0) return 0;
  const minLog = Math.log10(0.04);
  const maxLog = Math.log10(1000000);
  const pos = (Math.log10(years) - minLog) / (maxLog - minLog);
  return Math.max(0, Math.min(100, pos * 100));
};

const DecayTimeline = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="w-full">
      {/* Title area */}
      <div className="mb-8">
        <p className="text-[10px] font-data text-muted-foreground uppercase tracking-[0.2em] mb-2">
          ☠ Decomposition timeline
        </p>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-tight">
          How long does your
          <br />
          <span className="text-primary">trash</span> actually last?
        </h2>
      </div>

      {/* The timeline visual */}
      <div className="relative">
        {/* Time markers */}
        <div className="flex justify-between text-[9px] font-data text-muted-foreground mb-3 px-1">
          <span>2 weeks</span>
          <span>1 year</span>
          <span>50 yrs</span>
          <span>1M years</span>
        </div>

        {/* Track */}
        <div className="relative h-3 rounded-full bg-gradient-to-r from-category-compost/20 via-category-hazard/20 to-category-landfill/30 overflow-visible">
          {/* Gradient fill */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-category-compost/40 via-category-hazard/30 to-category-landfill/50" />
          
          {/* Dots on timeline */}
          {decayData.map((item, i) => {
            const pos = getLogPosition(item.years);
            const isSelected = selected === i;
            return (
              <motion.button
                key={item.name}
                className="absolute top-1/2 -translate-y-1/2 z-10 group"
                style={{ left: `${pos}%` }}
                onClick={() => setSelected(isSelected ? null : i)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[10px] cursor-pointer"
                  style={{ backgroundColor: item.color }}
                  animate={isSelected ? { scale: [1, 1.2, 1], boxShadow: `0 0 12px ${item.color}` } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="sr-only">{item.name}</span>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Items grid below */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {decayData.map((item, i) => {
            const isSelected = selected === i;
            return (
              <motion.button
                key={item.name}
                onClick={() => setSelected(isSelected ? null : i)}
                className={`relative text-left p-2.5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-primary/40 bg-primary/5 shadow-sm"
                    : "border-transparent bg-card/50 hover:bg-card"
                }`}
                layout
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm leading-none">{item.emoji}</span>
                  <span className="text-[10px] font-display font-bold text-foreground truncate">{item.name}</span>
                </div>
                <span className="text-[10px] font-data text-muted-foreground">{item.time}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Expanded fact card */}
        <AnimatePresence mode="wait">
          {selected !== null && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{decayData[selected].emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h4 className="text-sm font-display font-bold text-foreground">{decayData[selected].name}</h4>
                      <span
                        className="text-[10px] font-data font-bold px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: `${decayData[selected].color}20`, color: decayData[selected].color }}
                      >
                        {decayData[selected].time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{decayData[selected].fact}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DecayTimeline;
