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

import { addGrain, type Renderer } from "../shared";

export const renderSandpile: Renderer = (ctx, W, H) => {
  const N = 220;
  const grid = new Int32Array(N * N);
  const idx = (x: number, y: number) => y * N + x;

  const cxg = N >> 1;
  const cyg = N >> 1;
  grid[idx(cxg, cyg)] = 20000;

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

  // Persian-miniature four-tone palette — one color per stable height.
  const palette: number[][] = [
    [16, 12, 8],
    [88, 55, 30],
    [200, 130, 60],
    [240, 215, 175],
  ];

  const scale = 4;
  const drawSize = N * scale;
  const offX = Math.floor((W - drawSize) / 2);
  const offY = Math.floor((H - drawSize) / 2);

  // Full-bleed warm wash so the fractal disk sits inside a continuous umber
  // field rather than against a hard black edge.
  const bgWash = ctx.createRadialGradient(
    W / 2,
    H / 2,
    0,
    W / 2,
    H / 2,
    W * 0.7,
  );
  bgWash.addColorStop(0, "rgb(64, 42, 24)");
  bgWash.addColorStop(0.55, "rgb(36, 24, 14)");
  bgWash.addColorStop(1, "rgb(14, 10, 6)");
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
      let R: number, G: number, B: number;
      if (t < 0.55) {
        const k = t / 0.55;
        R = 64 + (36 - 64) * k;
        G = 42 + (24 - 42) * k;
        B = 24 + (14 - 24) * k;
      } else {
        const k = (t - 0.55) / 0.45;
        R = 36 + (14 - 36) * k;
        G = 24 + (10 - 24) * k;
        B = 14 + (6 - 14) * k;
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
      const [cR, cG, cB] = palette[v];
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
