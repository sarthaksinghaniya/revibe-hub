import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Flame, Users, Copy, Search, Check, X, Send, Eye, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface FriendRow {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  streak_count: number;
  last_interaction_at: string | null;
  requester_last_shared: string | null;
  receiver_last_shared: string | null;
}

interface FriendDisplay {
  friendshipId: string;
  friendId: string;
  friendName: string;
  streak: number;
  status: string;
  isRequester: boolean;
  lastShared: string | null;
  theyShared: string | null;
}

interface ScanShare {
  id: string;
  scan_id: string;
  from_user_id: string;
  message: string | null;
  seen: boolean;
  created_at: string;
  fromName?: string;
  scanName?: string;
  scanCategory?: string;
}

const Friends = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendDisplay[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendDisplay[]>([]);
  const [incomingShares, setIncomingShares] = useState<ScanShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [addCode, setAddCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"friends" | "requests" | "inbox">("friends");

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchFriends(), fetchIncomingShares()]);
    setLoading(false);
  };

  const fetchFriends = async () => {
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);

    if (!data) return;

    const friendUserIds = data.map((f: FriendRow) =>
      f.requester_id === user!.id ? f.receiver_id : f.requester_id
    );

    // Fetch profiles for all friends
    let profileMap: Record<string, string> = {};
    if (friendUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", friendUserIds);
      if (profiles) {
        profiles.forEach((p) => { profileMap[p.user_id] = p.display_name || "User"; });
      }
    }

    const accepted: FriendDisplay[] = [];
    const pending: FriendDisplay[] = [];

    data.forEach((f: FriendRow) => {
      const isRequester = f.requester_id === user!.id;
      const friendId = isRequester ? f.receiver_id : f.requester_id;
      const display: FriendDisplay = {
        friendshipId: f.id,
        friendId,
        friendName: profileMap[friendId] || "User",
        streak: f.streak_count,
        status: f.status,
        isRequester,
        lastShared: isRequester ? f.requester_last_shared : f.receiver_last_shared,
        theyShared: isRequester ? f.receiver_last_shared : f.requester_last_shared,
      };

      if (f.status === "accepted") accepted.push(display);
      else if (f.status === "pending" && !isRequester) pending.push(display);
    });

    setFriends(accepted);
    setPendingReceived(pending);
  };

  const fetchIncomingShares = async () => {
    const { data } = await supabase
      .from("scan_shares")
      .select("*")
      .eq("to_user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!data || data.length === 0) { setIncomingShares([]); return; }

    // Fetch sender names and scan details
    const fromIds = [...new Set(data.map((s) => s.from_user_id))];
    const scanIds = [...new Set(data.map((s) => s.scan_id))];

    const [{ data: profiles }, { data: scans }] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name").in("user_id", fromIds),
      supabase.from("scan_history").select("id, item_name, category").in("id", scanIds),
    ]);

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => { nameMap[p.user_id] = p.display_name || "User"; });

    const scanMap: Record<string, { name: string; cat: string }> = {};
    scans?.forEach((s) => { scanMap[s.id] = { name: s.item_name, cat: s.category }; });

    setIncomingShares(
      data.map((s) => ({
        ...s,
        fromName: nameMap[s.from_user_id] || "User",
        scanName: scanMap[s.scan_id]?.name || "Unknown",
        scanCategory: scanMap[s.scan_id]?.cat || "",
      }))
    );
  };

  const addFriend = async () => {
    if (!addCode.trim() || !user) return;
    setAdding(true);
    try {
      const normalizedCode = addCode.trim().toUpperCase();

      const { error } = await (supabase.rpc as any)("create_friend_request_by_code", {
        _friend_code: normalizedCode,
      });

      if (error) throw error;
      toast.success("Friend request sent!");
      setAddCode("");
      fetchFriends();
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setAdding(false);
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    toast.success("Friend added!");
    fetchFriends();
  };

  const rejectRequest = async (friendshipId: string) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    toast.success("Request declined");
    fetchFriends();
  };

  const markSeen = async (shareId: string) => {
    await supabase.from("scan_shares").update({ seen: true }).eq("id", shareId);
    setIncomingShares((prev) => prev.map((s) => s.id === shareId ? { ...s, seen: true } : s));
  };

  const copyMyCode = () => {
    if (profile?.friend_code) {
      navigator.clipboard.writeText(profile.friend_code);
      toast.success("Friend code copied!");
    }
  };

  const unseenCount = incomingShares.filter((s) => !s.seen).length;

  const categoryDot: Record<string, string> = {
    recyclable: "bg-category-recycle",
    compostable: "bg-category-compost",
    hazardous: "bg-category-hazard",
    landfill: "bg-category-landfill",
    upcyclable: "bg-category-upcycle",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-6 lg:pt-24 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 lg:pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">Friends</h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-data text-muted-foreground">My code:</span>
            <button
              onClick={copyMyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-data font-bold hover:bg-primary/20 transition-colors"
            >
              {profile?.friend_code || "—"}
              <Copy size={12} />
            </button>
          </div>
        </div>

        {/* Add friend */}
        <motion.div
          className="p-4 rounded-2xl glass-card mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-display font-bold text-foreground mb-2">Add a Friend</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={addCode}
                onChange={(e) => setAddCode(e.target.value.toUpperCase())}
                placeholder="Enter friend code..."
                maxLength={12}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={addFriend}
              disabled={adding || !addCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm disabled:opacity-50 flex items-center gap-2"
            >
              <UserPlus size={14} />
              Add
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl">
          {[
            { key: "friends" as const, label: "Friends", count: friends.length },
            { key: "requests" as const, label: "Requests", count: pendingReceived.length },
            { key: "inbox" as const, label: "Scan Inbox", count: unseenCount },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-display font-bold transition-colors relative ${
                tab === t.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-data ${
                  tab === t.key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Friends list */}
        {tab === "friends" && (
          <div className="space-y-3">
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <Users size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No friends yet. Share your code to get started!</p>
              </div>
            ) : (
              friends.map((f, i) => (
                <motion.div
                  key={f.friendshipId}
                  className="flex items-center gap-4 p-4 rounded-xl glass-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-sm font-display font-bold text-primary flex-shrink-0">
                    {f.friendName.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-foreground truncate">{f.friendName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {f.streak > 0 && (
                        <span className="flex items-center gap-1 text-xs font-data text-destructive">
                          <Flame size={12} /> {f.streak}
                        </span>
                      )}
                      {f.theyShared && (
                        <span className="text-[10px] font-data text-muted-foreground">
                          Shared {new Date(f.theyShared).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Streak fire animation */}
                  {f.streak >= 3 && (
                    <motion.div
                      className="text-2xl"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      🔥
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Pending Requests */}
        {tab === "requests" && (
          <div className="space-y-3">
            {pendingReceived.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              pendingReceived.map((f) => (
                <motion.div
                  key={f.friendshipId}
                  className="flex items-center gap-4 p-4 rounded-xl glass-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-11 h-11 rounded-full bg-category-upcycle/15 flex items-center justify-center text-sm font-display font-bold text-category-upcycle flex-shrink-0">
                    {f.friendName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-foreground">{f.friendName}</p>
                    <p className="text-[10px] font-data text-muted-foreground">wants to be your friend</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(f.friendshipId)}
                      className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => rejectRequest(f.friendshipId)}
                      className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Scan Inbox */}
        {tab === "inbox" && (
          <div className="space-y-3">
            {incomingShares.length === 0 ? (
              <div className="text-center py-12">
                <Send size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No shared scans yet</p>
              </div>
            ) : (
              incomingShares.map((share, i) => (
                <motion.div
                  key={share.id}
                  className={`flex items-center gap-4 p-4 rounded-xl glass-card ${!share.seen ? "border-l-[3px] border-l-primary" : ""}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => !share.seen && markSeen(share.id)}
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${categoryDot[share.scanCategory || ""] || "bg-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-foreground truncate">
                      {share.fromName} scanned <span className="text-primary">{share.scanName}</span>
                    </p>
                    {share.message && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">"{share.message}"</p>
                    )}
                    <p className="text-[10px] font-data text-muted-foreground mt-0.5">
                      {new Date(share.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!share.seen && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
