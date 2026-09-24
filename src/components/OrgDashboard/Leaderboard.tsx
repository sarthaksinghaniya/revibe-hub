import { motion } from "framer-motion";
import { Trophy, GraduationCap, TrendingUp } from "lucide-react";

export interface MemberStat {
  user_id: string;
  display_name: string;
  total_scans: number;
  total_credits: number;
  total_co2: number;
}

interface LeaderboardProps {
  members: MemberStat[];
}

const Leaderboard = ({ members }: LeaderboardProps) => {
  return (
    <motion.div
      className="p-5 rounded-xl glass-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-category-upcycle" />
          <h3 className="text-sm font-display font-bold text-foreground">Student Leaderboard</h3>
        </div>
        <GraduationCap size={16} className="text-muted-foreground" />
      </div>

      {members.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          No scans yet. Students need to start scanning!
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
            return (
              <motion.div
                key={member.user_id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  i < 3 ? "bg-primary/5 border border-primary/10" : ""
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-data font-bold flex items-center justify-center shrink-0">
                  {medal || i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold text-foreground truncate">
                    {member.display_name}
                  </p>
                  <p className="text-[10px] font-data text-muted-foreground">
                    {member.total_scans} scans • {member.total_credits} CC •{" "}
                    {member.total_co2.toFixed(1)}kg CO₂
                  </p>
                </div>
                {i < 3 && <TrendingUp size={14} className="text-primary shrink-0" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
