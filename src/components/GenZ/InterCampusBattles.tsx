import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, Building2, Flame, Users, Check, Award } from "lucide-react";
import { toast } from "sonner";

interface CampusRank {
  id: string;
  name: string;
  shortCode: string;
  city: string;
  totalScans: number;
  co2SavedKg: number;
  studentsCount: number;
  rank: number;
}

const INDIAN_CAMPUSES: CampusRank[] = [
  { id: "iitb", name: "IIT Bombay", shortCode: "IIT-B", city: "Mumbai", totalScans: 4820, co2SavedKg: 1240.5, studentsCount: 840, rank: 1 },
  { id: "iitd", name: "IIT Delhi", shortCode: "IIT-D", city: "New Delhi", totalScans: 4410, co2SavedKg: 1110.2, studentsCount: 760, rank: 2 },
  { id: "bits", name: "BITS Pilani", shortCode: "BITS", city: "Pilani", totalScans: 3950, co2SavedKg: 980.0, studentsCount: 620, rank: 3 },
  { id: "du", name: "Delhi University (DU)", shortCode: "DU", city: "Delhi", totalScans: 3200, co2SavedKg: 810.4, studentsCount: 910, rank: 4 },
  { id: "vit", name: "VIT Vellore", shortCode: "VIT", city: "Vellore", totalScans: 2890, co2SavedKg: 720.1, studentsCount: 540, rank: 5 },
];

export const InterCampusBattles = () => {
  const [selectedCampus, setSelectedCampus] = useState<string>("iitb");

  const handleJoinCampus = (campusName: string, campusId: string) => {
    setSelectedCampus(campusId);
    toast.success(`🎉 You joined the ${campusName} Waste Battle Team! Scans will now count towards your campus rank.`, {
      duration: 5000,
    });
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border shadow-md my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-data font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Swords size={12} /> Gen-Z Inter-Campus Battles
            </span>
            <span className="text-[10px] font-data text-muted-foreground">India Colleges 🇮🇳</span>
          </div>
          <h3 className="text-xl font-display font-bold text-foreground">University Waste Leaderboard</h3>
          <p className="text-xs text-muted-foreground">Which campus will save the most CO₂ this month?</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-alt border border-border text-xs font-data">
          <Flame size={14} className="text-destructive" />
          <span className="text-foreground font-bold">Season 4 Active</span>
        </div>
      </div>

      {/* Leaderboard Grid */}
      <div className="space-y-2.5">
        {INDIAN_CAMPUSES.map((campus) => {
          const isSelected = selectedCampus === campus.id;
          return (
            <motion.div
              key={campus.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-primary/10 border-primary/40 shadow-sm"
                  : "bg-surface-alt/60 border-border hover:border-primary/20"
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div className={`w-8 h-8 rounded-xl font-display font-extrabold text-sm flex items-center justify-center flex-shrink-0 ${
                  campus.rank === 1
                    ? "bg-amber-500 text-zinc-950 shadow-md"
                    : campus.rank === 2
                    ? "bg-zinc-300 text-zinc-950"
                    : campus.rank === 3
                    ? "bg-amber-700 text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  #{campus.rank}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-display font-bold text-foreground">{campus.name}</h4>
                    <span className="text-[10px] font-data text-muted-foreground">{campus.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-data text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Users size={11} className="text-primary" /> {campus.studentsCount} students
                    </span>
                    <span>•</span>
                    <span className="text-primary font-bold">{campus.totalScans} Scans</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-sm font-display font-bold text-emerald-400 tabular-nums">
                    {campus.co2SavedKg.toFixed(1)} kg
                  </span>
                  <span className="text-[9px] font-data text-muted-foreground block">CO₂ Offset</span>
                </div>

                <button
                  onClick={() => handleJoinCampus(campus.name, campus.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground border border-border hover:border-primary/30"
                  }`}
                >
                  {isSelected ? (
                    <><Check size={13} /> Team Joined</>
                  ) : (
                    "Join Team"
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InterCampusBattles;
