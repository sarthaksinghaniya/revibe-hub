import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, User, ArrowRight, Building2, GraduationCap, UserCircle, School, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const accountTypes = [
  { value: "individual", label: "Individual", icon: UserCircle, desc: "Personal use" },
  { value: "student", label: "Student", icon: GraduationCap, desc: "Carbon credits" },
  { value: "company", label: "Company", icon: Building2, desc: "Team dashboard" },
  { value: "school", label: "School", icon: School, desc: "Classroom tracking" },
];

type View = "login" | "signup" | "forgot";

const Auth = () => {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState("individual");
  const [schoolCode, setSchoolCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (view === "login") {
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate("/scan");
      } else if (view === "signup") {
        await signUp(email, password, displayName, accountType);
        // If student with school code, auto-join the school org
        if ((accountType === "student" || accountType === "school") && schoolCode.trim()) {
          try {
            // Small delay to let auth settle
            await new Promise(r => setTimeout(r, 500));
            const { error: joinErr } = await supabase.rpc("join_org_by_code", { _invite_code: schoolCode.trim() });
            if (joinErr) toast.error("Could not join school: " + joinErr.message);
            else toast.success("Joined your school successfully!");
          } catch {}
        }
        toast.success("Account created! Welcome to W2W!");
        navigate("/scan");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email!");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const title = view === "login" ? "Welcome Back" : view === "signup" ? "Create Account" : "Reset Password";
  const subtitle = view === "login"
    ? "Sign in to continue scanning"
    : view === "signup"
    ? "Join the W2W community"
    : "Enter your email and we'll send a reset link";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Leaf size={20} className="text-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground">W2W</span>
        </Link>

        <div className="p-6 rounded-2xl glass-card">
          {view !== "login" && (
            <button
              onClick={() => setView("login")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={12} />
              Back to login
            </button>
          )}

          <h2 className="text-xl font-display font-bold text-foreground mb-1 text-center">{title}</h2>
          <p className="text-xs text-muted-foreground text-center mb-6">{subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup-only fields */}
            {view === "signup" && (
              <>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <p className="text-xs font-data text-muted-foreground mb-2 uppercase tracking-wider">Account Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {accountTypes.map((t) => {
                      const Icon = t.icon;
                      const selected = accountType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setAccountType(t.value)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          <Icon size={16} />
                          <div>
                            <p className="text-xs font-display font-bold">{t.label}</p>
                            <p className="text-[10px] font-data">{t.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* School code for students */}
                {(accountType === "student" || accountType === "school") && (
                  <div className="relative">
                    <School size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="School / University code"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">Ask your school admin for the code</p>
                  </div>
                )}
              </>
            )}

            {/* Email — always shown */}
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Password — not on forgot */}
            {view !== "forgot" && (
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Forgot password link on login */}
            {view === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-xs text-primary hover:underline font-display"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold disabled:opacity-50 transition-opacity"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {view === "login" ? "Sign In" : view === "signup" ? "Create Account" : "Send Reset Link"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle login/signup */}
          {view !== "forgot" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              {view === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setView(view === "login" ? "signup" : "login")}
                className="text-primary font-display font-bold hover:underline"
              >
                {view === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
