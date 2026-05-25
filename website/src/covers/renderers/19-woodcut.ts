/**
 * 19 · Woodcut — crosshatched relief print
 *
 * An fBm density field drives angled hatch lines; darker regions accumulate
 * crossing strokes in the Dürer woodcut tradition. Technique only — not a
 * reproduction of any specific print.
 *
 * References
 * - A. Dürer, woodcut technique tradition, early 16th century.
 * - W. M. Ivins Jr., *How Prints Look* (Metropolitan Museum of Art, 1943).
 *
 * @module renderers/woodcut
 */

import {
  addGrain,
  addVignette,
  fbm,
  mulberry32,
  rgb,
  type Renderer,
} from "../shared";

export const renderWoodcut: Renderer = (ctx, W, H, SEED) => {
  const r = mulberry32(SEED);
  const paperR = 240;
  const paperG = 232;
  const paperB = 216;
  const inkR = 28;
  const inkG = 20;
  const inkB = 16;

  ctx.fillStyle = rgb(paperR, paperG, paperB);
  ctx.fillRect(0, 0, W, H);

  const spacing = 7;
  const bumpCx = W * (0.4 + r() * 0.2);
  const bumpCy = H * (0.35 + r() * 0.2);

  function density(x: number, y: number): number {
    const n = fbm(x * 0.005, y * 0.005, SEED, 4);
    const dx = x - bumpCx;
    const dy = y - bumpCy;
    const bump = Math.exp(-(dx * dx + dy * dy) / (W * W * 0.025));
    return Math.max(0, Math.min(1, n * 0.6 + bump * 0.5));
  }

  ctx.strokeStyle = rgb(inkR, inkG, inkB, 0.55);
  ctx.lineWidth = 1.1;

  const diag = Math.ceil(Math.hypot(W, H));
  for (let d = -diag; d < diag; d += spacing) {
    ctx.beginPath();
    for (let t = 0; t <= diag * 2; t += 4) {
      const x = d + t * 0.7;
      const y = t * 0.7;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      if (density(x, y) < 0.38) continue;
      if (t === 0 || density(x - 3, y - 3) < 0.38) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  for (let d = -diag; d < diag; d += spacing) {
    ctx.beginPath();
    for (let t = 0; t <= diag * 2; t += 4) {
      const x = W - (d + t * 0.7);
      const y = t * 0.7;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      if (density(x, y) < 0.55) continue;
      if (t === 0 || density(x + 3, y - 3) < 0.55) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  addVignette(ctx, W, H);
  addGrain(ctx, W, H, 12);
};
