import { useState } from "react";
import { motion } from "framer-motion";
import { UserMinus, Search, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MemberStat } from "./Leaderboard";

interface StudentManagementProps {
  orgId: string;
  members: MemberStat[];
  onMemberRemoved: () => void;
}

const StudentManagement = ({ orgId, members, onMemberRemoved }: StudentManagementProps) => {
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = members.filter((m) =>
    m.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async (userId: string) => {
    setRemoving(userId);
    try {
      const { error } = await supabase.rpc("remove_org_member", {
        _org_id: orgId,
        _member_user_id: userId,
      });
      if (error) throw error;
      toast.success("Student removed from organization");
      setConfirmId(null);
      onMemberRemoved();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove student");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <motion.div
      className="p-5 rounded-xl glass-card mt-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-sm font-display font-bold text-foreground mb-4">Manage Students</h3>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No students found</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filtered.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {member.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-bold text-foreground truncate">
                  {member.display_name}
                </p>
                <p className="text-[10px] font-data text-muted-foreground">
                  {member.total_scans} scans • {member.total_co2.toFixed(1)}kg CO₂
                </p>
              </div>

              {confirmId === member.user_id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRemove(member.user_id)}
                    disabled={removing === member.user_id}
                    className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold disabled:opacity-50"
                  >
                    {removing === member.user_id ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(member.user_id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove student"
                >
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default StudentManagement;
