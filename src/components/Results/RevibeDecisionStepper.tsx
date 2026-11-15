import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldAlert, ShieldCheck, Wrench, RefreshCw, Leaf, Gift, ChevronRight, Sparkles, Move3d, Truck, ShoppingBag, CheckCircle2 } from 'lucide-react';
import type { ScanItem } from '@/lib/scanApi';

interface RevibeDecisionStepperProps {
  item: ScanItem;
  score: number;
  milestoneCount: number;
  onOpen3dStudio: () => void;
  onOpenScrapPickup: () => void;
  onOpenExchange: () => void;
}

export const RevibeDecisionStepper = ({
  item,
  score,
  milestoneCount,
  onOpen3dStudio,
  onOpenScrapPickup,
  onOpenExchange,
}: RevibeDecisionStepperProps) => {
  const [activeStage, setActiveStage] = useState<number>(3); // Default on 'Act'

  const stages = [
    { num: 1, name: 'Analyze', icon: Search, label: `${item.confidence}% Match` },
    { num: 2, name: 'Assess', icon: score >= 60 ? ShieldCheck : ShieldAlert, label: `Health ${score}/100` },
    { num: 3, name: 'Act', icon: Wrench, label: '3 Pathways' },
    { num: 4, name: 'Exchange', icon: RefreshCw, label: 'Barter / Sell' },
    { num: 5, name: 'Impact', icon: Leaf, label: `+${Math.round((item.co2_saved_kg || 0) * 1000)}g CO₂` },
    { num: 6, name: 'Reward', icon: Gift, label: `${milestoneCount}/5 Scan Cash` },
  ];

  return (
    <div className="p-4 rounded-2xl bg-surface-alt border border-emerald-500/20 mb-4 shadow-sm">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-data uppercase tracking-wider text-emerald-400 font-bold">
            The Revibe Decision Pathway
          </span>
        </div>
        <span className="text-[9px] font-data text-muted-foreground">
          One item → Multiple informed pathways
        </span>
      </div>

      {/* Horizontal Stepper Progress Bar */}
      <div className="grid grid-cols-6 gap-1 mb-4">
        {stages.map((st) => {
          const Icon = st.icon;
          const isCurrent = activeStage === st.num;
          return (
            <button
              key={st.num}
              type="button"
              onClick={() => setActiveStage(st.num)}
              className={`flex flex-col items-center p-1.5 rounded-xl border text-center transition-all ${
                isCurrent
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm'
                  : 'bg-card/60 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-[11px] ${
                  isCurrent ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-muted text-foreground'
                }`}
              >
                <Icon size={12} />
              </div>
              <span className="text-[9px] font-display font-bold leading-none truncate w-full">
                {st.name}
              </span>
              <span className="text-[8px] font-data text-muted-foreground/80 truncate w-full mt-0.5">
                {st.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Active Stage Card */}
      <motion.div
        key={activeStage}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="p-3.5 rounded-xl bg-card border border-border"
      >
        {activeStage === 1 && (
          <div>
            <h4 className="text-xs font-display font-bold text-foreground flex items-center gap-1.5 mb-1">
              <Search size={13} className="text-emerald-400" />
              Stage 1: Multimodal Vision Analysis
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Gemini Vision AI detected <strong className="text-foreground">{item.name}</strong> composed of{' '}
              <strong className="text-foreground">{item.material}</strong> with a {item.confidence}% optical confidence match.
            </p>
          </div>
        )}

        {activeStage === 2 && (
          <div>
            <h4 className="text-xs font-display font-bold text-foreground flex items-center gap-1.5 mb-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              Stage 2: AI Health & Condition Check ({score}/100)
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {score >= 70
                ? 'High-grade condition: Suitable for direct creative upcycling, functional reuse, or high-value barter.'
                : score >= 40
                ? 'Fair condition: Minor residue or bending detected. Clean thoroughly before crafting or deposit in Blue dry bin.'
                : 'Degraded / Hazardous state: Direct upcycling not recommended. Dispose via authorized recycling drop-off.'}
            </p>
          </div>
        )}

        {activeStage === 3 && (
          <div className="space-y-2">
            <h4 className="text-xs font-display font-bold text-foreground flex items-center gap-1.5 mb-1.5">
              <Wrench size={13} className="text-emerald-400" />
              Stage 3: Choose Your Action Pathway
            </h4>
            <div className="grid sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpen3dStudio}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Move3d size={15} />
                  <div>
                    <p className="text-xs font-display font-bold">3D Web-AR Studio</p>
                    <p className="text-[10px] font-data text-muted-foreground">Interactive 3D blueprint & AR</p>
                  </div>
                </div>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onOpenScrapPickup}
                className="p-2.5 rounded-xl bg-surface-alt hover:bg-muted border border-border text-foreground text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Truck size={15} className="text-primary" />
                  <div>
                    <p className="text-xs font-display font-bold">Doorstep Pickup</p>
                    <p className="text-[10px] font-data text-muted-foreground">Live kabadiwala cash rate</p>
                  </div>
                </div>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {activeStage === 4 && (
          <div>
            <h4 className="text-xs font-display font-bold text-foreground flex items-center gap-1.5 mb-1">
              <RefreshCw size={13} className="text-emerald-400" />
              Stage 4: Smart Exchange & Barter Network
            </h4>
            <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
              Turn your waste or upcycled craft into value! Connect via Instagram-style In-App DM with fellow students and makers.
            </p>
            <button
              type="button"
              onClick={onOpenExchange}
              className="w-full py-2 px-3 rounded-lg bg-emerald-500 text-zinc-950 font-display font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={13} />
              Open Smart Exchange / Marketplace
            </button>
          </div>
        )}

        {activeStage === 5 && (
          <div>
            <h4 className="text-xs font-display font-bold text-foreground flex items-center gap-1.5 mb-1">
              <Leaf size={13} className="text-emerald-400" />
              Stage 5: Verified Environmental Telemetry
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-center">
              <div className="p-2 rounded-lg bg-surface-alt border border-border">
                <p className="text-sm font-display font-bold text-emerald-400">
                  +{Math.round((item.co2_saved_kg || 0) * 1000)}g
                </p>
                <p className="text-[9px] font-data text-muted-foreground">CO₂e Avoided</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-alt border border-border">
                <p className="text-sm font-display font-bold text-sky-400">
                  +{item.water_saved_liters || 1.5}L
                </p>
                <p className="text-[9px] font-data text-muted-foreground">Water Conserved</p>
              </div>
            </div>
          </div>
        )}

        {activeStage === 6 && (
          <div>
            <h4 className="text-xs font-display font-bold text-foreground flex items-center gap-1.5 mb-1">
              <Gift size={13} className="text-emerald-400" />
              Stage 6: Real-World Economic Rewards
            </h4>
            <p className="text-[11px] text-muted-foreground mb-2">
              Every 5 scans unlock ₹2 instant cash rewards directly withdrawable via UPI!
            </p>
            <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${(milestoneCount / 5) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-data text-emerald-400 font-bold mt-1.5 text-right">
              {milestoneCount} / 5 scans logged
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
