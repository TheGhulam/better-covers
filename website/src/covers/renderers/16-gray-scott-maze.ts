/**
 * 16 · Gray-Scott — reaction-diffusion maze
 *
 * Activator V and substrate U evolve on a coarse grid in Pearson's labyrinth
 * (maze) regime, then upscale to canvas resolution.
 *
 * References
 * - J. E. Pearson, *Complex Patterns in a Simple System*, Science **261**,
 *   189–192 (1993). [doi:10.1126/science.261.5118.189](https://doi.org/10.1126/science.261.5118.189)
 * - J. C. Gray & P. Scott, autocatalytic model (1984).
 *
 * @module renderers/gray-scott-maze
 */

import {
  addGrain,
  addVignette,
  mulberry32,
  toneMapField,
  type Renderer,
} from "../shared";

const BG: [number, number, number] = [18, 16, 24];
const CHANNEL: [number, number, number] = [212, 165, 90];
const WALL: [number, number, number] = [39, 64, 89];

function lap5(
  f: Float32Array,
  x: number,
  y: number,
  w: number,
  h: number,
): number {
  const i = y * w + x;
  const l = x > 0 ? f[i - 1] : f[i];
  const r = x < w - 1 ? f[i + 1] : f[i];
  const u = y > 0 ? f[i - w] : f[i];
  const d = y < h - 1 ? f[i + w] : f[i];
  return l + r + u + d - 4 * f[i];
}

export const renderGrayScottMaze: Renderer = (ctx, W, H, SEED) => {
  const rand = mulberry32(SEED);

  const gw = 120;
  const gh = Math.max(8, Math.round((gw * H) / W));
  const n = gw * gh;
  const u = new Float32Array(n).fill(1);
  const v = new Float32Array(n).fill(0);
  const uN = new Float32Array(n);
  const vN = new Float32Array(n);

  for (let i = 0; i < 6; i++) {
    const x = 2 + Math.floor(rand() * (gw - 4));
    const y = 2 + Math.floor(rand() * (gh - 4));
    const rad = 2 + Math.floor(rand() * 3);
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        if (dx * dx + dy * dy <= rad * rad) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < gw && py >= 0 && py < gh) {
            v[py * gw + px] = 0.85 + rand() * 0.15;
            u[py * gw + px] = 0.45 + rand() * 0.15;
          }
        }
      }
    }
  }
  const cx = Math.floor(gw * (0.38 + rand() * 0.24));
  const cy = Math.floor(gh * (0.32 + rand() * 0.2));
  const sz = 5 + Math.floor(rand() * 4);
  for (let y = cy - sz; y <= cy + sz; y++) {
    for (let x = cx - sz; x <= cx + sz; x++) {
      if (x >= 0 && x < gw && y >= 0 && y < gh) {
        v[y * gw + x] = 1;
        u[y * gw + x] = 0.5;
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (rand() < 0.02) v[i] = 0.5 + rand() * 0.5;
  }

  const Du = 0.21;
  const Dv = 0.105;
  const F = 0.029;
  const k = 0.057;
  const dt = 0.5;

  for (let step = 0; step < 1200; step++) {
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const i = y * gw + x;
        const lu = lap5(u, x, y, gw, gh);
        const lv = lap5(v, x, y, gw, gh);
        const uvv = u[i] * v[i] * v[i];
        uN[i] = u[i] + dt * (Du * lu - uvv + F * (1 - u[i]));
        vN[i] = v[i] + dt * (Dv * lv + uvv - (F + k) * v[i]);
      }
    }
    u.set(uN);
    v.set(vN);
  }

  const img = ctx.createImageData(W, H);
  const d = img.data;
  const sx = gw / W;
  const sy = gh / H;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const gx = Math.min(gw - 1, Math.floor(px * sx));
      const gy = Math.min(gh - 1, Math.floor(py * sy));
      const val = v[gy * gw + gx];
      const [r, g, b] = toneMapField(val, BG, WALL, CHANNEL);
      const o = (py * W + px) * 4;
      d[o] = r;
      d[o + 1] = g;
      d[o + 2] = b;
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  addGrain(ctx, W, H, 22);
  addVignette(ctx, W, H, 0.42);
};
