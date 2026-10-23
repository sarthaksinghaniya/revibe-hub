/**
 * W2W Client-Side Image Optimizer
 * --------------------------------
 * Downscales camera and gallery images before sending them to the AI vision endpoint.
 * Reduces 3-6MB mobile camera captures down to ~150-250KB, dramatically slashing
 * network transfer latency (by ~80%) and cloud bandwidth egress.
 */

export interface OptimizationResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

export function estimateBase64Size(base64: string): number {
  if (!base64) return 0;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const base64Length = base64.includes(",") ? base64.split(",")[1].length : base64.length;
  return Math.max(0, Math.floor((base64Length * 3) / 4) - padding);
}

/**
 * Compresses and resizes an image base64 data URL via an off-screen HTML5 Canvas.
 *
 * @param base64Data - Raw data URL (image/jpeg, image/png, etc.)
 * @param maxDimension - Maximum width or height in pixels (default: 1024)
 * @param quality - Output JPEG quality between 0.1 and 1.0 (default: 0.82)
 */
export async function optimizeImageForAi(
  base64Data: string,
  maxDimension = 1024,
  quality = 0.82
): Promise<OptimizationResult> {
  const originalBytes = estimateBase64Size(base64Data);

  // If in non-browser environment or empty data, return directly
  if (typeof window === "undefined" || !base64Data) {
    return {
      dataUrl: base64Data,
      originalBytes,
      compressedBytes: originalBytes,
      reductionPercentage: 0,
      width: 0,
      height: 0,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let { width, height } = img;

      // Calculate proportional dimensions
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { willReadFrequently: false });
      if (!ctx) {
        // Fallback to original if canvas context unavailable
        resolve({
          dataUrl: base64Data,
          originalBytes,
          compressedBytes: originalBytes,
          reductionPercentage: 0,
          width: img.width,
          height: img.height,
        });
        return;
      }

      // Smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Output as compressed JPEG
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      const compressedBytes = estimateBase64Size(compressedDataUrl);
      const reductionPercentage =
        originalBytes > 0
          ? Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100))
          : 0;

      resolve({
        dataUrl: compressedDataUrl,
        originalBytes,
        compressedBytes,
        reductionPercentage,
        width,
        height,
      });
    };

    img.onerror = () => {
      // Return original on decode error
      resolve({
        dataUrl: base64Data,
        originalBytes,
        compressedBytes: originalBytes,
        reductionPercentage: 0,
        width: 0,
        height: 0,
      });
    };

    img.src = base64Data;
  });
}
