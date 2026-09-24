import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Friend {
  friendshipId: string;
  friendId: string;
  friendName: string;
}

interface ShareScanModalProps {
  open: boolean;
  onClose: () => void;
  scanId: string | null;
  itemName: string;
}

const ShareScanModal = ({ open, onClose, scanId, itemName }: ShareScanModalProps) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && user) fetchFriends();
  }, [open, user]);

  const fetchFriends = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);

    if (!data || data.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const friendIds = data.map((f) =>
      f.requester_id === user!.id ? f.receiver_id : f.requester_id
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", friendIds);

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => { nameMap[p.user_id] = p.display_name || "User"; });

    setFriends(
      data.map((f) => {
        const fId = f.requester_id === user!.id ? f.receiver_id : f.requester_id;
        return { friendshipId: f.id, friendId: fId, friendName: nameMap[fId] || "User" };
      })
    );
    setLoading(false);
  };

  const sendShare = async (friendId: string) => {
    if (!scanId || !user) return;
    setSending(friendId);
    try {
      const { error } = await supabase.from("scan_shares").insert({
        scan_id: scanId,
        from_user_id: user.id,
        to_user_id: friendId,
        message: message.trim() || null,
      });
      if (error) throw error;

      // Update friendship shared timestamps
      const { data: friendship } = await supabase
        .from("friendships")
        .select("*")
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .single();

      if (friendship) {
        const isRequester = friendship.requester_id === user.id;
        const updateField = isRequester ? "requester_last_shared" : "receiver_last_shared";
        const now = new Date().toISOString();

        // Check if both shared today for streak
        const otherLastShared = isRequester ? friendship.receiver_last_shared : friendship.requester_last_shared;
        const otherDate = otherLastShared ? new Date(otherLastShared).toDateString() : null;
        const todayStr = new Date().toDateString();

        const updates: any = {
          [updateField]: now,
          last_interaction_at: now,
        };

        if (otherDate === todayStr) {
          updates.streak_count = (friendship.streak_count || 0) + 1;
        }

        await supabase.from("friendships").update(updates).eq("id", friendship.id);
      }

      setSent((prev) => new Set(prev).add(friendId));
      toast.success(`Shared with ${friends.find((f) => f.friendId === friendId)?.friendName}!`);
    } catch (err: any) {
      toast.error("Failed to share");
    } finally {
      setSending(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl bg-card border border-border p-5 max-h-[70vh] overflow-y-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-foreground">Share Scan</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Share <span className="text-primary font-semibold">{itemName}</span> with a friend
            </p>

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)..."
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
            />

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Add friends first to share scans
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((f) => (
                  <div
                    key={f.friendId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-display font-bold text-primary">
                      {f.friendName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm font-display font-semibold text-foreground truncate">
                      {f.friendName}
                    </span>
                    <button
                      onClick={() => sendShare(f.friendId)}
                      disabled={sent.has(f.friendId) || sending === f.friendId}
                      className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-colors flex items-center gap-1.5 ${
                        sent.has(f.friendId)
                          ? "bg-primary/15 text-primary"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      } disabled:opacity-70`}
                    >
                      {sending === f.friendId ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : sent.has(f.friendId) ? (
                        <><Check size={12} /> Sent</>
                      ) : (
                        <><Send size={12} /> Send</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareScanModal;
