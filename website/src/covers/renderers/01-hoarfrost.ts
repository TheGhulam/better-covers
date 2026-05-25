/**
 * 01 · Hoarfrost — inverted diffusion-limited aggregation
 *
 * A field of random walkers is released just below the lowest current tip
 * of a cluster and steps in random directions until it touches a neighbor
 * and sticks forever. The seed line is the top edge of the canvas, so growth
 * descends — frost on a cornice, lightning in reverse.
 *
 * The form is fractal, with a Hausdorff dimension near 1.71 in two
 * dimensions — the same universality class as mineral inclusions, electric
 * tree breakdown, and viscous fingering. Per-column "soft caps" derived from
 * a low-frequency fBm envelope vary the dendrite depth across the canvas so
 * the field doesn't bottom out uniformly.
 *
 * References
 * - T. A. Witten & L. M. Sander, "Diffusion-Limited Aggregation, a Kinetic
 *   Critical Phenomenon," Phys. Rev. Lett. 47, 1400–1403 (1981).
 *   <https://doi.org/10.1103/PhysRevLett.47.1400>
 * - T. A. Witten & L. M. Sander, "Diffusion-limited aggregation,"
 *   Phys. Rev. B 27, 5686 (1983).
 * - B. Davidovich & I. Procaccia, Europhys. Lett. 48, 547 (1999) — theory
 *   bounds on DLA fractal dimension (numerical consensus ≈ 1.71).
 *
 * @module renderers/hoarfrost
 */

import { mulberry32, fbm, addGrain, type Renderer } from "../shared";

export const renderHoarfrost: Renderer = (ctx, W, H, SEED) => {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#06080f");
  bg.addColorStop(1, "#0a0e1c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const r = mulberry32(SEED);
  const cell = 3;
  const cols = Math.floor(W / cell);
  const rows = Math.floor(H / cell);
  const grid = new Uint8Array(cols * rows);
  const idx = (x: number, y: number) => y * cols + x;

  // Seed line at TOP — growth descends from the cornice.
  for (let x = 0; x < cols; x++) grid[idx(x, 0)] = 1;

  const tipY = new Int32Array(cols);
  for (let x = 0; x < cols; x++) tipY[x] = 0;
  let globalMaxY = 0;

  // Per-column depth caps via low-frequency noise — natural variety in
  // dendrite length across the canvas. Some columns grow long branches,
  // others stay short; a single low-freq fbm controls the envelope.
  const colSoft = new Float32Array(cols);
  const colHard = new Float32Array(cols);
  for (let x = 0; x < cols; x++) {
    const n = fbm(x * 0.012, 17.3, SEED, 2);
    const softFrac = 0.18 + n * 0.22; // 18–40 % of canvas height
    const hardFrac = softFrac + 0.18; // soft + 18 %
    colSoft[x] = rows * softFrac;
    colHard[x] = rows * hardFrac;
  }

  // Run walkers — launched close below the lowest current tip.
  const NUM_WALKERS = 24000;
  for (let n = 0; n < NUM_WALKERS; n++) {
    let x = Math.floor(r() * cols);
    const launchOffset = 4 + Math.floor(r() * 12);
    let y = Math.min(rows - 1, globalMaxY + launchOffset);
    let steps = 0;
    const killY = Math.min(rows - 1, globalMaxY + launchOffset + 30);
    while (steps++ < 3000) {
      const d = (r() * 4) | 0;
      if (d === 0) x++;
      else if (d === 1) x--;
      else if (d === 2) y++;
      else y--;
      if (x < 0) x = cols - 1;
      if (x >= cols) x = 0;
      if (y < 0) break;
      if (y > killY) break;
      if (y >= rows) break;
      // Stick check (4-neighbor); top boundary acts as part of the seed.
      const u = y > 0 ? grid[idx(x, y - 1)] : 1;
      const dn = y < rows - 1 ? grid[idx(x, y + 1)] : 0;
      const l = x > 0 ? grid[idx(x - 1, y)] : 0;
      const ri = x < cols - 1 ? grid[idx(x + 1, y)] : 0;
      if (u || dn || l || ri) {
        // Per-column soft cap — varied depth via low-freq noise envelope.
        const sCap = colSoft[x];
        const hCap = colHard[x];
        if (y >= hCap) break;
        if (y > sCap) {
          const stickProb = 1 - (y - sCap) / (hCap - sCap);
          if (r() >= stickProb) break;
        }
        grid[idx(x, y)] = 1;
        if (y > tipY[x]) tipY[x] = y;
        if (y > globalMaxY) globalMaxY = y;
        break;
      }
    }
  }

  // Render cluster as bright dendrites with a soft glow halo.
  ctx.globalCompositeOperation = "lighter";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[idx(x, y)]) continue;
      const px = x * cell;
      const py = y * cell;
      ctx.fillStyle = "rgba(220, 180, 110, 0.10)";
      ctx.fillRect(px - 2, py - 2, cell + 4, cell + 4);
      ctx.fillStyle = "rgba(240, 215, 165, 0.95)";
      ctx.fillRect(px, py, cell, cell);
    }
  }
  ctx.globalCompositeOperation = "source-over";

  // Vignette toward the bottom so the post title sits on clean ground.
  const gg = ctx.createLinearGradient(0, H * 0.55, 0, H);
  gg.addColorStop(0, "rgba(6,8,15,0)");
  gg.addColorStop(1, "rgba(6,8,15,0.85)");
  ctx.fillStyle = gg;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 10);
};
