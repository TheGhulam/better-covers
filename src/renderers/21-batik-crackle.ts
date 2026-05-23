/**
 * 21 · Batik crackle — wax-resist crackle on indigo ground
 *
 * Indonesian batik: wax applied to cloth cracks during dyeing, leaving fine
 * warm resist lines on indigo. Synthetic crackle field from summed sinusoids
 * with seed phase offsets — fast nodal-line extraction without simulation.
 *
 * @module renderers/batik-crackle
 */

import { addGrain, addVignette, mulberry32, type Renderer } from "../shared";

export const renderBatikCrackle: Renderer = (ctx, W, H, SEED) => {
  const rand = mulberry32(SEED);
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const p3 = rand() * Math.PI * 2;
  const f1 = 0.06 + rand() * 0.03;
  const f2 = 0.05 + rand() * 0.025;
  const f3 = 0.04 + rand() * 0.02;

  const id = ctx.createImageData(W, H);
  const d = id.data;

  for (let y = 0; y < H; y++) {
    const sy = Math.sin(y * f2 + p2);
    for (let x = 0; x < W; x++) {
      const field =
        Math.sin(x * f1 + p1) +
        sy +
        Math.sin((x + y) * f3 + p3);
      const crack = Math.abs(field) < 0.22;

      const i = (y * W + x) << 2;
      if (crack) {
        const t = 1 - Math.abs(field) / 0.22;
        d[i] = (240 + t * 15) | 0;
        d[i + 1] = (232 + t * 8) | 0;
        d[i + 2] = (216 + t * 4) | 0;
      } else {
        const v = 26 + ((Math.sin(x * 0.02 + y * 0.015) + 1) * 8) | 0;
        d[i] = 26;
        d[i + 1] = 32;
        d[i + 2] = 48 + (v - 26);
      }
      d[i + 3] = 255;
    }
  }

  ctx.putImageData(id, 0, 0);
  addVignette(ctx, W, H);
  addGrain(ctx, W, H, 10);
};
