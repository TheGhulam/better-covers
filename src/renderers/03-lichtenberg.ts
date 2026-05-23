/**
 * 03 · Lichtenberg — single-source upward DLA with η > 1 stickiness
 *
 * Random-walker DLA with a tip-favoring stickiness heuristic: walkers
 * touching a single neighbor stick with probability 1.0; walkers touching
 * two or more neighbors stick only with probability 0.3. The result is a
 * sparser, thirstier fractal inspired by the η > 1 dielectric-breakdown
 * regime (Niemeyer et al. 1984), not a Laplacian DBM simulation.
 *
 * Visually: charge a block of acrylic with a particle accelerator, then
 * ground it; the trapped charge punches its way out and leaves a branching
 * crystallographic discharge frozen inside.
 *
 * References
 * - G. C. Lichtenberg, *De nova methodo naturam ac motum fluidi electrici
 *   investigandi* (Commentatio prior), Novi Commentarii Societatis Regiae
 *   Scientiarum Gottingensis VIII (Göttingen, 1778), 168–180.
 * - L. Niemeyer, L. Pietronero, H. J. Wiesmann, "Fractal Dimension of
 *   Dielectric Breakdown," Phys. Rev. Lett. 52, 1033 (1984).
 *   <https://doi.org/10.1103/PhysRevLett.52.1033>
 * - T. A. Witten & L. M. Sander (1981/1983) — underlying random-walker DLA
 *   (see also cover 01).
 *
 * @module renderers/lichtenberg
 */

import { mulberry32, addGrain, type Renderer } from "../shared";

export const renderLichtenberg: Renderer = (ctx, W, H, SEED) => {
  const bg = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, H * 1.2);
  bg.addColorStop(0, "#0c0a18");
  bg.addColorStop(1, "#020306");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cell = 2;
  const cols = Math.floor(W / cell);
  const rows = Math.floor(H / cell);
  const grid = new Uint8Array(cols * rows);
  const idx = (x: number, y: number) => y * cols + x;

  // Seed at the bottom center — growth climbs upward.
  const seedX = Math.floor(cols / 2);
  grid[idx(seedX, rows - 1)] = 1;

  const r = mulberry32(SEED);
  let globalMinY = rows - 1;
  const tipY = new Int32Array(cols);
  for (let x = 0; x < cols; x++) tipY[x] = rows - 1;

  const NUM_WALKERS = 40000;
  for (let n = 0; n < NUM_WALKERS; n++) {
    let x = Math.floor(r() * cols);
    const launchOffset = 3 + Math.floor(r() * 10);
    let y = Math.max(0, globalMinY - launchOffset);
    let steps = 0;
    const killY = Math.max(0, globalMinY - launchOffset - 25);
    while (steps++ < 2500) {
      const dir = Math.floor(r() * 4);
      if (dir === 0) x++;
      else if (dir === 1) x--;
      else if (dir === 2) y++;
      else y--;
      if (x < 0) x = cols - 1;
      if (x >= cols) x = 0;
      if (y < killY) break;
      if (y >= rows) break;
      const u = y > 0 ? grid[idx(x, y - 1)] : 0;
      const dn = y < rows - 1 ? grid[idx(x, y + 1)] : 0;
      const l = x > 0 ? grid[idx(x - 1, y)] : 0;
      const ri = x < cols - 1 ? grid[idx(x + 1, y)] : 0;
      const count = u + dn + l + ri;
      if (count > 0) {
        // Tip-favoring sticky probability: lone neighbors always grab, but
        // already-thickened branches grab only 30 % of the time. This
        // suppresses bulk and emphasizes leading tips — the η > 1 regime.
        const stickP = count === 1 ? 1.0 : 0.3;
        if (r() < stickP) {
          grid[idx(x, y)] = 1;
          if (y < tipY[x]) tipY[x] = y;
          if (y < globalMinY) globalMinY = y;
          break;
        }
      }
    }
  }

  // Render with a three-layer halo: dim purple bloom, mid-violet glow,
  // and a bright pearl-white core. The composite "lighter" stacks the alpha.
  ctx.globalCompositeOperation = "lighter";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[idx(x, y)]) continue;
      const px = x * cell;
      const py = y * cell;
      ctx.fillStyle = "rgba(150, 130, 220, 0.12)";
      ctx.fillRect(px - 2, py - 2, cell + 4, cell + 4);
      ctx.fillStyle = "rgba(190, 175, 240, 0.6)";
      ctx.fillRect(px - 1, py - 1, cell + 2, cell + 2);
      ctx.fillStyle = "rgba(235, 230, 250, 0.95)";
      ctx.fillRect(px, py, cell, cell);
    }
  }
  ctx.globalCompositeOperation = "source-over";

  const guard = ctx.createLinearGradient(0, H * 0.6, 0, H);
  guard.addColorStop(0, "rgba(2,3,6,0)");
  guard.addColorStop(1, "rgba(2,3,6,0.85)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 8);
};
