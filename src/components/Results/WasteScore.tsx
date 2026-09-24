import { motion } from "framer-motion";

const WasteScore = ({ score }: { score: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return "stroke-category-compost";
    if (s >= 40) return "stroke-destructive";
    return "stroke-category-hazard";
  };

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          className="stroke-border"
          strokeWidth="6"
        />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          className={getColor(score)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-foreground tabular-nums">{score}</span>
        <span className="text-[8px] font-data text-muted-foreground uppercase">Score</span>
      </div>
    </div>
  );
};

export default WasteScore;
