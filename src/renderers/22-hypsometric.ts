/**
 * 22 · Hypsometric tint — elevation color-band bathymetry
 *
 * A scalar heightfield maps to discrete hypsometric color bands from deep
 * water through shallow shelf to lowland and highland, following NOAA/GEBCO
 * bathymetric symbology in stylized form.
 *
 * References
 * - NOAA/GEBCO bathymetric symbology.
 *
 * @module renderers/hypsometric
 */

import { addGrain, addVignette, mulberry32, type Renderer } from "../shared";

const BANDS = [
  { lo: -1.0, r: 26, g: 40, b: 64 },
  { lo: -0.4, r: 58, g: 120, b: 130 },
  { lo: -0.05, r: 90, g: 150, b: 140 },
  { lo: 0.15, r: 160, g: 140, b: 90 },
  { lo: 0.35, r: 200, g: 136, b: 74 },
  { lo: 0.55, r: 180, g: 160, b: 120 },
  { lo: 1.0, r: 220, g: 210, b: 190 },
];

function elevation(x: number, y: number, s: number): number {
  return (
    Math.sin(x * 0.005 + s) * Math.cos(y * 0.004) +
    0.35 * Math.sin(x * 0.011 + y * 0.008 + s * 0.5) +
    0.15
  );
}

export const renderHypsometric: Renderer = (ctx, W, H, SEED) => {
  const r = mulberry32(SEED);
  const phase = r() * Math.PI * 2;

  const id = ctx.createImageData(W, H);
  const d = id.data;
  const stride = 2;

  for (let y = 0; y < H; y += stride) {
    for (let x = 0; x < W; x += stride) {
      const h = elevation(x, y, phase);
      let band = BANDS[0];
      for (let i = BANDS.length - 1; i >= 0; i--) {
        if (h >= BANDS[i].lo) {
          band = BANDS[i];
          break;
        }
      }

      for (let sy = 0; sy < stride && y + sy < H; sy++) {
        for (let sx = 0; sx < stride && x + sx < W; sx++) {
          const i = ((y + sy) * W + (x + sx)) * 4;
          d[i] = band.r;
          d[i + 1] = band.g;
          d[i + 2] = band.b;
          d[i + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(id, 0, 0);

  addVignette(ctx, W, H);
  addGrain(ctx, W, H, 8);
};
