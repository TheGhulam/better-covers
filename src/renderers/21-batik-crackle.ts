/**
 * 21 · Batik Crackle — wax-resist crackle on an indigo ground
 *
 * Indonesian batik applies wax to cloth before indigo dyeing; the wax
 * cracks under tension and leaves fine warm resist lines wherever the
 * dye penetrated through the cracks. The technique dates to at least
 * the 13th century in Java; it was inscribed on UNESCO's Representative
 * List of Intangible Cultural Heritage in 2009.
 *
 * The crackle field here is a sum of twelve sinusoidal interference
 * waves at varied frequencies and seed-shifted phases. The absolute
 * value of the sum spikes near zero along narrow contour curves —
 * exactly where wax breaks would fall. Pixels where |v| < 0.05 are
 * painted in a warm cream that brightens as v approaches zero,
 * yielding tapered crack edges over the indigo ground.
 *
 * Why sum of sines, not Voronoi
 * Voronoi cracks (the textbook approach) give straight edges between
 * cell centres — too geometric for cloth. Summed sinusoids produce the
 * smoothly meandering, branched cracks that real batik wax actually
 * produces. The trade-off is that the crack network here is non-
 * topological: cracks may dead-end rather than always close on
 * triple-points the way physical fracture networks do.
 *
 * References
 * - Indonesian batik tradition (Javanese: *batik tulis*, *batik cap*),
 *   13th century onward. UNESCO ICH Representative List inscription
 *   reference 00170 (2009).
 * - F. Heringa, *Fabric of Enchantment: Batik from the North Coast of
 *   Java* (LACMA, 1996) — colour-wax-crack technique in close detail.
 *
 * @module renderers/batik-crackle
 */

import { addGrain, mulberry32, type Renderer } from "../shared";

export const renderBatikCrackle: Renderer = (ctx, W, H, SEED) => {
  // Indigo ground.
  ctx.fillStyle = "#1a3a5c";
  ctx.fillRect(0, 0, W, H);

  // Pull the indigo back out so we can overwrite individual pixels with
  // the crackle colour where the field is near zero.
  const id = ctx.getImageData(0, 0, W, H);
  const d = id.data;

  // Twelve sine-wave phases. Two-tone seed drift means a small change
  // in the slug reshuffles every wave, but the overall crack density
  // stays similar — a property of physical batik too.
  const r = mulberry32(SEED);
  const phases: number[] = [];
  for (let i = 0; i < 12; i++) phases.push(r() * Math.PI * 2);

  // Crack threshold: pixels where the absolute summed wave is under
  // this value get painted as a crack. Lower values → fewer, finer
  // cracks; higher values → broader, more painted cracks.
  const THRESH = 0.05;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Sample coordinates: 8 wavelengths across W, 5 across H, so
      // cracks read at the same scale on wide and tall canvases alike.
      const nx = (x / W) * 8;
      const ny = (y / H) * 5;
      let v = 0;
      for (let k = 0; k < phases.length; k++) {
        // Each wave has its own spatial frequency (1 + k·0.4 in x,
        // 0.6 + k·0.3 in y) — the multiplied sin·cos pattern gives a
        // genuine 2D interference field, not a 1D ridge stretched out.
        v +=
          Math.sin(nx * (1 + k * 0.4) + phases[k]) *
          Math.cos(ny * (0.6 + k * 0.3) + phases[k]);
      }
      v = Math.abs(v / phases.length);

      if (v < THRESH) {
        // Brightness ramps from 0 at the crack centre to THRESH at its
        // edge — gives the crack a soft, tapered profile rather than a
        // hard binary mask.
        const t = (THRESH - v) / THRESH;
        const i = (y * W + x) * 4;
        // Warm cream crack colour over indigo ground.
        d[i] = Math.round(26 + t * 200);
        d[i + 1] = Math.round(58 + t * 150);
        d[i + 2] = Math.round(92 + t * 70);
      }
    }
  }

  ctx.putImageData(id, 0, 0);
  addGrain(ctx, W, H, 10);
};
