/**
 * 08 · L-system — F → F[+F]F[−F]F at 25.7°, depth 4
 *
 * Lindenmayer's 1968 parallel-rewriting system applies one rule everywhere
 * in a string at once; the result is interpreted as turtle moves with
 * bracketed push (`[`) and pop (`]`). From the single-character axiom `F`
 * and the production `F → F[+F]F[−F]F`, four iterations at a turn angle
 * of 25.7° give a recognizably botanical silhouette.
 *
 * Three plants are placed at fixed x positions across the bottom of the
 * canvas; a small per-step angle jitter (±0.06 rad, from the seed-driven
 * PRNG) keeps siblings from reading as perfect copies. A few dozen
 * scattered ochre leaves break up the visual symmetry.
 *
 * References
 * - A. Lindenmayer, "Mathematical models for cellular interaction in
 *   development, I and II," Journal of Theoretical Biology 18, 280–315
 *   (1968).
 * - P. Prusinkiewicz & A. Lindenmayer, *The Algorithmic Beauty of Plants*
 *   (Springer, 1990) — the canonical reference for the bracketed turtle
 *   interpretation. The 25.7° turn angle and the production rule used here
 *   come from §1.6 of that book.
 *
 * @module renderers/lsystem
 */

import { mulberry32, addGrain, type Renderer } from "../shared";

export const renderLSystem: Renderer = (ctx, W, H, SEED) => {
  const r = mulberry32(SEED);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1a1612");
  bg.addColorStop(1, "#0e0a07");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const rules: Record<string, string> = { F: "F[+F]F[-F]F" };
  function expand(axiom: string, depth: number): string {
    let s = axiom;
    for (let i = 0; i < depth; i++) {
      let next = "";
      for (const c of s) next += rules[c] || c;
      s = next;
    }
    return s;
  }

  const angle = (25.7 * Math.PI) / 180;
  const depth = 4;
  const sysStr = expand("F", depth);
  const step = 4.5;

  const plants = [
    { x: W * 0.18, y: H * 0.96, scale: 0.95, tilt: -0.04 },
    { x: W * 0.52, y: H * 0.98, scale: 1.0, tilt: 0.02 },
    { x: W * 0.85, y: H * 0.94, scale: 0.9, tilt: -0.06 },
  ];

  for (const p of plants) {
    const state = { x: p.x, y: p.y, dir: -Math.PI / 2 + p.tilt, lw: 3.2 };
    const stack: { x: number; y: number; dir: number; lw: number }[] = [];
    ctx.lineCap = "round";

    for (const ch of sysStr) {
      if (ch === "F") {
        const nx = state.x + Math.cos(state.dir) * step * p.scale;
        const ny = state.y + Math.sin(state.dir) * step * p.scale;
        ctx.strokeStyle =
          "rgba(220, 180, 130, " + (0.42 + Math.min(0.5, state.lw / 6)) + ")";
        ctx.lineWidth = Math.max(0.5, state.lw);
        ctx.beginPath();
        ctx.moveTo(state.x, state.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        state.x = nx;
        state.y = ny;
      } else if (ch === "+") {
        state.dir += angle + (r() - 0.5) * 0.06;
      } else if (ch === "-") {
        state.dir -= angle + (r() - 0.5) * 0.06;
      } else if (ch === "[") {
        stack.push({ x: state.x, y: state.y, dir: state.dir, lw: state.lw });
        state.lw *= 0.68;
      } else if (ch === "]") {
        const top = stack.pop();
        if (top) {
          state.x = top.x;
          state.y = top.y;
          state.dir = top.dir;
          state.lw = top.lw;
        }
        state.lw *= 0.68;
      }
    }
  }

  // Scattered fallen leaves — tiny elliptical motes for visual texture.
  for (let i = 0; i < 40; i++) {
    const x = W * (0.1 + r() * 0.85);
    const y = H * (0.15 + r() * 0.55);
    const sz = 4 + r() * 6;
    ctx.fillStyle = "rgba(186, 130, 70, " + (0.35 + r() * 0.35) + ")";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r() * Math.PI);
    ctx.beginPath();
    ctx.ellipse(0, 0, sz, sz * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const guard = ctx.createLinearGradient(0, H * 0.55, 0, H);
  guard.addColorStop(0, "rgba(0,0,0,0)");
  guard.addColorStop(1, "rgba(0,0,0,0.78)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 6);
};
