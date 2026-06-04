/**
 * 24 · Julia set — escape-time fractal with smooth iteration colouring
 *
 * A Julia set Jc is the boundary of the set of complex numbers z whose
 * orbits z → z² + c remain bounded. Unlike the Mandelbrot set (where both
 * z and c vary), each Julia set fixes c and varies the starting point z;
 * the resulting shapes range from smooth "cauliflower" nebulae to tight
 * dragon-wing spirals.
 *
 * The renderer uses the smooth iteration count (SIC) formula — also called
 * the "continuous potential" or "normalized iteration count" — to eliminate
 * the flat banding that integer escape counts produce:
 *
 *   μ = n + 2 − log₂(log(|z|²))
 *
 * This converts the orbit's final modulus into a sub-integer offset so
 * iso-potential curves cross the canvas smoothly. A second pass tracks the
 * minimum orbit modulus (origin trap), mixing proximity into the exterior
 * palette to recover filament detail that SIC alone loses in
 * low-iteration regions near the fractal boundary.
 *
 * The SEED selects one of eight curated c values, each representing a
 * topologically distinct Julia set class, and independently one of four
 * photographic colour palettes so adjacent slugs still look unlike.
 *
 * References
 * - A. Douady & J. H. Hubbard, "Étude dynamique des polynômes complexes"
 *   (Orsay preprint, 1984–85) — first classification of Julia set topology
 *   by the position of c relative to the Mandelbrot set.
 * - L. Rampe, "Smooth Colouring of the Mandelbrot Set" (fractint docs,
 *   2002) — the log-log continuous-potential formula used for SIC.
 * - P. Bourke, "Orbit trap rendering method," paulbourke.net (2006) —
 *   origin-trap colouring technique used for interior and exterior detail.
 * - I. Quilez, "Palette," iquilezles.org — cosine colour-basis approach
 *   that informed the palette interpolation structure used here.
 *
 * @module renderers/julia
 */

import { addGrain, type Renderer } from "../shared";

const PRESETS = [
  { cr: -0.7269, ci: 0.1889 }, // dragon spirals
  { cr: -0.4, ci: 0.6 }, // Douady rabbit
  { cr: 0.285, ci: 0.01 }, // fern dendrite
  { cr: -0.835, ci: -0.2321 }, // cauliflower nebula
  { cr: -0.8, ci: 0.156 }, // lightning
  { cr: 0.45, ci: 0.1428 }, // seahorse valley
  { cr: -0.7, ci: 0.27 }, // pinwheel
  { cr: 0.285, ci: 0.013 }, // archipelago
] as const;

const PALETTES = [
  {
    bg: [4, 8, 22] as const,
    lo: [18, 52, 120] as const,
    hi: [150, 210, 255] as const,
  }, // arctic
  {
    bg: [22, 8, 4] as const,
    lo: [110, 42, 14] as const,
    hi: [255, 198, 90] as const,
  }, // ember
  {
    bg: [4, 20, 10] as const,
    lo: [16, 86, 34] as const,
    hi: [130, 255, 165] as const,
  }, // grove
  {
    bg: [18, 4, 22] as const,
    lo: [72, 18, 108] as const,
    hi: [228, 148, 255] as const,
  }, // violet
] as const;

// The SIC formula requires log(|z|²) > 0, i.e. |z|² > 1. A large bailout
// (|z|² > 1e5, i.e. |z| > 316) keeps log(|z|²) ≈ 11.5, far from zero,
// which gives smoother SIC values and avoids numeric instability near the
// domain boundary.
const BAILOUT_SQ = 1e5;
const MAX_ITER = 200;
const LOG2 = Math.log(2);

// --- Tuning constants for the colouring pipeline ----------------------------
// BAND_FREQ: how many iso-potential bands per unit of smooth iteration count.
const BAND_FREQ = 0.05;
// BAND_WEIGHT / TRAP_WEIGHT: mix ratio between SIC banding and orbit-trap
// proximity. Higher trap weight accents filament detail near the boundary.
const BAND_WEIGHT = 0.72;
const TRAP_WEIGHT = 0.28;
// TRAP_DECAY: controls how quickly proximity falls off with orbit distance.
// Higher values make the glow tighter around the fractal boundary.
const TRAP_DECAY = 1.8;
// INTERIOR_GLOW: strength of the inner orbit-proximity tint (0 = flat fill).
const INTERIOR_GLOW = 0.42;
// INTERIOR_DECAY: decay rate for interior proximity shading.
const INTERIOR_DECAY = 1.2;
// GRAIN_AMOUNT: film-grain intensity passed to addGrain.
const GRAIN_AMOUNT = 14;

export const renderJulia: Renderer = (ctx, W, H, SEED) => {
  const { cr, ci } = PRESETS[(SEED >>> 0) % PRESETS.length];
  const pal = PALETTES[((SEED >>> 3) + 1) % PALETTES.length];

  const scale = 4.0 / W;
  const ox = W * 0.5;
  const oy = H * 0.5;

  const id = ctx.createImageData(W, H);
  const pix = id.data;

  // Hoist palette channels and deltas out of the pixel loop.
  const [bgR, bgG, bgB] = pal.bg;
  const [loR, loG, loB] = pal.lo;
  const [hiR, hiG, hiB] = pal.hi;
  const dBgLoR = loR - bgR;
  const dBgLoG = loG - bgG;
  const dBgLoB = loB - bgB;
  const dLoHiR = hiR - loR;
  const dLoHiG = hiG - loG;
  const dLoHiB = hiB - loB;

  for (let py = 0; py < H; py++) {
    const zi0 = (py - oy) * scale;

    for (let px = 0; px < W; px++) {
      let zr = (px - ox) * scale;
      let zi = zi0;

      let iter = 0;
      let lastZ2 = zr * zr + zi * zi;
      let minZ2 = lastZ2;

      while (iter < MAX_ITER) {
        if (lastZ2 > BAILOUT_SQ) break;

        const zr2 = zr * zr;
        const zi2 = zi * zi;
        zi = 2.0 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        iter++;

        lastZ2 = zr * zr + zi * zi;
        if (lastZ2 < minZ2) minZ2 = lastZ2;
      }

      const idx = (py * W + px) * 4;
      const minAbsZ = Math.sqrt(minZ2);

      if (iter === MAX_ITER) {
        const prox = Math.exp(-minAbsZ * INTERIOR_DECAY);
        const g = prox * INTERIOR_GLOW;
        pix[idx] = Math.round(bgR + dBgLoR * g);
        pix[idx + 1] = Math.round(bgG + dBgLoG * g);
        pix[idx + 2] = Math.round(bgB + dBgLoB * g);
        pix[idx + 3] = 255;
        continue;
      }

      const logZ2 = Math.log(lastZ2);
      const mu = iter + 2.0 - Math.log(logZ2) / LOG2;

      const raw = mu * BAND_FREQ;
      const band = raw - Math.floor(raw);
      const trap = Math.exp(-minAbsZ * TRAP_DECAY);
      const t = Math.min(1.0, band * BAND_WEIGHT + trap * TRAP_WEIGHT);

      let r: number, g: number, b: number;
      if (t < 0.5) {
        const u = t * 2.0;
        r = Math.round(bgR + dBgLoR * u);
        g = Math.round(bgG + dBgLoG * u);
        b = Math.round(bgB + dBgLoB * u);
      } else {
        const u = (t - 0.5) * 2.0;
        r = Math.round(loR + dLoHiR * u);
        g = Math.round(loG + dLoHiG * u);
        b = Math.round(loB + dLoHiB * u);
      }

      pix[idx] = r;
      pix[idx + 1] = g;
      pix[idx + 2] = b;
      pix[idx + 3] = 255;
    }
  }

  ctx.putImageData(id, 0, 0);

  const vg = ctx.createRadialGradient(
    W * 0.5,
    H * 0.5,
    W * 0.27,
    W * 0.5,
    H * 0.5,
    W * 0.76,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, `rgba(${pal.bg[0]},${pal.bg[1]},${pal.bg[2]},0.60)`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, GRAIN_AMOUNT);
};
