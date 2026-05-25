/**
 * 11 · Painterly atmosphere — radial color-field blobs
 *
 * Four to six soft-edged radial blobs in a restrained palette of three
 * families — Dusk (amber / rust / indigo), Earth (ochre / sienna / slate),
 * and Ember (terracotta / oxblood / twilight) — chosen per cover from the
 * slug seed. The first blob is biased toward the upper-left third to anchor
 * the composition; the rest float free. A film-grain pass driven by the
 * same PRNG breaks the otherwise machine-clean gradient banding into
 * something closer to a Rothko reproduction than a CSS demo.
 *
 * References
 * - Mark Rothko, *Untitled (Black on Maroon)* (1958–59) and the rest of the
 *   Seagram Murals — the canonical color-field reference for the blob
 *   geometry and the warm-on-warm temperature relationships used here.
 * - Helen Frankenthaler, *Mountains and Sea* (1952) — the soft, soaked-in
 *   blob edges.
 *
 * No part of any real Rothko or Frankenthaler is reproduced here; the
 * palettes and composition are general references, not copies.
 *
 * @module renderers/painterly
 */

import { mulberry32, type Renderer } from "../shared";

type RGB = [number, number, number];

interface PaletteFamily {
  base: string;
  warm: RGB[];
  cool: RGB[];
}

const PAINTERLY_PALETTES: PaletteFamily[] = [
  // Dusk: amber, rust, indigo.
  {
    base: "#171a28",
    warm: [
      [210, 130, 70],
      [180, 100, 60],
      [240, 200, 150],
    ],
    cool: [
      [60, 70, 130],
      [80, 95, 160],
    ],
  },
  // Earth: ochre, sienna, slate.
  {
    base: "#1a1816",
    warm: [
      [200, 140, 90],
      [220, 175, 130],
      [180, 110, 80],
    ],
    cool: [
      [60, 78, 92],
      [50, 60, 75],
    ],
  },
  // Ember: terracotta, oxblood, twilight.
  {
    base: "#181a1e",
    warm: [
      [180, 110, 80],
      [200, 136, 74],
      [220, 130, 90],
    ],
    cool: [
      [70, 80, 88],
      [110, 95, 80],
    ],
  },
];

export const renderPainterly: Renderer = (ctx, W, H, SEED) => {
  const rand = mulberry32(SEED);
  const family =
    PAINTERLY_PALETTES[Math.floor(rand() * PAINTERLY_PALETTES.length)];

  ctx.fillStyle = family.base;
  ctx.fillRect(0, 0, W, H);

  const numBlobs = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < numBlobs; i++) {
    const isWarm = rand() < 0.6;
    const pool = isWarm ? family.warm : family.cool;
    const [r, g, b] = pool[Math.floor(rand() * pool.length)];
    const alpha = 0.32 + rand() * 0.32;

    // First blob anchors the composition in the upper-left third; the rest
    // float anywhere across the canvas.
    const isFirst = i === 0;
    const x = isFirst ? W * (0.15 + rand() * 0.3) : rand() * W;
    const y = isFirst ? H * (0.2 + rand() * 0.3) : rand() * H;
    const radius = (isFirst ? 500 : 350) + rand() * 250;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Film grain — drawn from the same PRNG as the palette pick so the
  // entire cover is deterministic in SEED. Stronger amplitude than the
  // shared addGrain (26 vs 10) — these covers need the visible noise to
  // mask the gradient banding.
  const id = ctx.getImageData(0, 0, W, H);
  const data = id.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * 26;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(id, 0, 0);

  const guard = ctx.createLinearGradient(0, H * 0.55, 0, H);
  guard.addColorStop(0, "rgba(0,0,0,0)");
  guard.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = guard;
  ctx.fillRect(0, 0, W, H);
};
