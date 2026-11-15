import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, RefreshCw, Sparkles, Check, Download, Share2, Layers, Move3d, Compass } from 'lucide-react';
import { Upcycle3DModelConfig } from '@/lib/threeDModels';
import { ThreeDModelViewer } from './ThreeDModelViewer';
import { soundFx } from '@/lib/soundFx';
import { toast } from 'sonner';

interface WebArCameraModalProps {
  model: Upcycle3DModelConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const WebArCameraModal = ({ model, isOpen, onClose }: WebArCameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [arTrackingState, setArTrackingState] = useState<'calibrating' | 'tracking'>('calibrating');
  const [snappedPhoto, setSnappedPhoto] = useState<string | null>(null);
  const [modelScale, setModelScale] = useState<number>(1);

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    const timer = setTimeout(() => {
      setArTrackingState('tracking');
    }, 1800);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);
      } else {
        setHasCamera(false);
      }
    } catch (e) {
      console.warn('Camera access not available or denied:', e);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCaptureArPhoto = () => {
    soundFx.playCameraClick();

    // Create snapshot from canvas/video
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw dark background or video frame
      if (videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#09090b');
        grad.addColorStop(1, '#064e3b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw AR watermark & badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.roundRect(24, canvas.height - 100, canvas.width - 48, 76, 16);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`REVIBE HUB · Web-AR 3D Upcycle`, 44, canvas.height - 58);

      ctx.fillStyle = '#f4f4f5';
      ctx.font = '18px sans-serif';
      ctx.fillText(`${model.targetProductName} · 1:1 Scale Spatial Preview`, 44, canvas.height - 30);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSnappedPhoto(dataUrl);
      toast.success('📸 AR Spatial Photo captured!');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <motion.div
          className="relative w-full h-full max-w-lg flex flex-col bg-zinc-950 overflow-hidden"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
        >
          {/* Camera Viewport or High-Tech Simulated Fallback */}
          <div className="relative flex-1 overflow-hidden flex items-center justify-center">
            {hasCamera ? (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-emerald-950/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                  <Move3d size={32} />
                </div>
                <h4 className="text-sm font-display font-bold text-foreground">Web-AR Spatial Studio</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Simulating room tracking. Place the 3D upcycled model on any flat surface.
                </p>
              </div>
            )}

            {/* Live Holographic AR HUD Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-16 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-16 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-24 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-24 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-400" />

              {/* Surface Leveling Horizon Line */}
              <div className="absolute top-1/2 left-8 right-8 h-px bg-emerald-500/30">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-data text-emerald-400 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full">
                  {arTrackingState === 'calibrating' ? 'Scanning Surface...' : 'Horizontal Plane Locked · 60 FPS'}
                </span>
              </div>

              {/* Real World Dimension Calipers */}
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/40 text-[10px] font-data text-emerald-300">
                W: {model.dimensionsCm.width}cm · H: {model.dimensionsCm.height}cm · Scale {modelScale.toFixed(1)}x
              </div>
            </div>

            {/* Centered Interactive 3D Model in AR Space */}
            <div className="relative z-10 w-full max-w-xs h-72">
              <ThreeDModelViewer
                model={model}
                currentStep={5}
                className="bg-transparent border-none shadow-none"
              />
            </div>
          </div>

          {/* Top Controls Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-display font-bold text-emerald-400">Web-AR Spatial Preview</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFlipCamera}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                title="Switch Camera"
              >
                <RefreshCw size={16} />
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Bottom AR Action Bar */}
          <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 z-20 flex items-center justify-between gap-4">
            {/* Scale Slider */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] font-data text-muted-foreground">0.5x</span>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={modelScale}
                onChange={(e) => setModelScale(Number(e.target.value))}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] font-data text-muted-foreground">2.0x</span>
            </div>

            {/* Shutter Snap Button */}
            <motion.button
              onClick={handleCaptureArPhoto}
              className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-zinc-950">
                <Camera size={22} />
              </div>
            </motion.button>
          </div>

          {/* Captured Photo Preview Modal */}
          {snappedPhoto && (
            <motion.div
              className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex flex-col p-6 items-center justify-between"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-full flex justify-between items-center text-white">
                <span className="text-xs font-display font-bold">AR Spatial Snapshot</span>
                <button onClick={() => setSnappedPhoto(null)} className="p-1 rounded-full bg-zinc-800">
                  <X size={16} />
                </button>
              </div>

              <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl">
                <img src={snappedPhoto} alt="AR Snapshot" className="w-full h-auto object-cover" />
              </div>

              <div className="w-full flex gap-3">
                <a
                  href={snappedPhoto}
                  download={`W2W-AR-${model.targetProductName.replace(/\s+/g, '-')}.jpg`}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-display font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> Download Photo
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                    setSnappedPhoto(null);
                  }}
                  className="px-4 py-3 rounded-xl bg-zinc-800 text-white font-display font-bold text-xs flex items-center gap-1.5"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
