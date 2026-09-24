import { motion } from "framer-motion";
import { Users, BarChart3, Leaf } from "lucide-react";

interface OrgStatsProps {
  memberCount: number;
  totalScans: number;
  totalCo2: number;
}

const OrgStats = ({ memberCount, totalScans, totalCo2 }: OrgStatsProps) => {
  const stats = [
    { label: "Students", value: memberCount, icon: Users, color: "text-category-recycle" },
    { label: "Total Scans", value: totalScans, icon: BarChart3, color: "text-category-compost" },
    { label: "CO₂ Saved", value: `${totalCo2}kg`, icon: Leaf, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            className="p-4 rounded-xl glass-card text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Icon size={18} className={`${stat.color} mx-auto mb-2`} />
            <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-[9px] font-data text-muted-foreground">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OrgStats;
