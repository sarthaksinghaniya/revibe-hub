import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, Share2, RotateCcw, Leaf, ShoppingBag, Building2, Layers, Volume2, VolumeX, Globe, Play, Square, Sparkles, Gift } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import VideoSuggestions from "./VideoSuggestions";
import ShareScanModal from "./ShareScanModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { MultiScanResult, ScanItem } from "@/lib/scanApi";
import { getMunicipalRule } from "@/data/municipalRules";
import { useCashRewards } from "@/hooks/useCashRewards";

// Re-export legacy alias for back-compat
export type ScanResult = MultiScanResult;

const categoryDisplay: Record<string, "Recyclable" | "Compostable" | "Hazardous" | "Landfill" | "Upcyclable"> = {
  recyclable: "Recyclable",
  compostable: "Compostable",
  hazardous: "Hazardous",
  landfill: "Landfill",
  upcyclable: "Upcyclable",
};

const categoryHindiMap: Record<string, string> = {
  recyclable: "रिसाइकिल योग्य (Recyclable)",
  compostable: "कंपोस्टेबल (Compostable)",
  hazardous: "हानिकारक अपशिष्ट (Hazardous)",
  landfill: "लैंडफिल कचरा (Landfill)",
  upcyclable: "अपसाइकिल योग्य (Upcyclable)",
};

interface ResultSheetProps {
  result: MultiScanResult | null;
  onClose: () => void;
  onScanAgain: () => void;
}

const ResultSheet = ({ result, onClose, onScanAgain }: ResultSheetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rewardState, registerScan } = useCashRewards();

  const [shareOpen, setShareOpen] = useState(false);
  const [city, setCity] = useState<string>("");
  const [unlockedBanner, setUnlockedBanner] = useState<boolean>(false);
  const registeredScanIdRef = useRef<string | null>(null);

  // AI Voice Assistant State
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem("w2w_voice_enabled") !== "false";
  });
  const [voiceLang, setVoiceLang] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("w2w_voice_lang") as "en" | "hi") || "en";
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Geolocation lookup
  useEffect(() => {
    if (!result) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const j = await r.json();
          const c = j?.address?.city || j?.address?.town || j?.address?.village || j?.address?.state_district || "";
          setCity(c);
        } catch {
          /* silent */
        }
      },
      () => {/* denied — skip */}
    );
  }, [result]);

  // 5-Scan Milestone Reward Trigger
  useEffect(() => {
    if (!result) {
      setUnlockedBanner(false);
      registeredScanIdRef.current = null;
      return;
    }

    const currentScanId = result.items[0]?.name
      ? `${result.items[0].name}_${result.items.length}_${result.total_credits}`
      : `scan_${Date.now()}`;

    if (registeredScanIdRef.current !== currentScanId) {
      registeredScanIdRef.current = currentScanId;
      const res = registerScan(currentScanId);
      if (res.unlockedReward) {
        setUnlockedBanner(true);
        toast.success("🎉 ₹2 CASH REWARD UNLOCKED! Added to your wallet.", { duration: 5000 });
      }
    }
  }, [result, registerScan]);

  // Setup Web Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Save voice preferences
  useEffect(() => {
    localStorage.setItem("w2w_voice_enabled", String(voiceEnabled));
  }, [voiceEnabled]);

  useEffect(() => {
    localStorage.setItem("w2w_voice_lang", voiceLang);
  }, [voiceLang]);

  // Generate speech script for English or Hindi
  const buildSpeechText = (res: MultiScanResult, lang: "en" | "hi") => {
    if (!res || !res.items.length) return "";
    const item = res.items[0];
    const catEn = categoryDisplay[item.category] || "Landfill";
    const catHi = categoryHindiMap[item.category] || "लैंडफिल कचरा";

    if (lang === "hi") {
      let script = `स्कैन किया गया कचरा: ${item.name}। प्रकार: ${catHi}।`;
      if (item.disposal_steps.length > 0) {
        script += ` निपटान निर्देश: ${item.disposal_steps.join(". ")}।`;
      }
      if (item.upcycle_ideas.length > 0) {
        script += ` अपसाइकिल विचार: ${item.upcycle_ideas.slice(0, 2).join(". ")}।`;
      }
      return script;
    } else {
      let script = `Scanned waste item: ${item.name}. Classification: ${catEn}.`;
      if (item.disposal_steps.length > 0) {
        script += ` Disposal steps: ${item.disposal_steps.join(". ")}.`;
      }
      if (item.upcycle_ideas.length > 0) {
        script += ` Upcycle ideas: ${item.upcycle_ideas.slice(0, 2).join(", ")}.`;
      }
      return script;
    }
  };

  const speakText = (text: string, lang: "en" | "hi") => {
    if (!synthRef.current || !text) return;

    synthRef.current.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95; // slightly relaxed reading pace

    // Fallback voice select if available
    const voices = synthRef.current.getVoices();
    if (lang === "hi") {
      const hiVoice = voices.find((v) => v.lang.includes("hi"));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      const enVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en"));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-speak on new scan result if voiceEnabled is true
  useEffect(() => {
    if (result && voiceEnabled) {
      const text = buildSpeechText(result, voiceLang);
      // Small timeout to allow sheet enter animation
      const timer = setTimeout(() => {
        speakText(text, voiceLang);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    } else {
      stopSpeaking();
    }
  }, [result, voiceEnabled, voiceLang]);

  if (!result) return null;

  const isMulti = result.scan_type === "multi";
  const firstItem = result.items[0];

  // Milestone counters
  const currentMilestone = rewardState.milestoneCount;
  const milestonePct = (currentMilestone / 5) * 100;

  const renderItemCard = (item: ScanItem, idx: number) => {
    const displayCat = categoryDisplay[item.category] || "Landfill";
    const rule = city ? getMunicipalRule(city, item.category) : null;
    return (
      <motion.div
        key={idx}
        className="p-4 rounded-xl bg-surface-alt border border-border mb-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.06 }}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-display font-bold text-foreground">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <CategoryBadge category={displayCat} />
              <span className="text-[10px] font-data text-muted-foreground">{item.confidence}% match</span>
            </div>
            <p className="text-[10px] font-data text-muted-foreground mt-1">Material: {item.material}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-display font-bold tabular-nums ${item.reduced_credits ? "text-muted-foreground" : "text-primary"}`}>
              +{Math.round((item.co2_saved_kg || 0) * 1000)}g CO₂
            </p>
            {item.reduced_credits && (
              <p className="text-[9px] font-data text-destructive">rate-limited (30%)</p>
            )}
          </div>
        </div>

        {item.disposal_steps.length > 0 && (
          <ol className="space-y-1.5 mt-3">
            {item.disposal_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-data font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-xs text-foreground/80">{step}</span>
              </li>
            ))}
          </ol>
        )}

        {rule && (
          <div className="mt-3 p-3 rounded-lg bg-category-compost/10 border border-category-compost/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Building2 size={12} className="text-category-compost" />
              <span className="text-[10px] font-display font-bold text-category-compost uppercase tracking-wider">
                As per {rule.authority}
              </span>
            </div>
            <p className="text-[11px] text-foreground/80 leading-relaxed">{rule.local_instruction}</p>
          </div>
        )}

        {item.upcycle_ideas.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.upcycle_ideas.map((idea, i) => (
              <span key={i} className="text-[10px] font-data px-2 py-1 rounded-md bg-category-upcycle/15 text-category-upcycle border border-category-upcycle/20">
                💡 {idea}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-3 text-[10px] font-data text-muted-foreground">
          <span className="flex items-center gap-1"><Leaf size={10} className="text-category-compost" />{item.co2_saved_kg}kg CO₂</span>
          <span>💧 {item.water_saved_liters}L water</span>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {result && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-card border-t border-border lg:inset-x-auto lg:right-6 lg:bottom-6 lg:left-auto lg:w-[480px] lg:rounded-2xl lg:border lg:max-h-[85vh]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-6 pb-24 lg:pb-6">
              {/* Handle (mobile) */}
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4 lg:hidden" />

              {/* Top Bar: AI Voice Controls & Cash Balance */}
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-background to-secondary border border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-display font-bold text-foreground">AI Voice Guide</span>
                      {isSpeaking && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-data text-muted-foreground">
                      {voiceEnabled ? (voiceLang === "hi" ? "हिंदी व्याख्या ऑन" : "English Audio On") : "Audio Muted"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Language Switcher */}
                  <button
                    onClick={() => {
                      const nextLang = voiceLang === "en" ? "hi" : "en";
                      setVoiceLang(nextLang);
                      toast.info(nextLang === "hi" ? "हिंदी ऑडियो मोड सक्रिय" : "English Audio Mode Active");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-data border border-border hover:bg-secondary/80 transition-colors"
                    title="Switch Audio Language"
                  >
                    <Globe size={13} className="text-primary" />
                    <span>{voiceLang === "en" ? "🇬🇧 EN" : "🇮🇳 HI"}</span>
                  </button>

                  {/* Play / Stop Button */}
                  {voiceEnabled && (
                    <button
                      onClick={() => {
                        if (isSpeaking) {
                          stopSpeaking();
                        } else {
                          speakText(buildSpeechText(result, voiceLang), voiceLang);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors"
                      title={isSpeaking ? "Stop Audio" : "Play Audio"}
                    >
                      {isSpeaking ? <Square size={14} className="fill-primary" /> : <Play size={14} className="fill-primary" />}
                    </button>
                  )}

                  {/* Toggle Mute / Unmute */}
                  <button
                    onClick={() => {
                      const nextState = !voiceEnabled;
                      setVoiceEnabled(nextState);
                      if (!nextState) stopSpeaking();
                    }}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      voiceEnabled
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                    title={voiceEnabled ? "Mute Voice Guidance" : "Unmute Voice Guidance"}
                  >
                    {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                </div>
              </div>

              {/* 5-Scan Milestone Progress Bar & ₹2 Reward Banner */}
              <div className="mb-5 p-3.5 rounded-xl bg-card border border-primary/25 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Gift size={15} className="text-category-upcycle animate-bounce" />
                    <span className="text-xs font-display font-bold text-foreground">
                      Scan Milestone: <span className="text-primary">{currentMilestone} / 5</span> Scans
                    </span>
                  </div>
                  <span className="text-xs font-data font-bold text-category-upcycle bg-category-upcycle/15 px-2 py-0.5 rounded-full border border-category-upcycle/30">
                    ₹{rewardState.cashBalance} Cash Earned
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden relative mb-1.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-category-upcycle"
                    initial={{ width: 0 }}
                    animate={{ width: `${milestonePct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-data text-muted-foreground">
                  <span>Every 5 scans unlocks ₹2 cash reward</span>
                  <span>{5 - currentMilestone} more scan{5 - currentMilestone !== 1 ? "s" : ""} to next ₹2</span>
                </div>

                {/* Unlocked Reward Announcement */}
                <AnimatePresence>
                  {(unlockedBanner || currentMilestone === 0 && rewardState.scanCount > 0) && (
                    <motion.div
                      className="mt-2.5 p-2.5 rounded-lg bg-gradient-to-r from-emerald-500/20 via-primary/20 to-amber-500/20 border border-emerald-500/40 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-xs font-display font-extrabold text-emerald-400 flex items-center justify-center gap-1.5">
                        🎉 ₹2 CASH REWARD UNLOCKED!
                      </p>
                      <p className="text-[10px] font-data text-foreground/90 mt-0.5">
                        Transferred to your Cash Rewards Balance in Carbon Wallet.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isMulti && (
                <motion.div
                  className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-category-compost/15 border border-category-compost/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Layers size={12} className="text-category-compost" />
                  <span className="text-[10px] font-display font-bold text-category-compost uppercase tracking-wider">
                    Mixed Waste Detected • {result.items.length} items
                  </span>
                </motion.div>
              )}

              {!isMulti && firstItem && (
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  {firstItem.name}
                </h2>
              )}

              {/* Render all items */}
              <div>
                {result.items.map((it, i) => renderItemCard(it, i))}
              </div>

              {/* Total summary */}
              {(() => {
                const totalG = Math.round(result.items.reduce((s, it) => s + (it.co2_saved_kg || 0) * 1000, 0));
                return (
                  <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                    <p className="text-xs font-data text-muted-foreground uppercase tracking-wider">CO₂ added to reservoir</p>
                    <p className="text-2xl font-display font-bold text-primary tabular-nums">
                      +{totalG} g <span className="text-sm text-muted-foreground font-normal">across {result.items.length} item{result.items.length > 1 ? "s" : ""}</span>
                    </p>
                    {result.total_credits > 0 ? (
                      <p className="text-[11px] font-data text-category-compost mt-1">
                        🎉 +{result.total_credits} CC minted to your wallet!
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Reservoir mints 1 CC per 1,000 g · check your Wallet
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* YouTube Videos for first item */}
              {firstItem && (
                <VideoSuggestions
                  category={categoryDisplay[firstItem.category] || "Landfill"}
                  itemName={firstItem.name}
                />
              )}

              {/* Actions */}
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => {
                    stopSpeaking();
                    onScanAgain();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold hover:bg-primary/90 transition-colors"
                >
                  <RotateCcw size={16} />
                  Scan Again
                </button>
                <button
                  onClick={() => {
                    stopSpeaking();
                    navigate("/facilities");
                  }}
                  className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors"
                >
                  <MapPin size={16} />
                </button>
                <button
                  onClick={() => {
                    if (!user) { toast.error("Login to share scans"); return; }
                    setShareOpen(true);
                  }}
                  className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground border border-border hover:border-primary/30 transition-colors"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {firstItem && (
                <button
                  onClick={() => {
                    stopSpeaking();
                    navigate(`/marketplace/new?waste_type=${encodeURIComponent(firstItem.material || firstItem.name)}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-category-upcycle/15 text-category-upcycle border border-category-upcycle/20 font-display font-bold text-sm hover:bg-category-upcycle/25 transition-colors"
                >
                  <ShoppingBag size={16} />
                  List This as Upcycled
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareScanModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        scanId={null}
        itemName={firstItem?.name || ""}
      />
    </>
  );
};

export default ResultSheet;
