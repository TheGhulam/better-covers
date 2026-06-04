/**
 * 04 · Abelian sandpile — toppling on a square lattice
 *
 * Drop 20,000 grains at the origin of a 220 × 220 grid; every cell with four
 * or more grains "topples," sending one grain to each of its four orthogonal
 * neighbors. Iterate until everything is stable. The result is the four-tone
 * Persian-miniature fractal of self-organized criticality whose continuum
 * limit was proved by Pegden & Smart (2013); fine structure by Levine,
 * Pegden & Smart (2016).
 *
 * The model is "Abelian" because the final stable configuration is
 * independent of the order in which unstable sites are toppled — Dhar's
 * 1990 observation.
 *
 * References
 * - P. Bak, C. Tang & K. Wiesenfeld, "Self-organized criticality: An
 *   explanation of 1/f noise," Phys. Rev. Lett. 59, 381–384 (1987).
 *   <https://doi.org/10.1103/PhysRevLett.59.381>
 * - D. Dhar, "Self-organized critical state of sandpile automaton models,"
 *   Phys. Rev. Lett. 64, 1613–1616 (1990).
 *   <https://doi.org/10.1103/PhysRevLett.64.1613>
 * - W. Pegden & C. K. Smart, "Convergence of the abelian sandpile,"
 *   Duke Math. J. 162(4), 627–642 (2013).
 *   <https://doi.org/10.1215/00127094-2079677>
 *
 * @module renderers/sandpile
 */

import { addGrain, mulberry32, type Renderer } from "../shared";

// Four palette families. bgStops are CSS strings for createRadialGradient;
// bgRaw holds the same three stops as [R,G,B] triples for the pixel pre-fill loop.
// Palette 0 is the original Persian-miniature warm ochre.
const PALETTES = [
  {
    bgStops: ["rgb(64,42,24)", "rgb(36,24,14)", "rgb(14,10,6)"] as const,
    bgRaw: [
      [64, 42, 24],
      [36, 24, 14],
      [14, 10, 6],
    ] as const,
    cell: [
      [16, 12, 8],
      [88, 55, 30],
      [200, 130, 60],
      [240, 215, 175],
    ] as const,
  },
  {
    bgStops: ["rgb(14,22,44)", "rgb(8,14,30)", "rgb(4,6,14)"] as const,
    bgRaw: [
      [14, 22, 44],
      [8, 14, 30],
      [4, 6, 14],
    ] as const,
    cell: [
      [8, 14, 28],
      [30, 55, 110],
      [60, 120, 200],
      [175, 210, 240],
    ] as const,
  },
  {
    bgStops: ["rgb(10,30,18)", "rgb(6,18,10)", "rgb(2,8,4)"] as const,
    bgRaw: [
      [10, 30, 18],
      [6, 18, 10],
      [2, 8, 4],
    ] as const,
    cell: [
      [8, 20, 10],
      [30, 80, 40],
      [70, 160, 80],
      [190, 235, 195],
    ] as const,
  },
  {
    bgStops: ["rgb(30,16,40)", "rgb(18,8,26)", "rgb(8,4,12)"] as const,
    bgRaw: [
      [30, 16, 40],
      [18, 8, 26],
      [8, 4, 12],
    ] as const,
    cell: [
      [18, 8, 24],
      [70, 28, 88],
      [150, 70, 190],
      [225, 195, 240],
    ] as const,
  },
];

export const renderSandpile: Renderer = (ctx, W, H, SEED) => {
  const r = mulberry32(SEED);
  const palette = PALETTES[(SEED >>> 0) % PALETTES.length];

  const N = 220;
  const grid = new Int32Array(N * N);
  const idx = (x: number, y: number) => y * N + x;

  // Grain count varies with SEED so the fractal grows to different radii.
  const grains = 15000 + Math.floor(r() * 10000);
  const cxg = N >> 1;
  const cyg = N >> 1;
  grid[idx(cxg, cyg)] = grains;

  // Topple until stable. The 4000-iteration safety cap is comfortably above
  // what 20 k grains on a 220 × 220 lattice actually requires.
  let unstable = true;
  let safetyIterations = 0;
  while (unstable && safetyIterations++ < 4000) {
    unstable = false;
    for (let y = 1; y < N - 1; y++) {
      for (let x = 1; x < N - 1; x++) {
        const v = grid[idx(x, y)];
        if (v >= 4) {
          const fall = Math.floor(v / 4);
          grid[idx(x, y)] = v - fall * 4;
          grid[idx(x + 1, y)] += fall;
          grid[idx(x - 1, y)] += fall;
          grid[idx(x, y + 1)] += fall;
          grid[idx(x, y - 1)] += fall;
          unstable = true;
        }
      }
    }
  }

  const scale = 4;
  const drawSize = N * scale;
  const offX = Math.floor((W - drawSize) / 2);
  const offY = Math.floor((H - drawSize) / 2);

  // Full-bleed wash so the fractal disk sits against a matching field.
  const bgWash = ctx.createRadialGradient(
    W / 2,
    H / 2,
    0,
    W / 2,
    H / 2,
    W * 0.7,
  );
  bgWash.addColorStop(0, palette.bgStops[0]);
  bgWash.addColorStop(0.55, palette.bgStops[1]);
  bgWash.addColorStop(1, palette.bgStops[2]);
  ctx.fillStyle = bgWash;
  ctx.fillRect(0, 0, W, H);

  const id = ctx.createImageData(W, H);
  // Pre-fill the image data with the same radial wash colors so when we
  // stamp the fractal over the top its edges blend into the surrounding
  // field rather than punching through to black.
  const cx = W / 2;
  const cy = H / 2;
  const maxR = W * 0.7;
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = Math.min(1, dist / maxR);
      const [s0, s1, s2] = palette.bgRaw;
      let R: number, G: number, B: number;
      if (t < 0.55) {
        const k = t / 0.55;
        R = s0[0] + (s1[0] - s0[0]) * k;
        G = s0[1] + (s1[1] - s0[1]) * k;
        B = s0[2] + (s1[2] - s0[2]) * k;
      } else {
        const k = (t - 0.55) / 0.45;
        R = s1[0] + (s2[0] - s1[0]) * k;
        G = s1[1] + (s2[1] - s1[1]) * k;
        B = s1[2] + (s2[2] - s1[2]) * k;
      }
      const i = (py * W + px) * 4;
      id.data[i] = R;
      id.data[i + 1] = G;
      id.data[i + 2] = B;
      id.data[i + 3] = 255;
    }
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = Math.min(3, Math.max(0, grid[idx(x, y)]));
      const [cR, cG, cB] = palette.cell[v];
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = offX + x * scale + dx;
          const py = offY + y * scale + dy;
          if (px < 0 || px >= W || py < 0 || py >= H) continue;
          const i = (py * W + px) * 4;
          id.data[i] = cR;
          id.data[i + 1] = cG;
          id.data[i + 2] = cB;
        }
      }
    }
  }
  ctx.putImageData(id, 0, 0);

  const vg = ctx.createRadialGradient(
    W / 2,
    H / 2,
    W * 0.25,
    W / 2,
    H / 2,
    W * 0.7,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const guard = ctx.createLinearGradient(0, H * 0.6, 0, H);
  guard.addColorStop(0, "rgba(0,0,0,0)");
  guard.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 6);
};
