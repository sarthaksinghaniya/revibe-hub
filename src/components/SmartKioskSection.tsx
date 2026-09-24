import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Camera, Monitor, Zap, ShieldCheck, CheckCircle2, ArrowRight, Download, Terminal, X, Building2, Phone, Mail, Sparkles, Server } from "lucide-react";
import { toast } from "sonner";

interface SmartKioskSectionProps {
  title?: string;
  subtitle?: string;
}

export const SmartKioskSection = ({
  title = "W2W Smart AI Waste Kiosk",
  subtitle = "Deploy Raspberry Pi 4 powered AI recycling terminals at your campus, office, or municipality.",
}: SmartKioskSectionProps) => {
  // Pricing toggle state: 'installment' | 'outright'
  const [pricingMode, setPricingMode] = useState<"installment" | "outright">("installment");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);

  // Form State
  const [institutionName, setInstitutionName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName || !email || !phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setModalOpen(false);
      toast.success("🎉 Campus setup request submitted! Our hardware team will contact you within 24 hours.", {
        duration: 6000,
      });
      setInstitutionName("");
      setContactName("");
      setEmail("");
      setPhone("");
    }, 800);
  };

  return (
    <section className="py-12 lg:py-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <motion.div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-data tracking-wider uppercase mb-3"
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Cpu size={14} /> Raspberry Pi 4 Hardware Stack
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>
      </div>

      {/* Main Grid: 3D Render & Stack Breakdown */}
      <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
        {/* Left: 3D Kiosk Visual Render */}
        <motion.div
          className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-b from-card to-emerald-950/20 shadow-2xl group"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src="/w2w-smart-kiosk.jpg"
              alt="W2W Smart AI Waste Kiosk Raspberry Pi 4 Render"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

            {/* Live Status Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-emerald-500/40 text-xs font-data">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold">RPi4 AI Vision Active</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-card/90 backdrop-blur-md border border-border">
              <p className="text-xs font-display font-bold text-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400" />
                Zero-Touch Autonomous Waste Classification
              </p>
              <p className="text-[11px] font-data text-muted-foreground mt-1">
                Gemini 2.5 Flash API · 1.5s Optical Recognition · Instant ₹2 Cash Reward Credit
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: Hardware Components */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-display font-bold text-foreground mb-2">Hardware & AI Stack Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: Cpu,
                name: "Raspberry Pi 4 Model B",
                desc: "Broadcom BCM2711, Quad-core Cortex-A72 @ 1.5GHz, 4GB LPDDR4 RAM",
                color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
              },
              {
                icon: Camera,
                name: "8MP Sony IMX219 Optical Camera",
                desc: "Full HD 1080p continuous video stream with dynamic illumination",
                color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              },
              {
                icon: Monitor,
                name: "7\" HD IPS Touch Display",
                desc: "1024×600 resolution with real-time eco rewards feedback screen",
                color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
              },
              {
                icon: Zap,
                name: "Smart Relay Bin Actuator",
                desc: "Automatic bin flap sorting mechanism & 16x2 I2C reward LCD",
                color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: Server,
                name: "Gemini 2.5 Flash Vision AI",
                desc: "Multimodal image inference with Supabase Cloud real-time syncing",
                color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
              },
              {
                icon: ShieldCheck,
                name: "Systemd Auto-Boot Daemon",
                desc: "Resilient watchdog auto-restart & Chromium kiosk full-screen mode",
                color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
              },
            ].map((hw, i) => {
              const Icon = hw.icon;
              return (
                <div key={i} className={`p-3.5 rounded-xl border ${hw.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} />
                    <h4 className="text-xs font-display font-bold text-foreground">{hw.name}</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{hw.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setCodeDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground border border-border text-xs font-display font-bold hover:bg-secondary/80 transition-colors"
            >
              <Terminal size={15} /> View RPi4 Daemon Scripts
            </button>
          </div>
        </motion.div>
      </div>

      {/* PRICING SECTION WITH INTERACTIVE TOGGLE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card via-card to-emerald-950/30 border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-border pb-6">
          <div>
            <span className="text-xs font-data text-emerald-400 font-bold uppercase tracking-wider">
              Flexible Rupee (₹) Pricing
            </span>
            <h3 className="text-xl font-display font-bold text-foreground mt-1">Get W2W Kiosk For Your Campus</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Includes full Raspberry Pi 4 hardware kit, camera, touch display, and software service.
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-alt border border-border">
            <button
              onClick={() => setPricingMode("installment")}
              className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                pricingMode === "installment"
                  ? "bg-emerald-500 text-zinc-950 shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Subscription (₹1,499/mo)
            </button>
            <button
              onClick={() => setPricingMode("outright")}
              className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                pricingMode === "outright"
                  ? "bg-emerald-500 text-zinc-950 shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Outright Purchase (₹14,999)
            </button>
          </div>
        </div>

        {/* Pricing Card Details */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Active Option Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-zinc-900 border border-emerald-500/40 text-white flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-data font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    {pricingMode === "installment" ? "12-Month Installment" : "Full Ownership"}
                  </span>
                  <h4 className="text-2xl font-display font-bold text-white mt-2">
                    {pricingMode === "installment" ? "₹1,499 / month" : "₹14,999 One-Time"}
                  </h4>
                  <p className="text-xs text-emerald-200/70 mt-1">
                    {pricingMode === "installment"
                      ? "Zero upfront investment. Cancel or upgrade anytime."
                      : "Complete ownership of Raspberry Pi 4 hardware stack."}
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 my-6 text-xs text-emerald-100/90 font-data">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Raspberry Pi 4 (4GB RAM) + 8MP Sony Camera Terminal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>7" Touchscreen & Dual Relay Bin Sorting Module</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Gemini 2.5 Flash Vision AI API Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>24/7 Hardware Replacement & Free Software Updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Customizable Rupee (₹2 per 5 scans) Cash Reward System</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-emerald-500 text-zinc-950 font-display font-bold text-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Request Campus Kiosk Installation</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Secondary Plan & Specifications */}
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between">
            <div>
              <h4 className="text-base font-display font-bold text-foreground mb-2">Campus & Corporate Benefits</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Transform waste management at your college, office campus, or apartment complex with automated eco-reward incentives.
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-surface-alt border border-border">
                  <span className="text-xs font-display font-bold text-foreground block">🏫 Educational Institutions</span>
                  <span className="text-[11px] text-muted-foreground">
                    Boost student recycling participation by 400% with real-time eco points & cash rewards.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-alt border border-border">
                  <span className="text-xs font-display font-bold text-foreground block">🏢 Offices & Tech Parks</span>
                  <span className="text-[11px] text-muted-foreground">
                    Fulfill ESG compliance metrics with automated carbon offset logging to Supabase cloud.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-data">
              <span className="text-muted-foreground">Estimated Setup Time:</span>
              <span className="text-emerald-400 font-bold">Within 48 Hours in India 🇮🇳</span>
            </div>
          </div>
        </div>
      </div>

      {/* CAMPUS SETUP REQUEST MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg p-6 rounded-2xl bg-card border border-border shadow-2xl relative"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-foreground">Request Kiosk Installation</h3>
                  <p className="text-xs text-muted-foreground">Our team will ship & configure the RPi4 kiosk at your site</p>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-3">
                <div>
                  <label className="block text-xs font-data text-muted-foreground mb-1">
                    Institution / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIT Delhi / Tech Park Phase 1"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-data text-muted-foreground mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-data text-muted-foreground mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-data text-muted-foreground mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-data text-muted-foreground mb-1">
                      Kiosk Units
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-alt border border-border text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1">1 Kiosk Unit</option>
                      <option value="2-5">2 to 5 Units</option>
                      <option value="5+">5+ Campus Fleet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-data text-muted-foreground mb-1">
                      Selected Plan
                    </label>
                    <div className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-data font-bold text-xs">
                      {pricingMode === "installment" ? "₹1,499/mo (Installment)" : "₹14,999 (Outright)"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-display font-bold text-sm border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-display font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RPI4 HARDWARE DAEMON CODE DRAWER */}
      <AnimatePresence>
        {codeDrawerOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl bg-card border border-border shadow-2xl relative"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
            >
              <button
                onClick={() => setCodeDrawerOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Terminal size={20} className="text-emerald-400" />
                <h3 className="text-lg font-display font-bold text-foreground">Raspberry Pi 4 Software Stack</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-display font-bold text-emerald-400 mb-1">1. w2w_kiosk.py (Camera Daemon)</h4>
                  <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-300 overflow-x-auto font-data text-[11px] leading-relaxed">
{`# Python 3 camera capture & Gemini 2.5 Flash Vision AI analysis
import cv2, requests, base64, json, time, os

def analyze_frame(image_bytes):
    b64_img = base64.b64encode(image_bytes).decode('utf-8')
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
    # Vision AI classification...
    return json_result`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-display font-bold text-emerald-400 mb-1">2. setup_kiosk.sh (Autostart & Kiosk Installer)</h4>
                  <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-300 overflow-x-auto font-data text-[11px] leading-relaxed">
{`#!/usr/bin/env bash
sudo apt-get install -y python3-opencv chromium-browser unclutter
# Configure LXDE autostart full screen kiosk mode:
@chromium-browser --kiosk --noerrdialogs http://localhost:8080`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-display font-bold text-emerald-400 mb-1">3. w2w-kiosk.service (Systemd Watchdog)</h4>
                  <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-300 overflow-x-auto font-data text-[11px] leading-relaxed">
{`[Unit]
Description=W2W Smart AI Waste Kiosk Daemon (Raspberry Pi 4)
ExecStart=/usr/bin/python3 /home/pi/hardware/w2w_kiosk.py
Restart=always`}
                  </pre>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setCodeDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs"
                >
                  Close Code Drawer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SmartKioskSection;
