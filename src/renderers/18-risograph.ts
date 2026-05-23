/**
 * 18 · Risograph — misregistered spot-color layers
 *
 * Two or three offset ink layers (seed-shifted) print the same fBm silhouette
 * with Riso-style registration drift.
 *
 * References
 * - Riso Kagaku duplicator process, 1980s.
 * - J. Hug, *Risomania: The New Spirit of Printing* (Niggli, 2018).
 *
 * @module renderers/risograph
 */

import {
  addGrain,
  addVignette,
  fbm,
  mulberry32,
  rgb,
  type Renderer,
} from "../shared";

export const renderRisograph: Renderer = (ctx, W, H, SEED) => {
  const r = mulberry32(SEED);
  const paperR = 240;
  const paperG = 224;
  const paperB = 208;
  const redR = 224;
  const redG = 80;
  const redB = 64;
  const blueR = 48;
  const blueG = 96;
  const blueB = 160;

  ctx.fillStyle = rgb(paperR, paperG, paperB);
  ctx.fillRect(0, 0, W, H);

  const cx = W * (0.45 + r() * 0.1);
  const cy = H * (0.4 + r() * 0.1);
  const layers = [
    {
      dx: (r() - 0.5) * 8,
      dy: (r() - 0.5) * 6,
      cr: redR,
      cg: redG,
      cb: redB,
      thresh: 0.52,
    },
    {
      dx: (r() - 0.5) * 10,
      dy: (r() - 0.5) * 8,
      cr: blueR,
      cg: blueG,
      cb: blueB,
      thresh: 0.48,
    },
    {
      dx: (r() - 0.5) * 6,
      dy: (r() - 0.5) * 10,
      cr: redR * 0.7 + blueR * 0.3,
      cg: redG * 0.7 + blueG * 0.3,
      cb: redB * 0.7 + blueB * 0.3,
      thresh: 0.58,
    },
  ];

  const id = ctx.createImageData(W, H);
  const base = id.data;
  for (let i = 0; i < base.length; i += 4) {
    base[i] = paperR;
    base[i + 1] = paperG;
    base[i + 2] = paperB;
    base[i + 3] = 255;
  }

  for (const layer of layers) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const sx = x - layer.dx;
        const sy = y - layer.dy;
        const dx = sx - cx;
        const dy = sy - cy;
        const blob = Math.exp(-(dx * dx + dy * dy) / (W * H * 0.018));
        const n = fbm(sx * 0.005, sy * 0.005, SEED, 3);
        if (n * 0.7 + blob * 0.5 < layer.thresh) continue;
        const i = (y * W + x) * 4;
        base[i] = Math.min(255, base[i] * 0.55 + layer.cr * 0.55);
        base[i + 1] = Math.min(255, base[i + 1] * 0.55 + layer.cg * 0.55);
        base[i + 2] = Math.min(255, base[i + 2] * 0.55 + layer.cb * 0.55);
      }
    }
  }

  ctx.putImageData(id, 0, 0);

  addVignette(ctx, W, H);
  addGrain(ctx, W, H, 13);
};
