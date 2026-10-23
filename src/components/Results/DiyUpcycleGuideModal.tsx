import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Clock,
  Palette,
  ExternalLink,
  ChevronRight,
  Scissors,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { soundFx } from "@/lib/soundFx";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DiyProject {
  id: string;
  materialKey: string;
  projectTitle: string;
  difficulty: "Easy" | "Medium" | "Intermediate";
  estimatedMinutes: number;
  toolsNeeded: string[];
  safetyTip: string;
  steps: Array<{
    title: string;
    description: string;
    proTip?: string;
  }>;
  marketplaceCategory: string;
}

export const DIY_GUIDES: DiyProject[] = [
  {
    id: "diy_plastic_planter",
    materialKey: "plastic",
    projectTitle: "Self-Watering Hanging Succulent Planter",
    difficulty: "Easy",
    estimatedMinutes: 15,
    toolsNeeded: ["Clean Plastic Bottle", "Utility Scissors", "Cotton Twine/String", "Potting Soil", "Acrylic Paint or Twine"],
    safetyTip: "Smooth or flame-seal sharp cut plastic edges before handling.",
    marketplaceCategory: "Decor",
    steps: [
      {
        title: "Cut the Bottle in Half",
        description: "Rinse and remove label. Carefully cut the plastic bottle horizontally into two halves about 4 inches from the base.",
        proTip: "Use masking tape as a straight cutting guide line.",
      },
      {
        title: "Perforate Cap for Wicking",
        description: "Poke a small 3mm hole through the bottle cap using a heated pin or nail, then screw the cap tightly back onto the top half.",
      },
      {
        title: "Insert Cotton Wick String",
        description: "Thread a 6-inch cotton string through the cap hole. Let half hang into the bottom reservoir and half extend into the top funnel.",
        proTip: "Cotton natural fiber draws water upward via capillary action.",
      },
      {
        title: "Fill Soil & Invert",
        description: "Invert the top funnel half into the bottom base reservoir. Fill the top with potting soil and plant your cutting or seeds.",
      },
      {
        title: "Add Water & Decorate",
        description: "Pour 2 inches of water into the bottom reservoir. Paint the exterior with acrylic patterns or wrap with rustic jute twine.",
      },
    ],
  },
  {
    id: "diy_glass_lantern",
    materialKey: "glass",
    projectTitle: "Ambient Fairy Light Table Lantern",
    difficulty: "Easy",
    estimatedMinutes: 20,
    toolsNeeded: ["Clean Glass Jar/Bottle", "Fairy LED String Lights", "Jute Rope / Wire", "PVA Glue", "Dried Leaves or Pressed Flowers"],
    safetyTip: "Inspect glass for chips or fractures before crafting.",
    marketplaceCategory: "Decor",
    steps: [
      {
        title: "Clean & De-grease Glass",
        description: "Soak the jar in warm soapy water to strip glue and labels. Wipe dry with alcohol for crystal clarity.",
      },
      {
        title: "Decoupage Pressed Botanicals",
        description: "Brush a thin coat of clear glue on the glass exterior and press dried leaves or flowers onto the surface.",
        proTip: "Use diluted craft glue (Mod Podge) for a frosted matte finish.",
      },
      {
        title: "Seal Surface Protective Coat",
        description: "Apply a second thin coat of sealant over the botanicals and let it air dry for 10 minutes.",
      },
      {
        title: "Wrap Neck with Rustic Jute",
        description: "Wind jute twine tightly around the jar's threaded mouth 6–8 times and tie off with a neat double knot.",
      },
      {
        title: "Insert Warm LED Strand",
        description: "Drop a micro-LED copper wire strand into the jar and stick the small battery pack under the lid with double-sided tape.",
      },
    ],
  },
  {
    id: "diy_cardboard_organizer",
    materialKey: "paper",
    projectTitle: "Modular Desktop Stationery Caddy",
    difficulty: "Easy",
    estimatedMinutes: 25,
    toolsNeeded: ["Cardboard Box / Cartons", "Craft Knife", "Steel Ruler", "Glue Gun or PVA", "Wrapping Paper or Paint"],
    safetyTip: "Always cut away from your body on a self-healing mat or thick cutting board.",
    marketplaceCategory: "Furniture",
    steps: [
      {
        title: "Measure & Slit Tiered Heights",
        description: "Mark your cardboard boxes into stepped tiers (e.g., 3 inches, 4 inches, and 5 inches) for pens, scissors, and notes.",
      },
      {
        title: "Cut Dividers Cleanly",
        description: "Score along straight lines using a metal ruler before cutting through to ensure clean, crisp 90-degree corners.",
      },
      {
        title: "Glue Compartments in Cluster",
        description: "Fasten the tiered boxes side-by-side using wood glue or hot glue, clamping firmly until bonded.",
      },
      {
        title: "Reinforce Bottom Base",
        description: "Glue the clustered compartments onto a sturdy rectangular cardboard base sheet to prevent tipping.",
      },
      {
        title: "Skin with Eco Gift Wrap",
        description: "Cover the exterior with upcycled newspaper collage, brown kraft paper, or paint with minimalist geometric designs.",
      },
    ],
  },
  {
    id: "diy_textile_tote",
    materialKey: "textile",
    projectTitle: "No-Sew Upcycled Market Tote Bag",
    difficulty: "Easy",
    estimatedMinutes: 15,
    toolsNeeded: ["Old Cotton T-Shirt", "Fabric Scissors", "Ruler", "Chalk/Marker"],
    safetyTip: "Use sharp fabric shears for clean fringe cuts.",
    marketplaceCategory: "Clothing",
    steps: [
      {
        title: "Cut Sleeves Off",
        description: "Lay the t-shirt flat and cut off both sleeves following the hem seams. These armholes become the bag's tote handles.",
      },
      {
        title: "Deepen Neck Opening",
        description: "Cut out the crew neck collar in a deeper U-shape oval to create the wide open top of the tote bag.",
      },
      {
        title: "Slit Bottom Fringe Strips",
        description: "Cut vertical 3-inch long fringe slits along the bottom hem of the shirt, spaced 3/4 inch apart.",
      },
      {
        title: "Tie Knots Along Bottom",
        description: "Tie each matching front and back fringe strip into a tight double knot to seal the bottom of the bag securely.",
        proTip: "Tie adjacent knots together to eliminate small gaps at the bottom.",
      },
      {
        title: "Turn Inside-Out (Optional)",
        description: "Flip the shirt inside-out if you prefer a clean seamless bottom, or keep fringes outward for a boho look.",
      },
    ],
  },
  {
    id: "diy_metal_caddy",
    materialKey: "metal",
    projectTitle: "Minimalist Perforated Candle Lantern",
    difficulty: "Medium",
    estimatedMinutes: 20,
    toolsNeeded: ["Aluminium / Tin Can", "Hammer & Nail", "Water & Freezer", "Spray Paint or Jute", "Tealight Candle"],
    safetyTip: "Fill with water and freeze solid first to prevent the can from bending during hammering.",
    marketplaceCategory: "Decor",
    steps: [
      {
        title: "Fill & Freeze Can Solid",
        description: "Fill the clean can with water and freeze overnight. The solid ice block provides backing so hammering won't dent the walls.",
      },
      {
        title: "Tape Pattern Stencil",
        description: "Wrap a printed paper stencil (constellations, mandalas, or tree shapes) around the frozen can with tape.",
      },
      {
        title: "Punch Light Holes",
        description: "Tap the nail gently with a hammer through the stencil dots to punch pin-hole light apertures all around the cylinder.",
      },
      {
        title: "Melt Ice & Sand Lip",
        description: "Rinse under warm water to melt the ice block. Smooth the top inner rim with sandpaper to remove any burrs.",
      },
      {
        title: "Insert Tealight",
        description: "Drop a battery tealight or candle inside. Watch magical starlight patterns illuminate your walls!",
      },
    ],
  },
];

export function findMatchingDiyGuide(material = "", itemName = ""): DiyProject {
  const query = `${material} ${itemName}`.toLowerCase();

  if (query.includes("plastic") || query.includes("bottle") || query.includes("pet") || query.includes("container")) {
    return DIY_GUIDES[0];
  }
  if (query.includes("glass") || query.includes("jar") || query.includes("flask")) {
    return DIY_GUIDES[1];
  }
  if (query.includes("cardboard") || query.includes("paper") || query.includes("box") || query.includes("carton")) {
    return DIY_GUIDES[2];
  }
  if (query.includes("textile") || query.includes("cloth") || query.includes("shirt") || query.includes("fabric")) {
    return DIY_GUIDES[3];
  }
  if (query.includes("metal") || query.includes("tin") || query.includes("can") || query.includes("aluminium")) {
    return DIY_GUIDES[4];
  }

  // Fallback to Plastic Planter
  return DIY_GUIDES[0];
}

interface DiyUpcycleGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: string;
  itemName?: string;
}

export const DiyUpcycleGuideModal = ({
  open,
  onOpenChange,
  material = "Plastic",
  itemName = "Bottle",
}: DiyUpcycleGuideModalProps) => {
  const navigate = useNavigate();
  const project = findMatchingDiyGuide(material, itemName);

  const [checkedTools, setCheckedTools] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleTool = (idx: number) => {
    setCheckedTools((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStep = (idx: number) => {
    const next = !completedSteps[idx];
    setCompletedSteps((prev) => ({ ...prev, [idx]: next }));

    if (next) {
      soundFx.triggerHaptic(25);
      // If all steps completed, play fanfare
      const allDone = project.steps.every((_, i) => (i === idx ? next : completedSteps[i]));
      if (allDone) {
        soundFx.playLevelUpFanfare();
        toast.success("🎉 Upcycling project completed! You're ready to list it or enjoy it!");
      }
    }
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = Math.round((completedCount / project.steps.length) * 100);

  const handleListOnMarketplace = () => {
    onOpenChange(false);
    const title = encodeURIComponent(`Upcycled ${project.projectTitle}`);
    const wasteType = encodeURIComponent(material || itemName);
    navigate(`/marketplace/new?title=${title}&category=${project.marketplaceCategory}&waste_type=${wasteType}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95%] rounded-3xl bg-card border-border p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-data px-2 py-0.5 rounded-full bg-category-upcycle/15 text-category-upcycle border border-category-upcycle/30 uppercase tracking-wider font-bold flex items-center gap-1">
              <Sparkles size={11} /> EcoBot DIY Studio
            </span>
            <span className="text-[10px] font-data text-muted-foreground flex items-center gap-1">
              <Clock size={11} /> ~{project.estimatedMinutes} Mins
            </span>
          </div>

          <DialogTitle className="text-lg font-display font-bold text-foreground">
            {project.projectTitle}
          </DialogTitle>
          <p className="text-xs text-muted-foreground font-body">
            Step-by-step upcycling project tailored for your scanned <strong className="text-foreground">{itemName || material}</strong>.
          </p>
        </DialogHeader>

        {/* Safety Tip Alert */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Maker Safety Tip:</strong> {project.safetyTip}
          </p>
        </div>

        {/* Tool Checklist */}
        <div>
          <h4 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wrench size={13} className="text-primary" />
            <span>Tools & Materials Needed</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {project.toolsNeeded.map((tool, idx) => {
              const isChecked = !!checkedTools[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleTool(idx)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all text-xs ${
                    isChecked
                      ? "bg-primary/10 border-primary/30 text-primary line-through"
                      : "bg-surface-alt border-border text-foreground/80 hover:bg-muted"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                      isChecked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                    }`}
                  >
                    {isChecked && <Check size={11} />}
                  </div>
                  <span className="truncate">{tool}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Progress Bar */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-1.5">
            <h4 className="text-xs font-display font-bold text-foreground uppercase tracking-wider">
              Step-by-Step Tutorial
            </h4>
            <span className="text-xs font-data font-bold text-primary">
              {completedCount} / {project.steps.length} Steps Done ({progressPct}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-category-upcycle to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Sequential Steps List */}
          <div className="space-y-3">
            {project.steps.map((step, idx) => {
              const isDone = !!completedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isDone
                      ? "bg-primary/5 border-primary/30 shadow-sm"
                      : "bg-surface-alt border-border/80 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-data font-bold flex-shrink-0 transition-colors ${
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {isDone ? <Check size={14} /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5
                        className={`text-xs font-display font-bold ${
                          isDone ? "text-primary line-through" : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {step.description}
                      </p>
                      {step.proTip && (
                        <div className="mt-2 p-2 rounded-lg bg-category-upcycle/10 text-category-upcycle text-[11px] font-data">
                          💡 <strong>Pro Tip:</strong> {step.proTip}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finished Project CTA: List on Marketplace */}
        <div className="pt-4 border-t border-border/60 space-y-2">
          <button
            onClick={handleListOnMarketplace}
            className="w-full py-3 rounded-xl bg-category-upcycle text-zinc-950 font-display font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-category-upcycle/20 hover:brightness-105 active:scale-98 transition-all"
          >
            <ShoppingBag size={15} />
            <span>Finished Making It? List on Marketplace</span>
            <ArrowRight size={14} />
          </button>
          <p className="text-[10px] text-center text-muted-foreground">
            Sell or gift your finished creation to local eco-buyers on W2W.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
