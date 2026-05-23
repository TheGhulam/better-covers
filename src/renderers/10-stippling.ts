/**
 * 10 · Poisson-disk stippling — Bridson 2007 with a density-modulated radius
 *
 * Bridson's algorithm maintains an "active list" of seed points. Each round,
 * it picks an active sample, draws up to thirty candidates from the annulus
 * `[r, 2r]` around it, and accepts the first whose nearest existing neighbor
 * is at least `r` away. If all thirty fail, the seed is retired from the
 * active list. The result is a blue-noise distribution — what you see in
 * the cone mosaic of the human fovea, in sand-grain packings, and in any
 * well-engraved 18th-century plate.
 *
 * This variant modulates the minimum-distance radius by a density field
 * (a Gaussian sphere plus a low-frequency fBm wobble), so the stippling
 * darkens toward the upper-left "subject" and lightens toward the edges —
 * the same trick Mitchell's 1987 paper called "importance sampling."
 *
 * References
 * - R. Bridson, "Fast Poisson disk sampling in arbitrary dimensions,"
 *   ACM SIGGRAPH 2007 Sketches, Article 22.
 *   <https://doi.org/10.1145/1278780.1278807>
 * - D. P. Mitchell, "Generating antialiased images at low sampling
 *   densities," ACM SIGGRAPH Computer Graphics 21:4, 65–72 (1987) — origin
 *   of importance-modulated sample density.
 *
 * @module renderers/stippling
 */

import { mulberry32, fbm, addGrain, type Renderer } from "../shared";

export const renderStippling: Renderer = (ctx, W, H, SEED) => {
  const r = mulberry32(SEED);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#f4ebd6");
  bg.addColorStop(1, "#e2d3b3");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Density field: Gaussian "subject" sphere off to the left third, plus a
  // small low-frequency wobble so the stippling doesn't read as too clean.
  function density(x: number, y: number): number {
    const cx = W * 0.36;
    const cy = H * 0.5;
    const dx = (x - cx) / W;
    const dy = (y - cy) / H;
    const d2 = dx * dx + dy * dy;
    const sphere = Math.exp(-d2 * 7);
    const subtle = (fbm(x * 0.003, y * 0.003, SEED, 4) - 0.5) * 0.25;
    return Math.max(0.05, Math.min(1, sphere + subtle));
  }

  function radiusAt(x: number, y: number): number {
    return 4 + (1 - density(x, y)) * 24;
  }

  // Hash grid for fast neighbor queries — Bridson's spatial acceleration
  // structure. CELL is sized smaller than the minimum possible r so each
  // cell holds at most a handful of points.
  type Pt = { x: number; y: number };
  const grid = new Map<string, Pt[]>();
  const CELL = 4;
  const gridKey = (x: number, y: number) =>
    ((x / CELL) | 0) + "," + ((y / CELL) | 0);
  function neighbors(x: number, y: number): Pt[] {
    const cxg = (x / CELL) | 0;
    const cyg = (y / CELL) | 0;
    const out: Pt[] = [];
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const k = cxg + dx + "," + (cyg + dy);
        const arr = grid.get(k);
        if (arr) for (const p of arr) out.push(p);
      }
    }
    return out;
  }
  function insert(p: Pt): void {
    const k = gridKey(p.x, p.y);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k)!.push(p);
  }

  const samples: Pt[] = [];
  const active: Pt[] = [];
  const seedPt: Pt = { x: W * 0.36, y: H * 0.5 };
  samples.push(seedPt);
  active.push(seedPt);
  insert(seedPt);

  const K_TRIES = 30;
  while (active.length > 0 && samples.length < 22000) {
    const idx_ = (r() * active.length) | 0;
    const p = active[idx_];
    const rRadius = radiusAt(p.x, p.y);
    let placed = false;
    for (let k = 0; k < K_TRIES; k++) {
      const ang = r() * Math.PI * 2;
      const dist = rRadius * (1 + r());
      const nx = p.x + Math.cos(ang) * dist;
      const ny = p.y + Math.sin(ang) * dist;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const nr = radiusAt(nx, ny);
      let ok = true;
      for (const q of neighbors(nx, ny)) {
        const dx = nx - q.x;
        const dy = ny - q.y;
        if (dx * dx + dy * dy < nr * nr) {
          ok = false;
          break;
        }
      }
      if (ok) {
        const np: Pt = { x: nx, y: ny };
        samples.push(np);
        active.push(np);
        insert(np);
        placed = true;
        break;
      }
    }
    if (!placed) active.splice(idx_, 1);
  }

  for (const p of samples) {
    const rr = radiusAt(p.x, p.y);
    const dot = Math.max(0.6, 1.5 - rr * 0.04);
    ctx.fillStyle = "rgba(28, 18, 10, 0.92)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, dot, 0, Math.PI * 2);
    ctx.fill();
  }

  const vg = ctx.createRadialGradient(
    W * 0.36,
    H * 0.5,
    W * 0.25,
    W / 2,
    H / 2,
    W * 0.7,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(180, 160, 130, 0.35)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const guard = ctx.createLinearGradient(0, H * 0.6, 0, H);
  guard.addColorStop(0, "rgba(244, 235, 214, 0)");
  guard.addColorStop(1, "rgba(244, 235, 214, 0.72)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 10);
};
