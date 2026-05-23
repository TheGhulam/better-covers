/**
 * 12 · Flow field — Fidenza-style ink-trail strokes
 *
 * Tyler Hobbs's *Fidenza* (Art Blocks, 11 June 2021) is the canonical
 * reference for the modern flow-field generative-art aesthetic: a
 * low-frequency fBm noise field defines an angle at every point, and a
 * few thousand particles are released into it, each leaving a low-alpha
 * trail of short line segments.
 *
 * This renderer takes the bare-minimum version of that idea: 1 400
 * particles, 70 steps apiece, 0.7 px line width, a single fBm field, one
 * palette of warm earth tones. No collision detection, no curved
 * rectangles, no per-particle width ladder — just enough to read as ink
 * on paper rather than vector art. For a deeper rendering of the same
 * idea, see Hobbs's own essay "Flow fields" (tylerxhobbs.com, 2020).
 *
 * Attribution
 * The flow-field-of-particles technique long predates Fidenza — Kerry
 * Mitchell, Robert Hodgin, Anders Hoff (inconvergent), and many others
 * used it before 2021. Hobbs's particular contribution was the
 * non-colliding curved-rectangle treatment and the long-form generative
 * NFT context. *Fidenza* the artwork is not reproduced here; only the
 * underlying flow-field technique is implemented, in a deliberately
 * minimal form.
 *
 * References
 * - T. Hobbs, "Fidenza" (Art Blocks, 11 June 2021),
 *   <https://www.artblocks.io/collection/fidenza-by-tyler-hobbs>.
 * - T. Hobbs, "Flow Fields," <https://www.tylerxhobbs.com/words/flow-fields>.
 * - K. Mitchell, "Flow field methods in art," ca. 2005 (early prior art).
 *
 * @module renderers/flow
 */

import { mulberry32, fbm, type Renderer } from "../shared";

export const renderFlow: Renderer = (ctx, W, H, SEED) => {
  const rand = mulberry32(SEED);

  ctx.fillStyle = "#1a1816";
  ctx.fillRect(0, 0, W, H);

  const wash = ctx.createRadialGradient(
    W * 0.3, H * 0.4, 0, W * 0.5, H * 0.5, W * 0.8,
  );
  wash.addColorStop(0, "rgba(80, 50, 40, 0.4)");
  wash.addColorStop(1, "rgba(20, 18, 16, 0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  const palette = [
    "rgba(220, 180, 130, 0.10)",
    "rgba(200, 136, 74, 0.10)",
    "rgba(140, 90, 70, 0.10)",
    "rgba(240, 220, 200, 0.08)",
  ];

  const N = 1400;
  const STEPS = 70;
  const STEP_SIZE = 2.2;
  ctx.lineWidth = 0.7;

  for (let i = 0; i < N; i++) {
    let x = rand() * W;
    let y = rand() * H;
    ctx.strokeStyle = palette[Math.floor(rand() * palette.length)];
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < STEPS; s++) {
      // Angle field: low-frequency fBm scaled to span ~4π so neighbors
      // produce gentle curves rather than rapid spinning.
      const angle = fbm(x * 0.003, y * 0.003, SEED, 3) * Math.PI * 4;
      x += Math.cos(angle) * STEP_SIZE;
      y += Math.sin(angle) * STEP_SIZE;
      if (x < 0 || x > W || y < 0 || y > H) break;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const guard = ctx.createLinearGradient(0, H * 0.55, 0, H);
  guard.addColorStop(0, "rgba(0,0,0,0)");
  guard.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);
};
