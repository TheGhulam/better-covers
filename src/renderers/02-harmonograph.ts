/**
 * 02 · Harmonograph — three damped-sinusoid pairs
 *
 * A harmonograph is a mechanical drawing instrument in which two or three
 * pendulums move a pen relative to a sheet of paper. Their decaying sinusoidal
 * motions interfere into Lissajous-like curves — the guilloché patterns you'll
 * find on the back of any pre-2000 banknote.
 *
 * Three traces are drawn, each summing four damped sinusoids (two per axis)
 * with frequencies chosen near integer ratios for almost-closed curves and
 * slightly different damping coefficients so the families don't collapse onto
 * a single line.
 *
 * Historical notes
 * - The first device described in print was Hugh Blackburn's V-string
 *   pendulum at Glasgow, 1844 — the basis for the so-called Blackburn pendulum.
 * - The term "harmonograph" is first attested in the 1870s with A. E. Donkin
 *   and Samuel Charles Tisley.
 * - Joseph Goold of Nottingham contributed a "twin elliptic pendulum
 *   harmonograph" documented in H. Irvine Whitty's *The Harmonograph* (1893)
 *   and the Goold-Benham-Kerr-Wilberforce volume *Harmonic Vibrations and
 *   Vibration Figures* (Newton & Co., 1909). The earlier project notes
 *   credited "Goold 1844"; the correct primary date for harmonograph-style
 *   pendulum drawings is Blackburn 1844, with Goold's work substantially later.
 *
 * @module renderers/harmonograph
 */

import { addGrain, type Renderer } from "../shared";

export const renderHarmonograph: Renderer = (ctx, W, H) => {
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, "#1a120a");
  bg.addColorStop(1, "#080604");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2 - 30;
  const scale = 220;

  // Frequencies chosen near small integer ratios for almost-closed curves;
  // damping coefficients spread by a few percent so the three traces decay
  // at different rates.
  const traces = [
    {
      fx1: 2.01, fx2: 3.0, fy1: 3.0, fy2: 2.01,
      px1: 0.0, px2: 1.57, py1: 0.78, py2: 0.0,
      d: 0.0042, color: "rgba(220, 165, 95, 0.55)",
    },
    {
      fx1: 2.99, fx2: 2.0, fy1: 1.99, fy2: 3.01,
      px1: 0.4, px2: 0.0, py1: 0.0, py2: 1.2,
      d: 0.0055, color: "rgba(200, 130, 70, 0.5)",
    },
    {
      fx1: 4.01, fx2: 3.0, fy1: 3.0, fy2: 2.0,
      px1: 0.0, px2: 0.78, py1: 1.57, py2: 0.0,
      d: 0.0048, color: "rgba(180, 100, 60, 0.45)",
    },
  ];

  ctx.lineWidth = 0.6;
  ctx.lineCap = "round";

  for (const t of traces) {
    ctx.strokeStyle = t.color;
    ctx.beginPath();
    const N = 24000;
    const dt = 0.05;
    for (let i = 0; i < N; i++) {
      const time = i * dt;
      const damp = Math.exp(-t.d * time);
      const x =
        cx +
        scale *
          damp *
          (Math.sin(t.fx1 * time + t.px1) +
            0.7 * Math.sin(t.fx2 * time + t.px2));
      const y =
        cy +
        scale *
          damp *
          (Math.sin(t.fy1 * time + t.py1) +
            0.7 * Math.sin(t.fy2 * time + t.py2));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const vg = ctx.createRadialGradient(
    W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.75,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const guard = ctx.createLinearGradient(0, H * 0.5, 0, H);
  guard.addColorStop(0, "rgba(0,0,0,0)");
  guard.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 8);
};
