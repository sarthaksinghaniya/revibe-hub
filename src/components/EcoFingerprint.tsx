import { useMemo } from "react";
import { motion } from "framer-motion";

interface EcoFingerprintProps {
  recyclable: number;
  compostable: number;
  hazardous: number;
  landfill: number;
  upcyclable: number;
  showLegend?: boolean;
}

export const EcoFingerprint = ({
  recyclable,
  compostable,
  hazardous,
  landfill,
  upcyclable,
  showLegend = true,
}: EcoFingerprintProps) => {
  const total = recyclable + compostable + hazardous + landfill + upcyclable || 1;

  // Strict non-intersecting concentric geometry
  const rings = useMemo(() => {
    const categories = [
      { value: recyclable, color: "hsl(var(--cat-recycle))", label: "Recycle" },
      { value: compostable, color: "hsl(var(--cat-compost))", label: "Compost" },
      { value: hazardous, color: "hsl(var(--cat-hazard))", label: "Hazardous" },
      { value: landfill, color: "hsl(var(--cat-landfill))", label: "Landfill" },
      { value: upcyclable, color: "hsl(var(--cat-upcycle))", label: "Upcycle" },
    ];

    return categories.map((cat, i) => {
      const ratio = Math.max(0.12, cat.value / total);
      // Enforce strict radial clearance between concentric arcs (rx: 20 + i*14, ry: 28 + i*19)
      const rx = 20 + i * 14;
      const ry = 28 + i * 19;
      // Approximate ellipse perimeter for smooth dash array
      const perimeter = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
      const dashLength = Math.max(12, perimeter * ratio);

      return {
        ...cat,
        rx,
        ry,
        perimeter,
        dashLength,
      };
    });
  }, [recyclable, compostable, hazardous, landfill, upcyclable, total]);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 240" className="w-48 h-56">
        {/* Concentric non-intersecting animated category rings */}
        {rings.map((ring, i) => {
          const isVisible = ring.value > 0;
          return (
            <g key={ring.label}>
              {/* Subtle background guide ring */}
              <ellipse
                cx="100"
                cy="120"
                rx={ring.rx}
                ry={ring.ry}
                fill="none"
                stroke={ring.color}
                strokeWidth="1"
                strokeOpacity={0.12}
              />

              {/* Synchronized non-intersecting arc pulse */}
              {isVisible && (
                <motion.ellipse
                  cx="100"
                  cy="120"
                  rx={ring.rx}
                  ry={ring.ry}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${ring.dashLength} ${ring.perimeter - ring.dashLength}`}
                  initial={{ strokeDashoffset: ring.perimeter }}
                  animate={{
                    strokeDashoffset: [ring.perimeter, 0, -ring.perimeter],
                  }}
                  transition={{
                    duration: 6 + i * 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  opacity={0.85}
                />
              )}
            </g>
          );
        })}

        {/* Center core pulse */}
        <motion.circle
          cx="100"
          cy="120"
          r="5"
          fill="hsl(var(--primary))"
          opacity={0.9}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="100" cy="120" r="2.5" fill="hsl(var(--background))" />
      </svg>

      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
          {rings
            .filter((r) => r.value > 0)
            .map((ring) => (
              <div key={ring.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ring.color }} />
                <span className="text-[9px] font-data text-muted-foreground">
                  {ring.label} ({ring.value})
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default EcoFingerprint;
