import { motion } from "framer-motion";

const wasteItems = [
  {
    x: "8%", y: "12%", delay: 0, size: 56,
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4h8l2 6H18l2-6z" fill="hsl(162 55% 42% / 0.2)" stroke="hsl(162 55% 42% / 0.35)" strokeWidth="1.5"/>
        <rect x="16" y="10" width="16" height="30" rx="4" fill="hsl(162 55% 42% / 0.08)" stroke="hsl(162 55% 42% / 0.3)" strokeWidth="1.5"/>
        <path d="M22 40h4v4h-4z" fill="hsl(162 55% 42% / 0.2)"/>
      </svg>
    ),
  },
  {
    x: "78%", y: "18%", delay: 1.2, size: 44,
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="14" fill="hsl(271 65% 60% / 0.08)" stroke="hsl(271 65% 60% / 0.3)" strokeWidth="1.5"/>
        <path d="M24 10v28M10 24h28" stroke="hsl(271 65% 60% / 0.2)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    x: "88%", y: "50%", delay: 0.8, size: 48,
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="8" width="28" height="32" rx="3" fill="hsl(217 78% 62% / 0.08)" stroke="hsl(217 78% 62% / 0.25)" strokeWidth="1.5"/>
        <path d="M10 16h28" stroke="hsl(217 78% 62% / 0.15)" strokeWidth="1"/>
        <rect x="18" y="20" width="12" height="8" rx="1" fill="hsl(217 78% 62% / 0.1)"/>
      </svg>
    ),
  },
  {
    x: "15%", y: "55%", delay: 2.1, size: 38,
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="6" width="12" height="36" rx="6" fill="hsl(24 85% 58% / 0.08)" stroke="hsl(24 85% 58% / 0.3)" strokeWidth="1.5"/>
        <circle cx="24" cy="12" r="2" fill="hsl(24 85% 58% / 0.25)"/>
      </svg>
    ),
  },
  {
    x: "55%", y: "65%", delay: 0.4, size: 50,
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8h16l4 32H12l4-32z" fill="hsl(162 55% 42% / 0.06)" stroke="hsl(162 55% 42% / 0.25)" strokeWidth="1.5"/>
        <circle cx="24" cy="28" r="4" fill="hsl(162 55% 42% / 0.1)" stroke="hsl(162 55% 42% / 0.2)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    x: "35%", y: "20%", delay: 1.6, size: 42,
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 6l16 28H8L24 6z" fill="hsl(24 85% 58% / 0.06)" stroke="hsl(24 85% 58% / 0.25)" strokeWidth="1.5"/>
        <path d="M24 20v8M24 32v2" stroke="hsl(24 85% 58% / 0.3)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const FloatingWaste = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {wasteItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: item.x, top: item.y, width: item.size, height: item.size }}
          animate={{
            y: [0, -12, -6, 0],
            rotate: [0, 3, -2, 0],
          }}
          transition={{
            duration: 7,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.svg}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingWaste;
