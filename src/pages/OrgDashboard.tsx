import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Copy, School, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import OrgStats from "@/components/OrgDashboard/OrgStats";
import Leaderboard, { type MemberStat } from "@/components/OrgDashboard/Leaderboard";
import StudentManagement from "@/components/OrgDashboard/StudentManagement";
import ExportReport from "@/components/OrgDashboard/ExportReport";
import { isCityKnown } from "@/data/municipalRules";

interface OrgData {
  id: string;
  name: string;
  invite_code: string;
  role: string;
  member_count: number;
  total_scans: number;
  total_co2: number;
  leaderboard: MemberStat[];
}

const OrgDashboard = () => {
  const { user } = useAuth();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [createMode, setCreateMode] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [city, setCity] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    fetchOrg();
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`, { headers: { "Accept-Language": "en" } });
          const j = await r.json();
          setCity(j?.address?.city || j?.address?.town || j?.address?.village || "");
        } catch { /* silent */ }
      },
      () => {}
    );
  }, []);

  const fetchOrg = async () => {
    setLoading(true);
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", user!.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      setOrg(null);
      setLoading(false);
      return;
    }

    const orgId = membership.organization_id;

    const [{ data: orgData }, { data: lb }, { data: stats }] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", orgId).single(),
      supabase.rpc("get_org_leaderboard", { _org_id: orgId }) as any,
      supabase.rpc("get_org_stats", { _org_id: orgId }) as any,
    ]);

    if (!orgData) {
      setOrg(null);
      setLoading(false);
      return;
    }

    const leaderboard: MemberStat[] = ((lb as any[]) || []).map((row: any) => ({
      user_id: row.user_id,
      display_name: row.display_name || "Member",
      total_scans: Number(row.scan_count) || 0,
      total_credits: Number(row.total_credits) || 0,
      total_co2: (Number(row.co2_saved_g) || 0) / 1000,
    }));

    const s = (stats as any[])?.[0];

    setOrg({
      id: orgData.id,
      name: orgData.name,
      invite_code: orgData.invite_code,
      role: membership.role,
      member_count: Number(s?.member_count) || leaderboard.length,
      total_scans: Number(s?.total_scans) || 0,
      total_co2: Math.round(((Number(s?.total_co2_saved_g) || 0) / 1000) * 100) / 100,
      leaderboard,
    });
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!orgName.trim() || !user) return;
    try {
      const { data, error } = await supabase.rpc("create_org", { _name: orgName.trim() });
      if (error) throw error;
      toast.success("Organization created!");
      setCreateMode(false);
      setOrgName("");
      fetchOrg();
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !user) return;
    try {
      const { error } = await supabase.rpc("join_org_by_code", { _invite_code: joinCode.trim() });
      if (error) throw error;
      toast.success("Joined organization!");
      fetchOrg();
    } catch (err: any) {
      toast.error(err.message || "Invalid invite code");
    }
  };

  const copyCode = () => {
    if (org) {
      navigator.clipboard.writeText(org.invite_code);
      toast.success("Invite code copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-6 lg:pt-24 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-6 lg:pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-display font-bold text-foreground mb-6">Organization</h1>
          {!createMode ? (
            <motion.div className="p-6 rounded-2xl glass-card text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Building2 size={32} className="text-primary mx-auto mb-3" />
              <h2 className="text-lg font-display font-bold text-foreground mb-1">No Organization Yet</h2>
              <p className="text-xs text-muted-foreground mb-4">Create a school/company or join one with a code</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setCreateMode(true)} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm">Create Org</button>
                <button onClick={() => setCreateMode(true)} className="px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground border border-border font-display font-bold text-sm">Join with Code</button>
              </div>
            </motion.div>
          ) : (
            <motion.div className="p-6 rounded-2xl glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-sm font-display font-bold text-foreground mb-4">Create or Join</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-data text-muted-foreground">Organization Name</label>
                  <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g., Green School Initiative" className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={handleCreate} className="mt-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm">Create</button>
                </div>
                <div className="border-t border-border pt-4">
                  <label className="text-xs font-data text-muted-foreground">Or Join with Code</label>
                  <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Enter invite code" className="w-full mt-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={handleJoin} className="mt-2 w-full py-2.5 rounded-xl bg-secondary text-secondary-foreground border border-border font-display font-bold text-sm">Join</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  const isAdmin = org.role === "admin";
  // Filter out admin from student list for management
  const students = org.leaderboard.filter((m) => m.user_id !== user?.id);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 lg:pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <School size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{org.name}</h1>
              <p className="text-xs text-muted-foreground font-data">
                {isAdmin ? "Admin" : "Member"} • {org.member_count} members
              </p>
            </div>
          </div>
          {isAdmin && (
            <ExportReport
              orgName={org.name}
              members={org.leaderboard}
              totalScans={org.total_scans}
              totalCo2={org.total_co2}
            />
          )}
        </div>

        {city && isCityKnown(city) && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-category-compost/15 border border-category-compost/30">
            <ShieldCheck size={12} className="text-category-compost" />
            <span className="text-[10px] font-display font-bold text-category-compost uppercase tracking-wider">
              Municipal Compliance Mode: {city}
            </span>
          </div>
        )}

        {isAdmin && (
          <motion.div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div>
              <p className="text-[10px] font-data text-muted-foreground uppercase tracking-wider">Share this code with students</p>
              <p className="text-lg font-display font-bold text-primary tracking-widest">{org.invite_code}</p>
            </div>
            <button onClick={copyCode} className="p-2.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
              <Copy size={16} />
            </button>
          </motion.div>
        )}

        <OrgStats memberCount={org.member_count} totalScans={org.total_scans} totalCo2={org.total_co2} />

        <Leaderboard members={org.leaderboard} />

        {isAdmin && students.length > 0 && (
          <StudentManagement orgId={org.id} members={students} onMemberRemoved={fetchOrg} />
        )}
      </div>
    </div>
  );
};

export default OrgDashboard;
