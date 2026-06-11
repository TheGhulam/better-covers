/**
 * better-covers — programmatic OG-image covers.
 *
 * Twenty-four deterministic 1200 × 630 canvas renderers drawn from physics
 * (Witten & Sander, Bak-Tang-Wiesenfeld, von Kármán, Toepler), mathematics
 * (Penrose, Conway, Lindenmayer), generative art (Pickover, Hobbs, Bridson),
 * and cartographic / painterly convention (USGS contours, ASCII brightness
 * ramps, color-field painting). Every renderer is a pure
 * `(ctx, W, H, SEED) → void` function — same slug always paints the same
 * pixels, no Math.random, no clocks.
 *
 * Quick start:
 *
 * ```ts
 * import { createCanvas } from "@napi-rs/canvas";
 * import { renderHoarfrost } from "better-covers";
 *
 * const canvas = createCanvas(1200, 630);
 * const ctx = canvas.getContext("2d");
 * renderHoarfrost(ctx, 1200, 630, "my-post-slug");
 * const png = canvas.toBuffer("image/png");
 * ```
 *
 * @module better-covers
 */

export type { Renderer } from "./shared";
export {
  hashStr,
  mulberry32,
  hash2,
  smoothNoise,
  fbm,
  addGrain,
  addVignette,
  rgb,
  lerp,
  clamp,
  voronoiCell,
  toneMapField,
} from "./shared";

export {
  renderHoarfrost,
  renderHarmonograph,
  renderLichtenberg,
  renderSandpile,
  renderKarman,
  renderSchlieren,
  renderPenrose,
  renderLSystem,
  renderClifford,
  renderStippling,
  renderPainterly,
  renderFlow,
  renderTopo,
  renderLife,
  renderAscii,
  renderAsciiWith,
  renderGrayScottMaze,
  renderSpaceColonization,
  renderRisograph,
  renderWoodcut,
  renderBarnsleyFern,
  renderBatikCrackle,
  renderHypsometric,
  renderBriansBrain,
  renderJulia,
} from "./renderers";