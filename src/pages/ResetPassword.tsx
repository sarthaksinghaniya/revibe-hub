import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Password updated!");
      setTimeout(() => navigate("/scan"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={48} className="text-primary mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Password Updated</h2>
          <p className="text-sm text-muted-foreground">Redirecting you now…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Leaf size={20} className="text-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground">W2W</span>
        </Link>

        <div className="p-6 rounded-2xl glass-card">
          <h2 className="text-xl font-display font-bold text-foreground mb-1 text-center">Set New Password</h2>
          <p className="text-xs text-muted-foreground text-center mb-6">Enter your new password below</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold disabled:opacity-50 transition-opacity"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Update Password
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
