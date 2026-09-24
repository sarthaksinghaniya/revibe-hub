import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Flame, Leaf, Sparkles, Download, Trophy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface EcoWrappedCardProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
  totalScans: number;
  totalCO2Kg: number;
  streakDays: number;
  topCategory: string;
  levelName: string;
}

export const EcoWrappedCard = ({
  open,
  onClose,
  userName = "Eco Warrior",
  totalScans = 12,
  totalCO2Kg = 3.5,
  streakDays = 5,
  topCategory = "Recyclable",
  levelName = "Green Scout",
}: EcoWrappedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const shareText = `🌱 My W2W Eco-Wrapped 2026! 🌍\n` +
    `• Scanned ${totalScans} items\n` +
    `• Saved ${totalCO2Kg.toFixed(1)} kg CO₂\n` +
    `• 🔥 ${streakDays}-Day Bio-Digital Streak\n` +
    `• Top Skill: ${topCategory}\n\n` +
    `Join me on UpcycleIT & save the planet! ♻️✨`;

  const handleWhatsAppStatus = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    toast.success("Opening WhatsApp to post your Eco-Wrapped status!");
  };

  const handleFacebookShare = () => {
    const encodedUrl = encodeURIComponent(window.location.origin);
    const encodedQuote = encodeURIComponent(shareText);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`, "_blank");
    toast.success("Opening Facebook share!");
  };

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(shareText);
    toast.success("Eco-Wrapped text copied! Opening Instagram for Reels/Stories post...", { duration: 4000 });
    setTimeout(() => {
      window.open("https://www.instagram.com", "_blank");
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-emerald-500/40 bg-zinc-950 text-white shadow-2xl flex flex-col justify-between p-6 min-h-[540px]"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          ref={cardRef}
        >
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Card Header */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-data uppercase tracking-widest mb-3">
              <Sparkles size={12} /> W2W ECO-WRAPPED 2026
            </div>
            <h3 className="text-2xl font-display font-extrabold text-white tracking-tight">
              {userName}'s Impact
            </h3>
            <p className="text-xs font-data text-emerald-300/80 mt-0.5">
              Gen-Z Bio-Digital Carbon Profile
            </p>
          </div>

          {/* Center Stats Matrix */}
          <div className="relative z-10 space-y-3 my-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-zinc-900 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-data text-emerald-300 uppercase tracking-wider block">Total CO₂ Saved</span>
                <span className="text-3xl font-display font-extrabold text-emerald-400 tabular-nums">
                  {totalCO2Kg.toFixed(1)} <span className="text-sm font-normal text-emerald-200">kg</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Leaf size={24} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-orange-400 font-data font-bold mb-1">
                  <Flame size={14} /> Streak
                </div>
                <div className="text-xl font-display font-bold text-white tabular-nums">
                  {streakDays} Days
                </div>
                <span className="text-[9px] font-data text-zinc-400">Bio-Digital Streak</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-data font-bold mb-1">
                  <Trophy size={14} /> Level
                </div>
                <div className="text-sm font-display font-bold text-white truncate">
                  {levelName}
                </div>
                <span className="text-[9px] font-data text-zinc-400">{totalScans} items logged</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-data">Top Scanned Waste:</span>
              <span className="text-emerald-300 font-display font-bold">{topCategory}</span>
            </div>
          </div>

          {/* Social Sharing Actions (WhatsApp / Instagram / Facebook) */}
          <div className="relative z-10 space-y-2 pt-2 border-t border-zinc-800/80">
            <p className="text-[10px] font-data text-zinc-400 text-center uppercase tracking-wider mb-1">
              Flex on Socials (India 🇮🇳)
            </p>

            <div className="grid grid-cols-3 gap-2">
              {/* WhatsApp Status */}
              <button
                onClick={handleWhatsAppStatus}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-colors"
              >
                <Share2 size={16} className="mb-1" />
                <span className="text-[10px] font-display font-bold">WhatsApp</span>
              </button>

              {/* Instagram Reels / Story */}
              <button
                onClick={handleInstagramShare}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-pink-600/20 text-pink-300 border border-pink-500/40 hover:bg-pink-600/30 transition-colors"
              >
                <Sparkles size={16} className="mb-1" />
                <span className="text-[10px] font-display font-bold">Instagram</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 transition-colors"
              >
                <ExternalLink size={16} className="mb-1" />
                <span className="text-[10px] font-display font-bold">Facebook</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EcoWrappedCard;
