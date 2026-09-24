import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, LogOut, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  accountAllowedInVariant,
  getVariant,
  hasFeature,
  isElectron,
  VARIANT_LABEL,
  type Feature,
} from "@/lib/variant";
import { toast } from "sonner";

// Map of routes → required feature. Routes not listed are always allowed.
const ROUTE_FEATURE: Array<[RegExp, Feature]> = [
  [/^\/scan/, "scanner"],
  [/^\/log/, "mylog"],
  [/^\/marketplace\/new/, "marketplace-list"],
  [/^\/marketplace\/my/, "marketplace-list"],
  [/^\/marketplace/, "marketplace"],
  [/^\/facilities/, "facilities"],
  [/^\/wallet/, "wallet"],
  [/^\/friends/, "friends"],
  [/^\/org/, "org-dashboard"],
];

export const VariantGate = ({ children }: { children: ReactNode }) => {
  const { profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const variant = getVariant();
  const [dismissed, setDismissed] = useState(false);

  // Route gating
  useEffect(() => {
    const match = ROUTE_FEATURE.find(([rx]) => rx.test(location.pathname));
    if (match && !hasFeature(match[1])) {
      toast.error(`Ye feature "${VARIANT_LABEL[variant]}" edition mai available nahi hai`);
      navigate("/", { replace: true });
    }
  }, [location.pathname, variant, navigate]);

  // Account-type vs variant verification
  const verdict = useMemo(
    () => accountAllowedInVariant(profile?.account_type as any, variant),
    [profile?.account_type, variant]
  );

  const showMismatch = !loading && profile && !verdict.ok && !dismissed;

  return (
    <>
      {children}

      {/* Edition badge — only inside Electron */}
      {isElectron() && (
        <div className="fixed bottom-2 right-2 z-[60] pointer-events-none">
          <div className="px-2.5 py-1 rounded-full bg-background/80 backdrop-blur border border-border text-[10px] font-data text-muted-foreground">
            {VARIANT_LABEL[variant]} Edition · v{window.w2w?.appVersion ?? "dev"}
          </div>
        </div>
      )}

      {/* Mismatch modal */}
      {showMismatch && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-destructive/15 flex items-center justify-center mb-4">
              <AlertTriangle className="text-destructive" size={22} />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Wrong Edition
            </h2>
            <p className="text-sm text-muted-foreground mb-1">
              Aapne <span className="font-semibold text-foreground">{VARIANT_LABEL[variant]}</span> edition install kiya hai,
              lekin aapka account{" "}
              <span className="font-semibold text-foreground">
                {profile?.account_type}
              </span>{" "}
              type ka hai.
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Sahi version download karein:{" "}
              <span className="font-semibold text-primary">
                W2W {verdict.expected ? VARIANT_LABEL[verdict.expected] : ""} Edition
              </span>
              .
            </p>
            <div className="flex gap-2">
              <a
                href="/download"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-display font-bold"
              >
                <Download size={14} /> Get correct edition
              </a>
              <button
                onClick={async () => {
                  await signOut();
                  setDismissed(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-display font-semibold"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VariantGate;
