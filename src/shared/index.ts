/**
 * Shared utilities used by every cover renderer.
 *
 * A deterministic toolkit: a stable string hash, a small PRNG (mulberry32),
 * a value-noise lattice with smoothstep interpolation, fractional Brownian
 * motion (fBm) built on top of it, and a uniform grain pass. Every renderer
 * pulls from this module — nothing here touches `Math.random` or the clock,
 * so the same `(W, H, SEED)` always paints the same pixels.
 *
 * @module shared
 */

/* -------------------------------------------------------------------------- *
 *  Renderer signature
 * -------------------------------------------------------------------------- */

/**
 * Every cover is a pure `(ctx, W, H, SEED) → void` function.
 *
 * The renderer paints onto the supplied 2D context at the given `W × H`
 * size. It must be deterministic in `(W, H, SEED)` — no clocks, no
 * `Math.random`. Use {@link hashStr} on a slug to derive `SEED`.
 */
export type Renderer = (
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  SEED: number,
) => void;

/* -------------------------------------------------------------------------- *
 *  String hashing
 * -------------------------------------------------------------------------- */

/**
 * 32-bit FNV-1a hash of a string. Used to turn a post slug into a numeric
 * seed for the deterministic renderers below.
 *
 * Reference: Fowler–Noll–Vo hash, Glenn Fowler, Landon Curt Noll, Kiem-Phong Vo, 1991.
 */
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* -------------------------------------------------------------------------- *
 *  Pseudo-random number generator
 * -------------------------------------------------------------------------- */

/**
 * Mulberry32 — a small, fast 32-bit PRNG. Returns a function that, on each
 * call, yields a uniform float in `[0, 1)`.
 *
 * Reference: Tommy Ettinger, "Mulberry32" (2017),
 * <https://gist.github.com/tommyettinger/46a874533244883189143505d203312c>.
 * Public domain.
 */
export function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------------------- *
 *  Lattice hash & value noise
 * -------------------------------------------------------------------------- */

/**
 * Spatial 2D hash — maps `(x, y, seed)` to a uniform float in `[0, 1]`.
 * Used as the lattice for the value-noise function below.
 */
export function hash2(x: number, y: number, s: number): number {
  let h = s ^ Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/**
 * Bilinearly interpolated value noise with a smoothstep falloff inside each
 * lattice cell. Quintic interpolation would be smoother but this is enough
 * for the covers and ~2× cheaper.
 *
 * Reference: Ken Perlin's lattice noise tradition; the specific
 * smoothstep-on-value-noise variant is standard in the demoscene.
 */
export function smoothNoise(x: number, y: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = hash2(xi, yi, s);
  const b = hash2(xi + 1, yi, s);
  const c = hash2(xi, yi + 1, s);
  const d = hash2(xi + 1, yi + 1, s);
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

/**
 * Fractional Brownian motion — `oct` octaves of {@link smoothNoise} summed
 * with amplitude halving and frequency doubling between octaves. Output
 * normalized to `[0, 1]`. Four octaves is a good default for cover-sized
 * images; six is overkill at 1200×630.
 *
 * Reference: Benoit Mandelbrot & John W. Van Ness, "Fractional Brownian
 * motions, fractional noises and applications", SIAM Review 10:4 (1968).
 */
export function fbm(x: number, y: number, s: number, oct = 4): number {
  let v = 0;
  let amp = 1;
  let freq = 1;
  let max = 0;
  for (let i = 0; i < oct; i++) {
    v += amp * smoothNoise(x * freq, y * freq, s + i * 7919);
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return v / max;
}

/* -------------------------------------------------------------------------- *
 *  Post-processing
 * -------------------------------------------------------------------------- */

/**
 * Add uniform grain in-place over the full canvas. `amount` is the half-width
 * of the signed noise distribution, in 0–255 units — `amount = 24` adds ±12.
 *
 * Uses a fixed seed (0xC0FFEE) so the grain pattern is the same regardless of
 * the cover's own SEED. This keeps grain visually consistent across a feed of
 * differently seeded covers.
 */
/** Bottom gradient for OG title legibility (~55–60% Y). */
export function addVignette(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  strength = 0.65,
): void {
  const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.55, `rgba(0,0,0,${strength * 0.35})`);
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function rgb(r: number, g: number, b: number, a = 1): string {
  return a < 1 ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Map a 0–1 scalar field to RGB with visible mid-tones. */
export function toneMapField(
  t: number,
  bg: [number, number, number],
  mid: [number, number, number],
  hi: [number, number, number],
): [number, number, number] {
  const s = clamp(Math.pow(clamp(t, 0, 1), 0.42) * 1.2, 0, 1);
  if (s < 0.45) {
    const u = s / 0.45;
    return [
      Math.round(lerp(bg[0], mid[0], u)),
      Math.round(lerp(bg[1], mid[1], u)),
      Math.round(lerp(bg[2], mid[2], u)),
    ];
  }
  const u = (s - 0.45) / 0.55;
  return [
    Math.round(lerp(mid[0], hi[0], u)),
    Math.round(lerp(mid[1], hi[1], u)),
    Math.round(lerp(mid[2], hi[2], u)),
  ];
}

/** Nearest-seed Voronoi cell index for pixel (px, py). */
export function voronoiCell(
  px: number,
  py: number,
  seeds: { x: number; y: number }[],
): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < seeds.length; i++) {
    const dx = px - seeds[i].x;
    const dy = py - seeds[i].y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function addGrain(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  amount: number,
): void {
  const id = ctx.getImageData(0, 0, W, H);
  const d = id.data;
  const r = mulberry32(0xc0ffee);
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(id, 0, 0);
}
