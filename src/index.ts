/**
 * better-covers — programmatic OG-image covers.
 *
 * Twenty-three deterministic 1200 × 630 canvas renderers drawn from physics
 * (Witten & Sander, Bak-Tang-Wiesenfeld, von Kármán, Toepler), mathematics
 * (Penrose, Conway, Lindenmayer), generative art (Pickover, Hobbs, Bridson),
 * and cartographic / painterly convention (USGS contours, ASCII brightness
 * ramps, color-field painting). Every renderer is a pure
 * `(ctx, W, H, SEED) → void` function — same slug always paints the same
 * pixels, no Math.random, no clocks.
 *
 * Quick start:
 *
 * ```tsx
 * import { Cover, renderHoarfrost } from "better-covers";
 *
 * <Cover
 *   render={renderHoarfrost}
 *   seed="my-post-slug"
 *   title="Hoarfrost"
 *   subtitle="DLA from a top seed line"
 * />
 * ```
 *
 * @module better-covers
 */

export { Cover, type CoverProps } from "./Cover";
export { Gallery } from "./Gallery";
export { COVERS, type CoverEntry } from "./covers";
export { styles } from "./styles";

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
} from "./renderers";
