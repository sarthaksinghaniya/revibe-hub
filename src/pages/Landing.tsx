import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, ArrowRight, ChevronDown, Download, Building2, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import DecayTimeline from "@/components/DecayTimeline";
import EcoFingerprint from "@/components/EcoFingerprint";
import SmartKioskSection from "@/components/SmartKioskSection";
import Footer from "@/components/ui/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between lg:pt-16">
      <div>
        {/* Hero — editorial, asymmetric */}
        <section className="relative min-h-[94vh] lg:min-h-[88vh] flex flex-col justify-end px-6 lg:px-10 pb-12 lg:pb-16 overflow-hidden">
          {/* Large decorative text in background */}
          <div className="absolute top-8 -right-4 select-none pointer-events-none">
            <span className="text-[120px] sm:text-[180px] lg:text-[260px] font-display font-bold text-foreground/[0.03] leading-none tracking-tighter">
              W2W
            </span>
          </div>

          {/* Organic blob shapes */}
          <div className="absolute top-20 right-8 w-32 h-32 rounded-full bg-category-compost/8 blur-[40px]" />
          <div className="absolute top-48 left-4 w-48 h-48 rounded-full bg-category-recycle/6 blur-[60px]" />
          <div className="absolute bottom-40 right-12 w-24 h-24 rounded-full bg-category-upcycle/8 blur-[30px]" />

          <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-end">
            {/* Main content — left aligned, editorial */}
            <motion.div
              className="max-w-md lg:max-w-xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6">
                <motion.div
                  className="inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-data tracking-wider uppercase mb-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  AI-powered waste scanner
                </motion.div>

                <h1 className="text-[42px] sm:text-[56px] lg:text-[72px] font-display font-bold text-foreground leading-[0.95] tracking-tight">
                  Know your
                  <br />
                  waste.
                  <br />
                  <span className="text-primary/80">Save the planet.</span>
                </h1>
              </div>

              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-xs lg:max-w-md mb-8">
                Point your camera at any piece of garbage. Get instant disposal instructions,
                upcycling ideas, and find nearby recycling facilities.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/scan">
                  <motion.button
                    className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-foreground text-background font-display font-bold text-sm transition-all"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Camera size={17} />
                    Scan now
                    <ArrowRight size={14} />
                  </motion.button>
                </Link>

                {/* Direct Desktop-Only APK Download Button (UpcycleIt.apk 4.6MB) */}
                <a
                  href="/UpcycleIt.apk"
                  download="UpcycleIt.apk"
                  className="hidden lg:flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-display font-bold text-sm hover:bg-emerald-500/25 transition-colors shadow-sm"
                >
                  <Download size={17} />
                  Download App (APK)
                </a>
              </div>
            </motion.div>

            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
            >
              <div className="rounded-3xl border border-border/60 bg-card/45 backdrop-blur-md p-6 shadow-sm flex flex-col items-center justify-center min-h-[28rem]">
                <div className="mb-4 text-center">
                  <p className="text-[10px] font-data tracking-[0.15em] uppercase text-muted-foreground">Live eco fingerprint</p>
                  <h3 className="text-sm font-display font-bold text-foreground mt-1">Animated waste profile</h3>
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="scale-110 lg:scale-[1.2]"
                >
                  <EcoFingerprint
                    recyclable={7}
                    compostable={4}
                    hazardous={1}
                    landfill={2}
                    upcyclable={6}
                    showLegend={false}
                  />
                </motion.div>

                <p className="mt-5 text-xs text-muted-foreground text-center max-w-xs">
                  A live fingerprint of waste impact, showing how each scan can be routed to recycle, compost, or upcycle.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 lg:hidden"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={16} className="text-muted-foreground/40" />
          </motion.div>
        </section>

        {/* Decay Timeline — the USP */}
        <section className="px-6 lg:px-10 py-16 max-w-6xl mx-auto">
          <DecayTimeline />
        </section>

        {/* How it works — horizontal scroll cards */}
        <section className="px-6 lg:px-10 py-12 max-w-6xl mx-auto">
          <p className="text-[10px] font-data text-muted-foreground uppercase tracking-[0.2em] mb-2">How it works</p>
          <h2 className="text-xl font-display font-bold text-foreground mb-6">
            Three steps. Zero confusion.
          </h2>

          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
            {[
              { num: "01", title: "Point & scan", desc: "Open the camera. Frame the item. One tap identifies it using multimodal vision AI.", accent: "border-l-category-recycle" },
              { num: "02", title: "Get instructions", desc: "Receive step-by-step disposal, recycling, or composting guidance specific to your city.", accent: "border-l-category-compost" },
              { num: "03", title: "Upcycle or find facility", desc: "Browse creative reuse ideas or navigate to the nearest drop-off point on the map.", accent: "border-l-category-upcycle" },
            ].map((step, i) => (
              <motion.div
                key={i}
                className={`p-4 rounded-xl bg-card/60 border border-border border-l-[3px] ${step.accent}`}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-data text-muted-foreground/50 mt-0.5">{step.num}</span>
                  <div>
                    <h3 className="text-sm font-display font-bold text-foreground mb-0.5">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* W2W Smart AI Waste Kiosk Hardware Section */}
        <SmartKioskSection
          title="W2W Smart AI Waste Kiosk"
          subtitle="Bring automated AI waste sorting, continuous camera inspection, and instant Rupee rewards to your campus."
        />

        {/* SAAS PRICING SECTION (Campus ₹499/mo & Enterprise ₹699/mo) */}
        <section className="px-6 lg:px-10 py-12 max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-data text-emerald-400 font-bold uppercase tracking-wider">
              Affordable Eco Subscriptions
            </span>
            <h2 className="text-2xl font-display font-bold text-foreground mt-1">SaaS Plans for Every Scale</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Empower your campus or workplace with real-time carbon auditing and automated rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Campus SaaS Card (₹499/mo) */}
            <motion.div
              className="p-6 rounded-3xl bg-card border border-emerald-500/30 flex flex-col justify-between shadow-lg"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-data font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                      Colleges & Schools
                    </span>
                    <h3 className="text-xl font-display font-bold text-foreground mt-2">Campus SaaS Plan</h3>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-display font-extrabold text-emerald-400 tabular-nums">₹499</span>
                  <span className="text-xs font-data text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-2 text-xs font-data text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Unlimited Student Scans & Leaderboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>₹2 per 5 Scans Cash Reward Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Inter-Campus Battle Tournament Access</span>
                  </li>
                </ul>
              </div>
              <Link to="/auth">
                <button className="w-full py-3 rounded-xl bg-emerald-500 text-zinc-950 font-display font-bold text-xs hover:bg-emerald-400 transition-colors">
                  Get Campus Plan (₹499/mo)
                </button>
              </Link>
            </motion.div>

            {/* Enterprise ESG Card (₹699/mo) */}
            <motion.div
              className="p-6 rounded-3xl bg-gradient-to-br from-card via-card to-emerald-950/20 border border-border flex flex-col justify-between shadow-lg"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-data font-bold bg-primary/15 text-primary border border-primary/30 uppercase">
                      Corporate & Municipal
                    </span>
                    <h3 className="text-xl font-display font-bold text-foreground mt-2">Enterprise ESG Plan</h3>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-display font-extrabold text-primary tabular-nums">₹699</span>
                  <span className="text-xs font-data text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-2 text-xs font-data text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" />
                    <span>Full ESG Carbon Offset Audit Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" />
                    <span>Custom Facility Drop-off Verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-primary" />
                    <span>Dedicated RPi4 Kiosk Remote Monitoring</span>
                  </li>
                </ul>
              </div>
              <Link to="/auth">
                <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs hover:bg-primary/90 transition-colors">
                  Get Enterprise Plan (₹699/mo)
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 lg:px-10 py-12 max-w-6xl mx-auto text-center">
          <motion.div
            className="p-8 rounded-3xl bg-gradient-to-br from-primary/8 to-category-recycle/5 border border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] font-data text-primary uppercase tracking-[0.15em] mb-2">
              Every scan counts
            </p>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Start making a difference
            </h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
              Join thousands reducing landfill waste one scan at a time. It takes 3 seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/scan">
                <motion.button
                  className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-sm glow-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Open Scanner
                </motion.button>
              </Link>

              {/* Desktop-Only Direct APK Download */}
              <a
                href="/UpcycleIt.apk"
                download="UpcycleIt.apk"
                className="hidden lg:inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-foreground border border-border font-display font-bold text-sm hover:border-emerald-500/40 transition-colors"
              >
                <Download size={16} />
                Download Android APK
              </a>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Flush Bottom Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
