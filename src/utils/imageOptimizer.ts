/**
 * Image processing & optimization utility for Facebook Post Composer
 * Ensures images look compact, sharp, and do not occupy excessive screen space (which causes lost engagement)
 */

export interface ImageOptimizationOptions {
  targetRatio?: "4:3" | "1:1" | "16:9" | "original";
  fitMode?: "cover" | "contain";
  maxDimension?: number; // e.g. 1200px
  quality?: number; // 0.88
}

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  originalSizeKb: number;
  optimizedSizeKb: number;
  isTooTall: boolean;
}

/**
 * Checks whether an aspect ratio is too tall (e.g. vertical screenshot 9:16),
 * which takes up excessive vertical screen space on Facebook feed and pushes CTA/text out of sight.
 */
export function isImageVerticalOrTooTall(width: number, height: number): boolean {
  if (width <= 0) return false;
  return height / width > 1.2; // height is 20%+ larger than width
}

/**
 * Optimizes an image File or DataURL to optimal Facebook dimensions
 */
export async function optimizeImage(
  source: File | string,
  options: ImageOptimizationOptions = {}
): Promise<ProcessedImageResult> {
  const {
    targetRatio = "4:3",
    fitMode = "cover",
    maxDimension = 1200,
    quality = 0.88,
  } = options;

  let originalDataUrl: string;
  let originalSizeKb = 0;

  if (source instanceof File) {
    originalSizeKb = Math.round(source.size / 1024);
    originalDataUrl = await readFileAsDataUrl(source);
  } else {
    originalDataUrl = source;
    // Estimate data url size in KB
    originalSizeKb = Math.round((source.length * 3) / 4 / 1024);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;
      const isTooTall = isImageVerticalOrTooTall(naturalWidth, naturalHeight);

      // Determine target aspect ratio
      let ratioValue: number | null = null;
      if (targetRatio === "4:3") ratioValue = 4 / 3;
      else if (targetRatio === "1:1") ratioValue = 1;
      else if (targetRatio === "16:9") ratioValue = 16 / 9;

      let canvasWidth = naturalWidth;
      let canvasHeight = naturalHeight;

      if (ratioValue !== null) {
        if (fitMode === "cover") {
          // Calculate crop bounds to fill the target aspect ratio
          let sourceWidth = naturalWidth;
          let sourceHeight = naturalHeight;
          const currentRatio = naturalWidth / naturalHeight;

          let sx = 0;
          let sy = 0;

          if (currentRatio > ratioValue) {
            // Original is wider than target ratio: crop sides
            sourceWidth = naturalHeight * ratioValue;
            sx = (naturalWidth - sourceWidth) / 2;
          } else {
            // Original is taller than target ratio: crop top/bottom (prioritizing top/center)
            sourceHeight = naturalWidth / ratioValue;
            sy = Math.max(0, (naturalHeight - sourceHeight) * 0.35); // slightly focus upper center
          }

          // Scale down to maxDimension if larger
          canvasWidth = Math.min(maxDimension, Math.round(sourceWidth));
          canvasHeight = Math.round(canvasWidth / ratioValue);

          const canvas = document.createElement("canvas");
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve({
              dataUrl: originalDataUrl,
              width: naturalWidth,
              height: naturalHeight,
              originalSizeKb,
              optimizedSizeKb: originalSizeKb,
              isTooTall,
            });
            return;
          }

          // Draw cropped & high quality scaled image
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(
            img,
            sx,
            sy,
            sourceWidth,
            sourceHeight,
            0,
            0,
            canvasWidth,
            canvasHeight
          );

          const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);
          const optimizedSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);

          resolve({
            dataUrl: optimizedDataUrl,
            width: canvasWidth,
            height: canvasHeight,
            originalSizeKb,
            optimizedSizeKb,
            isTooTall,
          });
          return;
        } else {
          // fitMode === 'contain' with aesthetic subtle blur/clean background
          canvasWidth = Math.min(maxDimension, 1200);
          canvasHeight = Math.round(canvasWidth / ratioValue);

          const canvas = document.createElement("canvas");
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve({
              dataUrl: originalDataUrl,
              width: naturalWidth,
              height: naturalHeight,
              originalSizeKb,
              optimizedSizeKb: originalSizeKb,
              isTooTall,
            });
            return;
          }

          // Subtle clean neutral backdrop
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Calculate fit positioning
          const imgScale = Math.min(
            canvasWidth / naturalWidth,
            canvasHeight / naturalHeight
          );
          const drawW = naturalWidth * imgScale;
          const drawH = naturalHeight * imgScale;
          const dx = (canvasWidth - drawW) / 2;
          const dy = (canvasHeight - drawH) / 2;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, dx, dy, drawW, drawH);

          const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);
          const optimizedSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);

          resolve({
            dataUrl: optimizedDataUrl,
            width: canvasWidth,
            height: canvasHeight,
            originalSizeKb,
            optimizedSizeKb,
            isTooTall,
          });
          return;
        }
      }

      // If 'original' ratio: only downscale if larger than maxDimension
      let scale = 1;
      if (naturalWidth > maxDimension || naturalHeight > maxDimension) {
        scale = Math.min(maxDimension / naturalWidth, maxDimension / naturalHeight);
      }

      canvasWidth = Math.round(naturalWidth * scale);
      canvasHeight = Math.round(naturalHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve({
          dataUrl: originalDataUrl,
          width: naturalWidth,
          height: naturalHeight,
          originalSizeKb,
          optimizedSizeKb: originalSizeKb,
          isTooTall,
        });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);
      const optimizedSizeKb = Math.round((optimizedDataUrl.length * 3) / 4 / 1024);

      resolve({
        dataUrl: optimizedDataUrl,
        width: canvasWidth,
        height: canvasHeight,
        originalSizeKb,
        optimizedSizeKb,
        isTooTall,
      });
    };

    img.onerror = () => {
      // In case of cross-origin or load error, return original
      resolve({
        dataUrl: originalDataUrl,
        width: 800,
        height: 600,
        originalSizeKb,
        optimizedSizeKb: originalSizeKb,
        isTooTall: false,
      });
    };

    img.src = originalDataUrl;
  });
}

/**
 * Helper to read a File into Data URL
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as string"));
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
