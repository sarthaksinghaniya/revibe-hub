import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanBarcode, Search, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { QUICK_TEST_BARCODES, type BarcodeProduct } from "@/lib/barcodeApi";
import { soundFx } from "@/lib/soundFx";

interface BarcodeScannerOverlayProps {
  videoElement: HTMLVideoElement | null;
  onBarcodeScanned: (barcode: string) => Promise<void>;
  isProcessing: boolean;
}

export const BarcodeScannerOverlay = ({
  videoElement,
  onBarcodeScanned,
  isProcessing,
}: BarcodeScannerOverlayProps) => {
  const [manualCode, setManualCode] = useState("");
  const [detectorSupported, setDetectorSupported] = useState<boolean | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  // Check and setup native browser BarcodeDetector API (Chrome, Edge, Android)
  useEffect(() => {
    const hasDetector = typeof window !== "undefined" && "BarcodeDetector" in window;
    setDetectorSupported(hasDetector);

    if (!hasDetector || !videoElement) return;

    let detector: any = null;
    try {
      detector = new (window as any).BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
      });
    } catch (e) {
      console.warn("BarcodeDetector initialization failed:", e);
      return;
    }

    // Polling detector on the live video frame every 280ms
    scanIntervalRef.current = setInterval(async () => {
      if (isProcessing || !videoElement || videoElement.readyState < 2) return;

      try {
        const barcodes = await detector.detect(videoElement);
        if (barcodes && barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          if (code && code !== lastScannedRef.current) {
            lastScannedRef.current = code;
            soundFx.playBarcodeBeep();
            await onBarcodeScanned(code);
          }
        }
      } catch {
        // frame drop / hardware busy
      }
    }, 280);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [videoElement, isProcessing, onBarcodeScanned]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || isProcessing) return;
    soundFx.playBarcodeBeep();
    await onBarcodeScanned(manualCode.trim());
  };

  const handleQuickTest = async (barcode: string) => {
    if (isProcessing) return;
    setManualCode(barcode);
    soundFx.playBarcodeBeep();
    await onBarcodeScanned(barcode);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 z-20">
      {/* Top Banner */}
      <motion.div
        className="pointer-events-auto mt-14 px-4 py-2 rounded-full bg-card/90 backdrop-blur border border-primary/40 shadow-lg flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ScanBarcode size={16} className="text-primary animate-pulse" />
        <span className="text-xs font-semibold text-foreground">
          Barcode & FMCG Packaging Scanner
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">
          0ms AI Cost
        </span>
      </motion.div>

      {/* Center Barcode Reticle Viewfinder */}
      <div className="relative w-72 h-44 sm:w-80 sm:h-48 border-2 border-primary/60 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center justify-center">
        {/* Corner Reticles */}
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-primary" />

        {/* Oscillating Laser Beam */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444]"
          animate={{
            top: ["10%", "90%", "10%"],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary green laser glow */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981]"
          animate={{
            top: ["90%", "10%", "90%"],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner watermark label */}
        <div className="text-center px-4 bg-background/40 backdrop-blur-sm rounded-lg py-1 border border-border/40">
          <p className="text-[11px] font-medium text-foreground/90">
            Align barcode inside frame
          </p>
          <p className="text-[9px] text-muted-foreground font-mono">
            EAN-13 • UPC • Code-128 • QR
          </p>
        </div>

        {/* Processing Spinner Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-2"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-foreground">
                Reading Packaging Data...
              </p>
              <span className="text-[10px] text-muted-foreground font-mono">
                Querying Open Food Facts
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Manual Entry & Quick FMCG Test Pills */}
      <div className="pointer-events-auto w-full max-w-md space-y-3 mb-24">
        {/* Quick Test FMCG Barcodes */}
        <div className="bg-card/85 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              Test without a package:
            </span>
            <span className="text-[10px] text-muted-foreground">Tap to test</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_TEST_BARCODES.map((item) => (
              <button
                key={item.barcode}
                type="button"
                onClick={() => handleQuickTest(item.barcode)}
                disabled={isProcessing}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-secondary/80 hover:bg-primary/20 hover:text-primary transition-all text-xs font-medium border border-border/50 disabled:opacity-50"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Barcode Input Form */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or enter barcode (e.g. 8906014410012)"
              disabled={isProcessing}
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-card/90 backdrop-blur border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 font-mono"
            />
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCode.trim() || isProcessing}
            className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md shrink-0"
          >
            <span>Lookup</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
