import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Camera, Wrench, CheckCircle2, ShoppingBag, Leaf, Clock, ArrowRight, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Upcycle3DModelConfig, get3DModelForWaste } from '@/lib/threeDModels';
import { ThreeDModelViewer } from './ThreeDModelViewer';
import { WebArCameraModal } from './WebArCameraModal';
import { soundFx } from '@/lib/soundFx';

interface UpcycleStudioModalProps {
  wasteNameOrMaterial: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UpcycleStudioModal = ({
  wasteNameOrMaterial,
  isOpen,
  onClose,
}: UpcycleStudioModalProps) => {
  const navigate = useNavigate();
  const model: Upcycle3DModelConfig = get3DModelForWaste(wasteNameOrMaterial);

  const [activeTab, setActiveTab] = useState<'3d' | 'guide'>('3d');
  const [arModalOpen, setArModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(5);
  const [checkedTools, setCheckedTools] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const toggleTool = (idx: number) => {
    setCheckedTools((prev) => ({ ...prev, [idx]: !prev[idx] }));
    soundFx.playCoinSound();
  };

  const handleFastTrackMarketplace = () => {
    onClose();
    navigate('/marketplace/new', {
      state: {
        prefillTitle: `Upcycled ${model.targetProductName}`,
        prefillCategory: 'upcycled',
        prefillPrice: 200,
        prefillWasteType: model.materialCategory,
        prefillDescription: `Handcrafted ${model.targetProductName} upcycled using W2W 3D Blueprint. High-durability zero-waste build.`,
      },
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-card border border-emerald-500/30 shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/90 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-data font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                  Web-AR & 3D Studio
                </span>
                <span className="text-[10px] font-data text-muted-foreground">
                  {model.timeEstimate} · {model.difficulty}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-foreground mt-0.5">
                {model.targetProductName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setArModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-display font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:opacity-90 transition-opacity"
              >
                <Camera size={13} />
                <span>View in AR</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-alt hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-5 pt-2 pb-1 border-b border-border flex items-center gap-3 text-xs font-display">
            <button
              onClick={() => setActiveTab('3d')}
              className={`pb-2 flex items-center gap-1.5 border-b-2 font-bold transition-all ${
                activeTab === '3d'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles size={13} />
              3D Interactive Model
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-2 flex items-center gap-1.5 border-b-2 font-bold transition-all ${
                activeTab === 'guide'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wrench size={13} />
              Blueprint & Tools Checklist
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {activeTab === '3d' ? (
              <div className="space-y-4">
                <ThreeDModelViewer
                  model={model}
                  currentStep={activeStep}
                  onStepChange={setActiveStep}
                />

                {/* Impact Badge */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf size={16} className="text-emerald-400" />
                    <div>
                      <p className="text-xs font-display font-bold text-foreground">
                        Avoids +{model.co2SavedGrams}g CO₂e
                      </p>
                      <p className="text-[10px] font-data text-muted-foreground">
                        100% Landfill diversion through circular reuse
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setArModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-display font-bold border border-emerald-500/30 flex items-center gap-1 transition-colors"
                  >
                    <Camera size={13} /> Project in Room
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tools Checklist */}
                <div className="p-4 rounded-2xl bg-surface-alt border border-border">
                  <h4 className="text-xs font-display font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Wrench size={13} className="text-emerald-400" />
                    Required Workshop Tools
                  </h4>
                  <div className="grid gap-2">
                    {model.toolsRequired.map((tool, idx) => (
                      <label
                        key={idx}
                        onClick={() => toggleTool(idx)}
                        className="flex items-center gap-2.5 text-xs text-foreground/80 cursor-pointer select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            checkedTools[idx]
                              ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                              : 'border-muted-foreground/40 bg-background'
                          }`}
                        >
                          {checkedTools[idx] && <CheckCircle2 size={12} />}
                        </div>
                        <span className={checkedTools[idx] ? 'line-through text-muted-foreground' : ''}>
                          {tool}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step List */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-display font-bold text-foreground uppercase tracking-wider">
                    5-Stage Execution Blueprint
                  </h4>
                  {model.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      onClick={() => setActiveStep(st.stepNumber)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        activeStep === st.stepNumber
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                          : 'bg-card border-border hover:border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-data font-bold flex items-center justify-center">
                          {st.stepNumber}
                        </span>
                        <h5 className="text-xs font-display font-bold text-foreground">{st.title}</h5>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-7">{st.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3.5 border-t border-border bg-card/90 flex items-center justify-between gap-3">
            <span className="text-[11px] font-data text-muted-foreground hidden sm:inline">
              Ready to sell or trade your creation?
            </span>
            <button
              onClick={handleFastTrackMarketplace}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-foreground text-background font-display font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ml-auto"
            >
              <ShoppingBag size={14} />
              <span>List on Marketplace (₹150–₹450)</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Web-AR Camera Viewfinder Sub-modal */}
          <WebArCameraModal
            model={model}
            isOpen={arModalOpen}
            onClose={() => setArModalOpen(false)}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
