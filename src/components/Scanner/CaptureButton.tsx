import { motion } from "framer-motion";

interface CaptureButtonProps {
  onCapture: () => void;
  isProcessing: boolean;
}

const CaptureButton = ({ onCapture, isProcessing }: CaptureButtonProps) => {
  return (
    <motion.button
      className="relative w-20 h-20 rounded-full flex items-center justify-center"
      onClick={onCapture}
      disabled={isProcessing}
      whileTap={{ scale: 0.9 }}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full border-2 border-primary animate-glow-pulse glow-primary" />
      {/* Inner circle */}
      <div
        className={`w-16 h-16 rounded-full border-4 border-foreground/80 transition-colors ${
          isProcessing ? "bg-destructive/50" : "bg-primary/20"
        }`}
      />
      {isProcessing && (
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      )}
    </motion.button>
  );
};

export default CaptureButton;
