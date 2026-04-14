/**
 * Extracts the most visually dominant single-tone color from an image URL.
 * Uses canvas to sample the image, quantizes to 5-bit per channel (32 levels),
 * then finds the most frequent bucket excluding near-white and near-black.
 */
export function extractDominantColor(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const SIZE = 80;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) { resolve('#888888'); return; }

        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        // Quantize to 32 levels per channel (5-bit)
        const Q = 8; // 256 / Q = bucket size
        const buckets = new Map<string, number>();

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue; // skip transparent

          const r = Math.round(data[i    ] / Q) * Q;
          const g = Math.round(data[i + 1] / Q) * Q;
          const b = Math.round(data[i + 2] / Q) * Q;

          // Skip near-white (> 220 all channels) and near-black (< 30 all)
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum > 220 || lum < 25) continue;

          const key = `${r},${g},${b}`;
          buckets.set(key, (buckets.get(key) ?? 0) + 1);
        }

        if (buckets.size === 0) {
          resolve('#888888');
          return;
        }

        // Find most frequent bucket
        let maxCount = 0;
        let dominant = '128,128,128';
        for (const [key, count] of buckets) {
          if (count > maxCount) {
            maxCount = count;
            dominant = key;
          }
        }

        const [r, g, b] = dominant.split(',').map(Number);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        resolve(hex);
      } catch {
        resolve('#888888');
      }
    };

    img.onerror = () => resolve('#888888');
    img.src = src;
  });
}
