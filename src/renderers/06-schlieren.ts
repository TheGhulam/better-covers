/**
 * 06 · Schlieren — vertical gradient of an advected plume, sigmoid cutoff
 *
 * Toepler's schlieren technique places a knife-edge at the focal point of a
 * collimated beam: any density gradient perpendicular to the edge deflects
 * rays past the edge and brightens (or darkens) the image at that location.
 * Heat plumes, shock fronts, and candle convection — normally invisible —
 * become visible.
 *
 * Algorithmically: build an advected fBm density field, take its vertical
 * gradient, and push it through a sigmoid centered on the knife edge. The
 * result is a gray-scale image of the density field's first derivative —
 * the classic Toepler schlieren image — with a faint warm tint added to
 * brighter regions for the look of a tungsten-lit lab photograph.
 *
 * Historical notes
 * - Robert Hooke, *Micrographia* (1665), Observation LVIII — early notice
 *   of thermal refraction in air.
 * - Foucault's 1859 knife-edge test for telescope mirrors used the same
 *   geometry.
 * - August Toepler applied the technique to fluid flow in 1864 and named it.
 * - Schardin systematized variants in VDI-Forschungsheft 367 (1934) and
 *   a 1942 review in *Ergebnisse der exakten Naturwissenschaften*.
 *
 * References
 * - A. Toepler, *Beobachtungen nach einer neuen optischen Methode* (Cohen &
 *   Sohn, Bonn, 1864).
 * - H. Schardin, *Das Toeplersche Schlierenverfahren*, VDI-Forschungsheft
 *   367 (1934).
 * - G. S. Settles, *Schlieren and Shadowgraph Techniques* (Springer, 2001) —
 *   modern reference.
 *
 * @module renderers/schlieren
 */

import { fbm, addGrain, mulberry32, type Renderer } from "../shared";

export const renderSchlieren: Renderer = (ctx, W, H, SEED) => {
  // Plume centre x varies per slug (30–70 % of W) so each cover shows a
  // differently-placed heat column rather than always upwelling at 42 %.
  const rPlume = mulberry32(SEED ^ 0x5c411e);
  const plumeX = W * (0.3 + rPlume() * 0.4);

  // Build the density field: a vertical plume (Gaussian in x, decaying in y),
  // plus low-frequency swirl, plus high-frequency turbulence biased toward
  // the plume.
  const density = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cx = plumeX;
      const dx = (x - cx) / W;
      const yt = y / H;
      const swirl = fbm(x * 0.0035, y * 0.0035 - yt * 0.4, SEED, 5);
      const plume = Math.exp(-Math.pow(dx, 2) * 5) * (1.2 - yt);
      const turb = fbm(x * 0.014, y * 0.014 - yt * 0.8, SEED + 91, 4);
      const d = swirl * 0.7 + plume * 0.6 + turb * 0.25 * plume;
      density[y * W + x] = d;
    }
  }

  // Take ∂ρ/∂y by centered difference and push through a sigmoid centered
  // on zero: positive gradients brighten, negative gradients darken,
  // mid-gray everywhere else — the knife-edge cutoff.
  const id = ctx.createImageData(W, H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const gy = (density[i + W] - density[i - W]) * 0.5;
      const luma = 1 / (1 + Math.exp(-gy * 65)) - 0.5;
      const base = 0.55 + luma * 0.95;
      const v = Math.max(0, Math.min(1, base));
      const tint = Math.max(0, luma) * 2;
      const R = 255 * v + tint * 6;
      const G = 248 * v + tint * 4;
      const B = 230 * v - tint * 2;
      const k = i << 2;
      id.data[k] = Math.min(255, R);
      id.data[k + 1] = Math.min(255, G);
      id.data[k + 2] = Math.min(255, B);
      id.data[k + 3] = 255;
    }
  }
  // Fill the top row with a flat tone (the gradient is undefined there).
  for (let x = 0; x < W; x++) {
    const k = x << 2;
    id.data[k] = 140;
    id.data[k + 1] = 138;
    id.data[k + 2] = 132;
    id.data[k + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);

  const vg = ctx.createRadialGradient(
    plumeX,
    H * 0.5,
    W * 0.15,
    W * 0.5,
    H * 0.5,
    W * 0.85,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const guard = ctx.createLinearGradient(0, H * 0.55, 0, H);
  guard.addColorStop(0, "rgba(0,0,0,0)");
  guard.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);

  addGrain(ctx, W, H, 10);
};
