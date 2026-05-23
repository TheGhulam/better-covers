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
 * The renderer places nine alternating point vortices on a staggered double
 * row downstream of the inlet. Each uses the Lamb–Oseen regularization so
 * the velocity does not blow up at the core. 18 000 streak particles released
 * just downstream of the inlet are advected through the superposition of the
 * vortex field and a uniform background drift; their stamped trails compose
 * the streakline image.
 *
 * Historical notes
 * - Strouhal published his frequency relation for a wire in 1878.
 * - Henri Bénard observed the staggered wake experimentally (1908, 1913).
 * - Theodore von Kármán gave the theoretical stability analysis in 1911–12
 *   (often called the "Bénard–Kármán" street in French sources).
 *
 * References
 * - Th. von Kármán, "Über den Mechanismus des Widerstandes, den ein bewegter
 *   Körper in einer Flüssigkeit erfährt," Göttingen Nachrichten (1911, 1912).
 * - V. Strouhal, "Über eine besondere Art der Tonerregung," Annalen der
 *   Physik 241, 216 (1878).
 * - H. Lamb, *Hydrodynamics*, 6th ed. (Cambridge, 1932), §334 — Lamb–Oseen
 *   vortex regularization.
 *
 * @module renderers/karman
 */

import { mulberry32, addGrain, type Renderer } from "../shared";

export const renderKarman: Renderer = (ctx, W, H, SEED) => {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1a2632");
  bg.addColorStop(1, "#0c1620");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cyAxis = H * 0.5;
  const spacingX = 130;
  const spacingY = 70;
  const vortices: { x: number; y: number; gamma: number; rc: number }[] = [];
  const startX = 220;
  for (let i = 0; i < 9; i++) {
    const x = startX + i * spacingX;
    const sign = i % 2 === 0 ? 1 : -1;
    const y = cyAxis + sign * spacingY;
    const decay = Math.exp(-i * 0.06);
    vortices.push({ x: x, y: y, gamma: sign * 38000 * decay, rc: 32 });
  }
  const U = 1.4;

  function vel(x: number, y: number) {
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
    return { vx: vx, vy: vy };
  }

  ctx.globalCompositeOperation = "lighter";
  const r = mulberry32(SEED);
  const NUM_PARTICLES = 18000;
  for (let n = 0; n < NUM_PARTICLES; n++) {
    let x = -10 + r() * 80;
    let y = cyAxis - 12 + (r() - 0.5) * 24;
    const steps = 700;
    const dt = 1.2;
    for (let s = 0; s < steps; s++) {
      const v = vel(x, y);
      x += v.vx * dt;
      y += v.vy * dt;
      if (x < 0 || x > W || y < 0 || y > H) break;
      const a = 0.025 * Math.max(0.15, 1 - x / W);
      ctx.fillStyle = "rgba(232, 240, 250, " + a + ")";
      ctx.fillRect(x, y, 1.2, 1.2);
    }
  }
  ctx.globalCompositeOperation = "source-over";

  const guard = ctx.createLinearGradient(0, H * 0.55, 0, H);
  guard.addColorStop(0, "rgba(8,12,18,0)");
  guard.addColorStop(1, "rgba(8,12,18,0.85)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 10);
};
