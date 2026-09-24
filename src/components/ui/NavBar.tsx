import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Map, BarChart3, Home, Wallet, LogIn, ShoppingBag, UserPlus, Leaf, GraduationCap, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { hasFeature, type Feature } from "@/lib/variant";

const NavBar = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const isMobile = useIsMobile();

  const isStudent = profile?.account_type === "student";
  const isOrg = profile?.account_type === "company" || profile?.account_type === "school";

  const allItems: Array<{ path: string; icon: any; label: string; feature?: Feature }> = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/scan", icon: Camera, label: "Scan", feature: "scanner" },
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace", feature: "marketplace" },
    { path: "/facilities", icon: Map, label: "Facilities", feature: "facilities" },
    ...(user
      ? [
          ...(isOrg
            ? [{ path: "/org", icon: GraduationCap, label: "Students", feature: "org-dashboard" as Feature }]
            : [{ path: "/friends", icon: UserPlus, label: "Friends", feature: "friends" as Feature }]),
          { path: "/log", icon: BarChart3, label: "My Log", feature: "mylog" as Feature },
          ...(isStudent ? [{ path: "/wallet", icon: Wallet, label: "Wallet", feature: "wallet" as Feature }] : []),
        ]
      : [{ path: "/auth", icon: LogIn, label: "Login" }]),
  ];

  // Hide items whose required feature isn't allowed in this variant
  const navItems = allItems.filter((i) => !i.feature || hasFeature(i.feature));

  // Desktop top nav
  if (!isMobile) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Leaf size={16} className="text-primary" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">W2W</span>
          </Link>

          {/* Center nav links */}
          <div className="flex items-center gap-1">
            {navItems.filter(i => i.path !== "/auth").map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-body transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side controls (Desktop-Only Direct APK Download & Auth) */}
          <div className="flex items-center gap-3">
            {/* Direct Desktop-Only APK Download Button (UpcycleIt.apk) */}
            <a
              href="/UpcycleIt.apk"
              download="UpcycleIt.apk"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors shadow-sm"
              title="Download UpcycleIt Android App (APK)"
            >
              <Download size={13} />
              <span>Download APK</span>
            </a>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-data text-muted-foreground">
                  {profile?.display_name || user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-display font-bold hover:bg-primary/90 transition-colors"
              >
                <LogIn size={14} />
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Mobile bottom nav
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl glass-card">
        {navItems.slice(0, 6).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? "bg-primary/15" : "hover:bg-primary/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={`relative z-10 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`relative z-10 text-[9px] font-data ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBar;
