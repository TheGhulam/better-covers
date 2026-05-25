/**
 * 05 · Kármán vortex street — staggered Lamb–Oseen vortices on a free stream
 *
 * For Reynolds numbers roughly between 40 and 10⁵, a viscous fluid past a
 * bluff body (e.g. a cylinder) sheds counter-rotating vortices into a
 * staggered double row — the wake — at a near-constant dimensionless
 * frequency, the Strouhal number, around 0.2 for a cylinder. The same
 * pattern shows up in MODIS satellite imagery of cloud streets behind
 * island peaks.
 *
 * Nine alternating point vortices sit on a staggered double row
 * downstream of the inlet. Each uses the Lamb–Oseen regularization so
 * the velocity does not blow up at the core. Streak particles released
 * just downstream of the inlet are advected through the superposition
 * of the vortex field and a uniform background drift; their stamped
 * trails compose the streakline image.
 *
 * Geometry note
 * The vortex spacing, core radius, and particle count all scale with the
 * canvas dimensions so the wake reads correctly at gallery (600×315),
 * hero (1200×630), and any intermediate size. Earlier versions used
 * fixed pixel offsets which made the pattern hug the left margin on
 * wide canvases and overflow narrow ones.
 *
 * Historical notes
 * - Strouhal published his frequency relation for a wire in 1878.
 * - Henri Bénard observed the staggered wake experimentally (1908, 1913).
 * - Theodore von Kármán gave the theoretical stability analysis in 1911–12
 *   (often called the "Bénard–Kármán" street in French sources).
 *
 * References
 * - Th. von Kármán, "Über den Mechanismus des Widerstandes, den ein
 *   bewegter Körper in einer Flüssigkeit erfährt," Göttingen Nachrichten
 *   (1911, 1912).
 * - V. Strouhal, "Über eine besondere Art der Tonerregung," Annalen der
 *   Physik 241, 216 (1878).
 * - H. Lamb, *Hydrodynamics*, 6th ed. (Cambridge, 1932), §334 — Lamb–Oseen
 *   vortex regularization.
 *
 * @module renderers/karman
 */

import { addGrain, mulberry32, type Renderer } from "../shared";

export const renderKarman: Renderer = (ctx, W, H, SEED) => {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1a2632");
  bg.addColorStop(1, "#0c1620");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Vortex layout scales with canvas dimensions. Nine vortices fit the
  // visible wake; spacing is W/11 so the first vortex sits at ~16% from
  // the inlet and the last one well clear of the right edge.
  const cyAxis = H * 0.5;
  const spacingX = W / 11;
  const spacingY = H * 0.11;
  // Core radius proportional to min(W, H) — at small canvases this
  // keeps the cores from collapsing to a single pixel.
  const rc = Math.max(18, Math.min(W, H) * 0.06);

  const vortices: { x: number; y: number; gamma: number; rc: number }[] = [];
  const startX = W * 0.18;
  for (let i = 0; i < 9; i++) {
    const x = startX + i * spacingX;
    const sign = i % 2 === 0 ? 1 : -1;
    const y = cyAxis + sign * spacingY;
    // Vortex strength decays downstream — real wakes diffuse with
    // distance, and the visual benefit is a softer right edge.
    const decay = Math.exp(-i * 0.06);
    vortices.push({ x, y, gamma: sign * 38000 * decay, rc });
  }
  const U = 1.4; // background drift

  /** Velocity field: uniform U plus superposition of Lamb–Oseen vortices. */
  function vel(x: number, y: number): { vx: number; vy: number } {
    let vx = U;
    let vy = 0;
    for (const v of vortices) {
      const dx = x - v.x;
      const dy = y - v.y;
      const r2 = dx * dx + dy * dy;
      // Lamb–Oseen: u_θ = (Γ / 2π r)(1 − exp(−r²/rc²))
      const core = 1 - Math.exp(-r2 / (v.rc * v.rc));
      const factor = (v.gamma / (2 * Math.PI * Math.max(r2, 0.5))) * core;
      vx += -dy * factor;
      vy += dx * factor;
    }
    return { vx, vy };
  }

  ctx.globalCompositeOperation = "lighter";
  const r = mulberry32(SEED);
  // Particle count scales with canvas area at ~0.08 particles per pixel
  // — gives a dense streakline image across all sizes.
  const NUM_PARTICLES = Math.floor(W * H * 0.08);
  const dt = 1.2;
  const STEPS = 700;

  for (let n = 0; n < NUM_PARTICLES; n++) {
    let x = -10 + r() * 80;
    let y = cyAxis - 12 + (r() - 0.5) * 24;
    for (let s = 0; s < STEPS; s++) {
      const v = vel(x, y);
      x += v.vx * dt;
      y += v.vy * dt;
      if (x < 0 || x > W || y < 0 || y > H) break;
      // Alpha fades downstream so vortices upstream read more strongly
      // than the diffusing trail at the right edge.
      const a = 0.035 * Math.max(0.15, 1 - x / W);
      ctx.fillStyle = `rgba(232, 240, 250, ${a})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
  }
  ctx.globalCompositeOperation = "source-over";

  addGrain(ctx, W, H, 10);
};
