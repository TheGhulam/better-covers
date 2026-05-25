/**
 * 08 · Lindenmayer — bushy plant from parallel string-rewriting
 *
 * Lindenmayer's parallel string-rewriting system, interpreted as turtle
 * graphics. Six iterations of the classic bushy plant rule produce a
 * long string of moves; a measurement pass walks it once to find the
 * bounding box, and a draw pass rescales it to fit the canvas. Jitter
 * values are pre-computed so both passes see the same plant — without
 * this, the two passes consume the PRNG at different rates and the
 * "rescale" lands on the wrong figure.
 *
 * Rule
 * - X → F-[[X]+X]+F[+FX]-X
 * - F → FF
 * - angle ≈ 22.5° per +/-
 *
 * References
 * - A. Lindenmayer, "Mathematical models for cellular interaction in
 *   development," J. Theor. Biol. 18, 280 (1968).
 * - P. Prusinkiewicz & A. Lindenmayer, *The Algorithmic Beauty of
 *   Plants* (Springer, 1990) — bushy-plant rule appears in §1.6.
 *
 * @module renderers/lsystem
 */

import { addGrain, mulberry32, type Renderer } from "../shared";

export const renderLSystem: Renderer = (ctx, W, H, SEED) => {
  ctx.fillStyle = "#0a1410";
  ctx.fillRect(0, 0, W, H);

  // Expand the rule six times.
  let s = "X";
  const rules: Record<string, string> = {
    X: "F-[[X]+X]+F[+FX]-X",
    F: "FF",
  };
  for (let i = 0; i < 6; i++) {
    let out = "";
    for (const ch of s) out += rules[ch] || ch;
    s = out;
  }

  // Pre-compute angle jitter so the measurement and draw passes see
  // identical turtle sequences. Without this the rescale lands on the
  // wrong plant.
  let plusCount = 0;
  let minusCount = 0;
  for (const ch of s) {
    if (ch === "+") plusCount++;
    else if (ch === "-") minusCount++;
  }
  const r = mulberry32(SEED);
  const baseAng = (22.5 + (r() - 0.5) * 3) * (Math.PI / 180);
  const jitterPlus = new Float32Array(plusCount);
  const jitterMinus = new Float32Array(minusCount);
  for (let i = 0; i < plusCount; i++) jitterPlus[i] = (r() - 0.5) * 0.05;
  for (let i = 0; i < minusCount; i++) jitterMinus[i] = (r() - 0.5) * 0.05;

  type Bounds = { minX: number; maxX: number; minY: number; maxY: number };
  const walk = (
    drawCtx: CanvasRenderingContext2D | null,
    sx: number,
    sy: number,
    step: number,
    dir0: number,
  ): Bounds => {
    let x = sx;
    let y = sy;
    let dir = dir0;
    const stack: [number, number, number][] = [];
    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;
    let pi = 0;
    let mi = 0;
    if (drawCtx) drawCtx.beginPath();
    for (const ch of s) {
      if (ch === "F") {
        const nx = x + Math.cos(dir) * step;
        const ny = y + Math.sin(dir) * step;
        if (drawCtx) {
          drawCtx.moveTo(x, y);
          drawCtx.lineTo(nx, ny);
        }
        x = nx;
        y = ny;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else if (ch === "+") {
        dir += baseAng + jitterPlus[pi++];
      } else if (ch === "-") {
        dir -= baseAng + jitterMinus[mi++];
      } else if (ch === "[") {
        stack.push([x, y, dir]);
      } else if (ch === "]") {
        const p = stack.pop()!;
        x = p[0];
        y = p[1];
        dir = p[2];
      }
    }
    return { minX, maxX, minY, maxY };
  };

  // Measurement pass at unit step.
  const b = walk(null, 0, 0, 1, -Math.PI / 2);
  const bw = Math.max(1, b.maxX - b.minX);
  const bh = Math.max(1, b.maxY - b.minY);
  const step = Math.min((W * 0.85) / bw, (H * 0.85) / bh);

  // Position so the bounding box is centred horizontally and the bottom
  // of the plant rests near the canvas floor.
  const cx = W * 0.5;
  const baseY = H * 0.96;
  const sx = cx - (b.minX + bw / 2) * step;
  const sy = baseY - b.maxY * step;

  ctx.strokeStyle = "rgba(210, 225, 190, 0.92)";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  walk(ctx, sx, sy, step, -Math.PI / 2);
  ctx.stroke();

  addGrain(ctx, W, H, 8);
};
