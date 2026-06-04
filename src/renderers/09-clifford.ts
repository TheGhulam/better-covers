/**
 * 09 · Strange attractor (Clifford) — 4.5 M-point histogram, log tonemap
 *
 * The Clifford attractor is a 2D iterated map of the form
 *
 *   x ← sin(a · y) + c · cos(a · x)
 *   y ← sin(b · x) + d · cos(b · y)
 *
 * Parameters `(a, b, c, d) = (−1.7, 1.3, −0.1, −1.2)` give an elegant lacy
 * form. The renderer iterates 500 times to burn in, then plots 4.5 million
 * points into a 2D histogram, log-tonemaps the count, and composites it as
 * sepia ink over a cream chronophotographic ground. The log map is what
 * turns it from a neon-on-black demo into something photographic.
 *
 * Family notes
 * - "Clifford attractor" specifically refers to Pickover's iterated
 *   sine-cosine map. The closely related Peter de Jong attractor was
 *   popularized by A. K. Dewdney's "Computer Recreations" column,
 *   *Scientific American*, July 1987. Pickover's variant — including
 *   the four-parameter form used here — appeared in his 1990 book.
 *
 * References
 * - C. A. Pickover, *Computers, Pattern, Chaos and Beauty* (St. Martin's
 *   Press, 1990) — published source for Pickover's Clifford (addition-form)
 *   variant used here (de Jong's subtraction-form map appeared in Dewdney
 *   1987, three years earlier).
 * - A. K. Dewdney, "Computer Recreations: Probing the strange attractions
 *   of chaos," Scientific American 257:1, 108–111 (July 1987) — Peter de
 *   Jong's attractor (close cousin).
 *
 * @module renderers/clifford
 */

import { addGrain, type Renderer } from "../shared";

// Four curated Clifford parameter sets, each producing a visually distinct
// attractor. Parameters (a,b,c,d) for x←sin(ay)+c·cos(ax), y←sin(bx)+d·cos(by).
// Ink and paper colors are tuned per preset so the photographic look holds.
const PRESETS = [
  {
    a: -1.7,
    b: 1.3,
    c: -0.1,
    d: -1.2,
    bgLight: "#f0e5d0",
    bgDark: "#d6c4a0",
    ink: [60, 38, 24] as const,
  },
  {
    a: -1.4,
    b: 1.6,
    c: 1.0,
    d: 0.7,
    bgLight: "#d8e4f0",
    bgDark: "#a8c0d8",
    ink: [20, 40, 80] as const,
  },
  {
    a: 1.6,
    b: -0.6,
    c: -1.2,
    d: 1.6,
    bgLight: "#f0ead0",
    bgDark: "#d8c870",
    ink: [60, 44, 8] as const,
  },
  {
    a: -1.7,
    b: 1.8,
    c: -1.9,
    d: -0.4,
    bgLight: "#e8f0e8",
    bgDark: "#a8c8a8",
    ink: [18, 52, 36] as const,
  },
];

export const renderClifford: Renderer = (ctx, W, H, SEED) => {
  const preset = PRESETS[(SEED >>> 0) % PRESETS.length];

  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
  bg.addColorStop(0, preset.bgLight);
  bg.addColorStop(1, preset.bgDark);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const { a, b, c, d } = preset;
  const N = 4_500_000;
  const hist = new Uint32Array(W * H);

  let x = 0.1;
  let y = 0.0;
  // Burn-in: walk 500 iterations off-screen so the orbit settles onto the
  // attractor before we start counting hits.
  for (let i = 0; i < 500; i++) {
    const xn = Math.sin(a * y) + c * Math.cos(a * x);
    const yn = Math.sin(b * x) + d * Math.cos(b * y);
    x = xn;
    y = yn;
  }

  const SX = W * 0.42;
  const SY = H * 0.42;
  const OX = W / 2;
  const OY = H / 2;
  let maxH = 1;
  for (let i = 0; i < N; i++) {
    const xn = Math.sin(a * y) + c * Math.cos(a * x);
    const yn = Math.sin(b * x) + d * Math.cos(b * y);
    x = xn;
    y = yn;
    const px = (OX + x * SX) | 0;
    const py = (OY + y * SY) | 0;
    if (px >= 0 && px < W && py >= 0 && py < H) {
      const k = py * W + px;
      const v = ++hist[k];
      if (v > maxH) maxH = v;
    }
  }

  // Log-tonemap onto the cream background. The pow(t, 0.6) compresses the
  // dynamic range further — the orbit's densest pixels would otherwise wash
  // out everything else.
  const id = ctx.getImageData(0, 0, W, H);
  const logMax = Math.log(1 + maxH);
  for (let i = 0, k = 0; i < W * H; i++, k += 4) {
    const v = hist[i];
    if (v === 0) continue;
    const t = Math.log(1 + v) / logMax;
    const [inkR, inkG, inkB] = preset.ink;
    const alpha = Math.min(0.97, Math.pow(t, 0.6));
    id.data[k] = id.data[k] * (1 - alpha) + inkR * alpha;
    id.data[k + 1] = id.data[k + 1] * (1 - alpha) + inkG * alpha;
    id.data[k + 2] = id.data[k + 2] * (1 - alpha) + inkB * alpha;
  }
  ctx.putImageData(id, 0, 0);

  const vg = ctx.createRadialGradient(
    W / 2,
    H / 2,
    W * 0.25,
    W / 2,
    H / 2,
    W * 0.78,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(60,40,20,0.45)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const guard = ctx.createLinearGradient(0, H * 0.55, 0, H);
  guard.addColorStop(0, "rgba(20,12,8,0)");
  guard.addColorStop(1, "rgba(20,12,8,0.6)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 10);
};
