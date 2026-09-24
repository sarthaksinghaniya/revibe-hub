import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ScanLine from "@/components/Scanner/ScanLine";
import ScanBrackets from "@/components/Scanner/ScanBrackets";
import CaptureButton from "@/components/Scanner/CaptureButton";
import ResultSheet from "@/components/Results/ResultSheet";
import { scanWasteImage, type MultiScanResult } from "@/lib/scanApi";

const Scanner = () => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<MultiScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);

  const processImage = async (imageSrc: string) => {
    setIsProcessing(true);
    try {
      const scanResult = await scanWasteImage(imageSrc);
      setResult(scanResult);
    } catch (e) {
      console.error("Scan failed:", e);
      toast.error(e instanceof Error ? e.message : "Failed to analyze image. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = useCallback(async () => {
    if (isProcessing) return;
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error("Could not capture image. Please try again.");
      return;
    }
    setCapturedImage(imageSrc);
    await processImage(imageSrc);
  }, [isProcessing]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-uploaded if needed
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = reader.result as string;
      setCapturedImage(imageData);
      await processImage(imageData);
    };
    reader.onerror = () => {
      toast.error("Failed to read the image file. Please try another.");
    };
    reader.readAsDataURL(file);
  };

  const handleScanAgain = () => {
    setResult(null);
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-background">
      {/* Camera / Image */}
      <div className="absolute inset-0">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6">
            <ImageIcon size={48} className="text-muted-foreground" />
            <p className="text-center text-muted-foreground text-sm">
              Camera not available. Upload an image instead.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold"
            >
              <Upload size={16} />
              Upload Image
            </button>
          </div>
        ) : (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="w-full h-full object-cover"
            onUserMediaError={() => setCameraError(true)}
          />
        )}
      </div>

      {/* Scan overlays — hidden while processing or result shown */}
      {!result && !cameraError && (
        <>
          <ScanLine fast={isProcessing} />
          <ScanBrackets />
        </>
      )}

      {/* White flash on capture */}
      <AnimatePresence>
        {isProcessing && capturedImage && (
          <motion.div
            className="absolute inset-0 bg-foreground/20 pointer-events-none z-20"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Live badge */}
      {!result && !cameraError && !isProcessing && (
        <motion.div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-data text-muted-foreground">
            Point camera at waste item
          </span>
        </motion.div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <motion.div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-primary/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-xs font-data text-primary animate-glow-pulse">
            ANALYZING...
          </span>
        </motion.div>
      )}

      {/* Bottom controls */}
      {!result && (
        <div className="absolute bottom-24 left-0 right-0 flex items-center justify-center gap-6 z-20">
          {!cameraError && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload size={18} />
              </button>
              <CaptureButton onCapture={handleCapture} isProcessing={isProcessing} />
              <div className="w-12 h-12" /> {/* Spacer */}
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Result Sheet */}
      <ResultSheet
        result={result}
        onClose={() => setResult(null)}
        onScanAgain={handleScanAgain}
      />
    </div>
  );
};

export default Scanner;