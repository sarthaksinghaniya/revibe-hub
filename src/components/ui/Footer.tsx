import { Link } from "react-router-dom";
import { Leaf, Download, Cpu, ShieldCheck, Heart, ArrowUpRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border mt-auto pt-12 pb-8 px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border">
          {/* Col 1: Brand & Status */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                <Leaf size={18} />
              </div>
              <span className="text-xl font-display font-bold text-foreground">W2W UpcycleIT</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-powered waste classification, real-time CO₂ carbon wallet offset tracking, and automated recycling hardware.
            </p>

            {/* Live System Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-data">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2 text-xs font-data text-muted-foreground">
              <li><Link to="/scan" className="hover:text-primary transition-colors">AI Waste Scanner</Link></li>
              <li><Link to="/marketplace" className="hover:text-primary transition-colors">Upcycle Marketplace</Link></li>
              <li><Link to="/facilities" className="hover:text-primary transition-colors">Recycling Facilities</Link></li>
              <li><Link to="/wallet" className="hover:text-primary transition-colors">Carbon Wallet & UPI Cash</Link></li>
              <li><Link to="/log" className="hover:text-primary transition-colors">Gen-Z Bio Log</Link></li>
            </ul>
          </div>

          {/* Col 3: SaaS & Enterprise Plans */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-foreground">SaaS Plans</h4>
            <div className="space-y-2 text-xs font-data">
              <div className="p-2.5 rounded-xl bg-surface-alt border border-border">
                <span className="font-bold text-foreground block">Campus SaaS Plan</span>
                <span className="text-emerald-400 font-bold">₹499 / month</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Colleges & Schools</p>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-alt border border-border">
                <span className="font-bold text-foreground block">Enterprise ESG Plan</span>
                <span className="text-emerald-400 font-bold">₹699 / month</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Corporate & Municipal</p>
              </div>
            </div>
          </div>

          {/* Col 4: Downloads & Terminal Kiosk */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-foreground">Downloads & Kiosk</h4>
            <p className="text-xs text-muted-foreground">
              Native Android app (APK) & Raspberry Pi 4 hardware terminal.
            </p>

            <a
              href="/UpcycleIt.apk"
              download="UpcycleIt.apk"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-display font-bold hover:bg-emerald-500/25 transition-colors"
            >
              <Download size={14} />
              <span>Download UpcycleIt.apk</span>
            </a>

            <div className="flex items-center gap-1.5 text-[11px] font-data text-muted-foreground pt-1">
              <Cpu size={13} className="text-emerald-400" />
              <span>RPi4 Kiosk Autostart Stack</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-data text-muted-foreground">
          <p>© 2026 W2W UpcycleIT. Made with <Heart size={12} className="inline fill-destructive text-destructive mx-0.5" /> for a cleaner Earth.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
