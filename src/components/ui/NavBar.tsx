import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  Map,
  BarChart3,
  Home,
  Wallet,
  LogIn,
  ShoppingBag,
  UserPlus,
  Leaf,
  GraduationCap,
  Download,
  Menu,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { hasFeature, type Feature } from "@/lib/variant";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NavBar = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);

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

  // Mobile bottom nav: 4 primary shortcuts + Center Scan button + "More" drawer
  const primaryKeys = ["/", "/marketplace", "/facilities"];
  const secondaryItems = navItems.filter((i) => !primaryKeys.includes(i.path) && i.path !== "/scan");
  const isMoreActive = secondaryItems.some((i) => location.pathname === i.path);

  return (
    <>
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
        <div className="flex items-center justify-around px-2 py-2 rounded-2xl glass-card border border-border/80 shadow-2xl backdrop-blur-2xl">
          {/* Home */}
          <Link
            to="/"
            className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
              location.pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {location.pathname === "/" && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl bg-primary/15"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Home size={19} className="relative z-10" />
            <span className="relative z-10 text-[10px] font-medium font-data">Home</span>
          </Link>

          {/* Marketplace */}
          <Link
            to="/marketplace"
            className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
              location.pathname.startsWith("/marketplace") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {location.pathname.startsWith("/marketplace") && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl bg-primary/15"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <ShoppingBag size={19} className="relative z-10" />
            <span className="relative z-10 text-[10px] font-medium font-data">Market</span>
          </Link>

          {/* Center Scan Hero Button */}
          <Link
            to="/scan"
            className="relative -top-3 flex flex-col items-center group"
            title="Scan Waste with AI"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-primary p-0.5 shadow-lg shadow-primary/30 group-active:scale-95 transition-transform">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center border-2 border-primary/40">
                <Camera size={22} className="text-primary animate-pulse" />
              </div>
            </div>
            <span className="text-[10px] font-bold font-data text-primary mt-0.5">SCAN</span>
          </Link>

          {/* Facilities */}
          <Link
            to="/facilities"
            className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
              location.pathname === "/facilities" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {location.pathname === "/facilities" && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl bg-primary/15"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Map size={19} className="relative z-10" />
            <span className="relative z-10 text-[10px] font-medium font-data">Map</span>
          </Link>

          {/* More Drawer Trigger */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                  isMoreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="More navigation items"
              >
                {isMoreActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-primary/15"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Menu size={19} className="relative z-10" />
                <span className="relative z-10 text-[10px] font-medium font-data">More</span>
              </button>
            </SheetTrigger>

            <SheetContent side="bottom" className="rounded-t-3xl border-border bg-card/95 backdrop-blur-2xl p-6">
              <SheetHeader className="text-left pb-4 border-b border-border/60">
                <SheetTitle className="text-base font-display font-bold flex items-center justify-between">
                  <span>W2W Menu</span>
                  {user && (
                    <span className="text-xs font-normal text-muted-foreground font-data truncate max-w-[200px]">
                      {profile?.display_name || user.email}
                    </span>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-2.5 py-4">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isActive
                          ? "bg-primary/15 border-primary/40 text-primary font-medium"
                          : "bg-muted/40 border-border/50 text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center border border-border">
                        <Icon size={16} className={isActive ? "text-primary" : "text-muted-foreground"} />
                      </div>
                      <span className="text-sm font-body">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Direct Android APK download in More sheet */}
                <a
                  href="/UpcycleIt.apk"
                  download="UpcycleIt.apk"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all col-span-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                    <Download size={16} />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold font-display">Download UpcycleIt APK</p>
                      <p className="text-[10px] text-muted-foreground">Install directly on Android</p>
                    </div>
                    <ChevronRight size={14} className="opacity-60" />
                  </div>
                </a>
              </div>

              {/* User Authentication state in drawer */}
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setMoreOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-display font-semibold hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMoreOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-display font-bold shadow-md shadow-primary/20"
                >
                  <LogIn size={14} />
                  Login to Sync Progress
                </Link>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
