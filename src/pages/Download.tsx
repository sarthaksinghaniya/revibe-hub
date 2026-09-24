import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Apple, Download as DownloadIcon, Laptop, Smartphone, Leaf, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { VARIANT_LABEL, type Variant } from "@/lib/variant";

type Plat = "windows" | "macos" | "linux" | "android";

const RELEASES_BASE = "/releases";

const PLATFORMS: { id: Plat; label: string; icon: typeof Apple; ext: string }[] = [
  { id: "windows", label: "Windows", icon: Laptop, ext: "win32-x64.zip" },
  { id: "macos", label: "macOS", icon: Apple, ext: "darwin-x64.zip" },
  { id: "linux", label: "Linux", icon: Laptop, ext: "linux-x64.tar.gz" },
  { id: "android", label: "Android APK", icon: Smartphone, ext: "/UpcycleIt.apk" },
];

const VARIANTS: Variant[] = ["individual", "student", "company", "school"];

function detectOS(): Plat {
  if (typeof navigator === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod|mac/.test(ua)) return "macos";
  if (/linux/.test(ua)) return "linux";
  return "windows";
}

const Download = () => {
  const { profile } = useAuth();
  const detectedOS = useMemo(detectOS, []);
  const suggestedVariant: Variant =
    (profile?.account_type as Variant) || "individual";

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={12} /> Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Leaf size={18} className="text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Download W2W App & Builds
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
          Direct desktop download for native Android APK and desktop editions.
          {profile && (
            <>
              {" "}
              Suggested for you:{" "}
              <span className="font-semibold text-primary">
                {VARIANT_LABEL[suggestedVariant]}
              </span>{" "}
              · {PLATFORMS.find((p) => p.id === detectedOS)?.label}
            </>
          )}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {VARIANTS.map((v) => {
            const isRecommended = v === suggestedVariant;
            return (
              <motion.div
                key={v}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl glass-card ${
                  isRecommended ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-display font-bold text-foreground">
                    W2W — {VARIANT_LABEL[v]} Edition
                  </h2>
                  {isRecommended && (
                    <span className="text-[10px] font-data uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {v === "individual" && "Scanner, log & marketplace."}
                  {v === "student" && "Scanner, wallet, friends & school join."}
                  {v === "company" && "Org dashboard, reports & employee tracking."}
                  {v === "school" && "Org dashboard, leaderboard & student tools."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    const highlight = p.id === detectedOS && isRecommended;
                    const downloadUrl = p.id === "android" ? "/UpcycleIt.apk" : `${RELEASES_BASE}/W2W-${VARIANT_LABEL[v]}-${p.ext}`;
                    return (
                      <a
                        key={p.id}
                        href={downloadUrl}
                        download={p.id === "android" ? "UpcycleIt.apk" : undefined}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-semibold transition-colors ${
                          highlight
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        <Icon size={14} />
                        {p.label}
                        <DownloadIcon size={12} className="ml-auto" />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Download;
