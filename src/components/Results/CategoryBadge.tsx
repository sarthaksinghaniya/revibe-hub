import { motion } from "framer-motion";

type Category = "Recyclable" | "Compostable" | "Hazardous" | "Landfill" | "Upcyclable";

const categoryConfig: Record<Category, { color: string; glow: string }> = {
  Recyclable: { color: "bg-category-recycle", glow: "shadow-[0_0_12px_hsl(217,91%,60%,0.5)]" },
  Compostable: { color: "bg-category-compost", glow: "shadow-[0_0_12px_hsl(84,81%,44%,0.5)]" },
  Hazardous: { color: "bg-category-hazard", glow: "shadow-[0_0_12px_hsl(24,95%,53%,0.5)]" },
  Landfill: { color: "bg-category-landfill", glow: "shadow-[0_0_12px_hsl(220,9%,46%,0.3)]" },
  Upcyclable: { color: "bg-category-upcycle", glow: "shadow-[0_0_12px_hsl(271,81%,56%,0.5)]" },
};

const CategoryBadge = ({ category }: { category: Category }) => {
  const config = categoryConfig[category];
  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-data font-bold uppercase tracking-wider ${config.color} ${config.glow} text-foreground`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
    >
      {category}
    </motion.span>
  );
};

export default CategoryBadge;
