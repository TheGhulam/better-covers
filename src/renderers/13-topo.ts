/**
 * 13 · Topographic contours — fBm heightfield with a Gaussian summit
 *
 * A fractional Brownian motion heightfield (five octaves) is summed with a
 * single Gaussian peak at a slug-seeded position. Contour lines fall at
 * fourteen evenly spaced thresholds; the peak densifies into concentric
 * summit rings — a recognizable landmark on every cover, the way a USGS
 * quad always has at least one named hill.
 *
 * Three independent PRNG streams keep the components from interfering:
 * one for the fBm (the cover's `SEED` directly), one for the peak position
 * (`SEED ^ 0x5eedface`), and one for the grain pass (`SEED ^ 0xdeadbeef`),
 * so changing the seed reshuffles everything together but the streams stay
 * statistically independent.
 *
 * References
 * - USGS US Topo elevation symbology for brown/ochre contour ink (charcoal
 *   background is cover-art styling, not USGS convention).
 *   <https://www.usgs.gov/ngp-standards-and-specifications/us-topo-cartographic-specifications-elevation>
 * - W. E. Lorensen & H. E. Cline, "Marching cubes: A high resolution 3D
 *   surface construction algorithm," ACM SIGGRAPH 21:4, 163–169 (1987) —
 *   iso-surface extraction lineage; this renderer uses scalar-field banding
 *   at 14 thresholds, not marching squares.
 *   <https://doi.org/10.1145/37402.37422>
 *
 * @module renderers/topo
 */

import { mulberry32, fbm, type Renderer } from "../shared";

export const renderTopo: Renderer = (ctx, W, H, SEED) => {
  const baseR = 24;
  const baseG = 22;
  const baseB = 20; // charcoal
  const inkR = 200;
  const inkG = 136;
  const inkB = 74; // warm ochre

  const peakRand = mulberry32(SEED ^ 0x5eedface);
  const peakX = W * (0.2 + peakRand() * 0.6);
  const peakY = H * (0.18 + peakRand() * 0.42);
  const peakSigma = Math.min(W, H) * 0.16;
  const peakStrength = 0.55;
  const invTwoSigSq = 1 / (2 * peakSigma * peakSigma);

  const id = ctx.createImageData(W, H);
  const data = id.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - peakX;
      const dy = y - peakY;
      const bump = Math.exp(-(dx * dx + dy * dy) * invTwoSigSq) * peakStrength;
      const h = fbm(x * 0.004, y * 0.004, SEED, 5) + bump;
      // Iso-line banding: pixels near each of 14 evenly spaced thresholds.
      const banded = (h * 14) % 1;
      const onLine = banded < 0.045 || banded > 0.955;
      const i = (y * W + x) * 4;
      if (onLine) {
        const fade = 0.7 + Math.min(h, 1) * 0.3;
        data[i] = Math.round(inkR * fade);
        data[i + 1] = Math.round(inkG * fade);
        data[i + 2] = Math.round(inkB * fade);
        data[i + 3] = 255;
      } else {
        const v = (h - 0.5) * 10;
        data[i] = Math.max(0, baseR + v);
        data[i + 1] = Math.max(0, baseG + v);
        data[i + 2] = Math.max(0, baseB + v);
        data[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(id, 0, 0);

  // Grain — independent PRNG stream so it doesn't perturb the contour
  // positions if the SEED happens to align with a contour threshold.
  const grain = ctx.getImageData(0, 0, W, H);
  const g = grain.data;
  const rand = mulberry32(SEED ^ 0xdeadbeef);
  for (let i = 0; i < g.length; i += 4) {
    const n = (rand() - 0.5) * 16;
    g[i] = Math.max(0, Math.min(255, g[i] + n));
    g[i + 1] = Math.max(0, Math.min(255, g[i + 1] + n));
    g[i + 2] = Math.max(0, Math.min(255, g[i + 2] + n));
  }
  ctx.putImageData(grain, 0, 0);

  const guard = ctx.createLinearGradient(0, H * 0.55, 0, H);
  guard.addColorStop(0, "rgba(0,0,0,0)");
  guard.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);
};
