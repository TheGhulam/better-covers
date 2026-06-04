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

// Eight curated Julia-set parameter values c = cr + ci·i, each producing a
// distinct topological class. All c values lie at or near the Mandelbrot
// boundary so their Julia sets are connected; points well outside the set
// yield disconnected Cantor-dust Julia sets that render as sparse clouds.
const PRESETS = [
  { cr: -0.7269, ci:  0.1889 },  // dragon spirals — intricate winding arms
  { cr: -0.4,    ci:  0.6    },  // Douady rabbit — three-lobed period-3 basin
  { cr:  0.285,  ci:  0.01   },  // fern dendrite — fine filaments on a broad crown
  { cr: -0.835,  ci: -0.2321 },  // cauliflower nebula — soft rounded corona
  { cr: -0.8,    ci:  0.156  },  // lightning — branched starburst dendrite
  { cr:  0.45,   ci:  0.1428 },  // seahorse valley — coiled spiral clusters
  { cr: -0.7,    ci:  0.27   },  // pinwheel — balanced rotational symmetry
  { cr:  0.285,  ci:  0.013  },  // archipelago — scattered island basins
] as const;

// Colour palettes: bg (background / filled interior), lo (deep exterior),
// hi (edge glow near the fractal boundary). Palette index is offset from
// the preset index so adjacent SEED values still look distinct.
const PALETTES = [
  { bg: [4,  8, 22] as const, lo: [18,  52, 120] as const, hi: [150, 210, 255] as const }, // arctic
  { bg: [22, 8,  4] as const, lo: [110, 42,  14] as const, hi: [255, 198,  90] as const }, // ember
  { bg: [4, 20, 10] as const, lo: [16,  86,  34] as const, hi: [130, 255, 165] as const }, // grove
  { bg: [18, 4, 22] as const, lo: [72,  18, 108] as const, hi: [228, 148, 255] as const }, // violet
] as const;

// Bailout at |z|² > 1e5 (|z| > 316) keeps the SIC formula well away from
// the log-of-log singularity that arises when |z| barely clears 2.
const BAILOUT_SQ = 1e5;
const MAX_ITER   = 200;
const LOG2       = Math.log(2);

export const renderJulia: Renderer = (ctx, W, H, SEED) => {
  const { cr, ci } = PRESETS[(SEED >>> 0) % PRESETS.length];
  const pal        = PALETTES[((SEED >>> 3) + 1) % PALETTES.length];

  const scale = 4.0 / W;
  const ox    = W * 0.5;
  const oy    = H * 0.5;

  const id  = ctx.createImageData(W, H);
  const pix = id.data;

  for (let py = 0; py < H; py++) {
    const zi0 = (py - oy) * scale;

    for (let px = 0; px < W; px++) {
      let zr = (px - ox) * scale;
      let zi = zi0;

      let iter = 0;
      // Orbit trap: track the minimum |z|² visited so far. Starting value
      // is the initial |z|² of this pixel — captures proximity even on
      // trajectories that escape on the first iteration.
      let minZ2 = zr * zr + zi * zi;

      while (iter < MAX_ITER) {
        const zr2 = zr * zr;
        const zi2 = zi * zi;
        if (zr2 + zi2 > BAILOUT_SQ) break;

        // z ← z² + c
        zi = 2.0 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        iter++;

        const z2 = zr * zr + zi * zi;
        if (z2 < minZ2) minZ2 = z2;
      }

      const idx = (py * W + px) * 4;

      // --- Interior: orbit stayed bounded ------------------------------------
      if (iter === MAX_ITER) {
        // Shade the filled set by orbit proximity rather than a flat fill:
        // points whose orbits swung close to the origin get a faint inner
        // glow, preserving some structure inside the solid regions.
        const t = Math.min(1.0, Math.sqrt(minZ2) * 0.85);
        pix[idx]     = Math.round(pal.bg[0] + (pal.lo[0] - pal.bg[0]) * t * 0.42);
        pix[idx + 1] = Math.round(pal.bg[1] + (pal.lo[1] - pal.bg[1]) * t * 0.42);
        pix[idx + 2] = Math.round(pal.bg[2] + (pal.lo[2] - pal.bg[2]) * t * 0.42);
        pix[idx + 3] = 255;
        continue;
      }

      // --- Exterior: orbit escaped — smooth iteration count -----------------
      // Use the final zr, zi after the loop exits (|z|² > BAILOUT_SQ).
      // SIC formula:  μ = iter + 2 − log₂(log(|z|²))
      // With BAILOUT_SQ = 1e5: log(|z|²) > log(1e5) ≈ 11.5 > 1, so the
      // inner log is always positive and the expression is always finite.
      const logZ2 = Math.log(zr * zr + zi * zi);
      const mu    = iter + 2.0 - Math.log(logZ2) / LOG2;

      // Cycle the smooth count to produce visible iso-potential bands across
      // the exterior, then mix in the orbit-trap proximity to accent the
      // fine filaments concentrated near the Julia-set boundary.
      const raw  = mu * 0.05;
      const band = raw - Math.floor(raw);
      const trap = Math.min(1.0, Math.sqrt(minZ2) * 0.5);
      const t    = Math.min(1.0, band * 0.72 + trap * 0.28);

      let r: number, g: number, b: number;
      if (t < 0.5) {
        const u = t * 2.0;
        r = Math.round(pal.bg[0] + (pal.lo[0] - pal.bg[0]) * u);
        g = Math.round(pal.bg[1] + (pal.lo[1] - pal.bg[1]) * u);
        b = Math.round(pal.bg[2] + (pal.lo[2] - pal.bg[2]) * u);
      } else {
        const u = (t - 0.5) * 2.0;
        r = Math.round(pal.lo[0] + (pal.hi[0] - pal.lo[0]) * u);
        g = Math.round(pal.lo[1] + (pal.hi[1] - pal.lo[1]) * u);
        b = Math.round(pal.lo[2] + (pal.hi[2] - pal.lo[2]) * u);
      }

      pix[idx]     = r;
      pix[idx + 1] = g;
      pix[idx + 2] = b;
      pix[idx + 3] = 255;
    }
  }

  ctx.putImageData(id, 0, 0);

  // Radial vignette: darken corners to frame the set and draw the eye
  // toward the fractal boundary at centre.
  const vg = ctx.createRadialGradient(
    W * 0.5, H * 0.5, W * 0.27,
    W * 0.5, H * 0.5, W * 0.76,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, `rgba(${pal.bg[0]},${pal.bg[1]},${pal.bg[2]},0.60)`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 14);
};
