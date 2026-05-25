/**
 * 20 · Barnsley fern — iterated function system attractor
 *
 * Plots 50 000 points from the classic four-map Barnsley fern IFS with
 * standard probabilities. Points are tonemapped by visit density for a
 * soft botanical silhouette.
 *
 * References
 * - M. Barnsley, *Fractals Everywhere* (Academic Press, 1988).
 *
 * @module renderers/barnsley-fern
 */

import { addGrain, addVignette, mulberry32, type Renderer } from "../shared";

export const renderBarnsleyFern: Renderer = (ctx, W, H, SEED) => {
  const rand = mulberry32(SEED);

  ctx.fillStyle = "#0a0c08";
  ctx.fillRect(0, 0, W, H);

  const hist = new Uint16Array(W * H);
  let x = 0;
  let y = 0;

  const N = 50_000;
  for (let i = 0; i < N; i++) {
    const p = rand();
    let nx: number;
    let ny: number;
    if (p < 0.01) {
      nx = 0;
      ny = 0.16 * y;
    } else if (p < 0.86) {
      nx = 0.85 * x + 0.04 * y;
      ny = -0.04 * x + 0.85 * y + 1.6;
    } else if (p < 0.93) {
      nx = 0.2 * x - 0.26 * y;
      ny = 0.23 * x + 0.22 * y + 1.6;
    } else {
      nx = -0.15 * x + 0.28 * y;
      ny = 0.26 * x + 0.24 * y + 0.44;
    }
    x = nx;
    y = ny;

    const px = (W * 0.5 + x * W * 0.095) | 0;
    const py = (H * 0.98 - y * H * 0.095) | 0;
    if (px >= 0 && px < W && py >= 0 && py < H) {
      const k = py * W + px;
      if (hist[k] < 65535) hist[k]++;
    }
  }

  const id = ctx.createImageData(W, H);
  const d = id.data;
  let maxH = 1;
  for (let i = 0; i < hist.length; i++) {
    if (hist[i] > maxH) maxH = hist[i];
  }

  for (let i = 0; i < W * H; i++) {
    const v = hist[i];
    if (!v) continue;
    const t = v / maxH;
    const k = i * 4;
    d[k] = Math.round(80 + (128 - 80) * t);
    d[k + 1] = Math.round(104 + (152 - 104) * t);
    d[k + 2] = Math.round(64 + (96 - 64) * t);
    d[k + 3] = Math.round(40 + 215 * Math.pow(t, 0.55));
  }
  ctx.putImageData(id, 0, 0);

  addVignette(ctx, W, H);
  addGrain(ctx, W, H, 8);
};
