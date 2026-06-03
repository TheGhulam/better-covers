/**
 * Determinism contract test.
 *
 * The library's central promise is that every renderer is a pure function
 * of `(W, H, SEED)`. This file enforces that promise:
 *
 *   1. Calling the same renderer twice with the same arguments yields
 *      byte-identical pixel buffers.
 *   2. Different seeds yield different buffers (the seed is actually
 *      doing something) — every renderer is now slug-sensitive.
 *   3. `hashStr` produces stable, byte-identical hashes for the same input
 *      across runs.
 *
 * If you change a renderer in a way that breaks (1) or makes (2) regress
 * for a representative slug, this test will fail loudly and the reviewer
 * will ask why.
 *
 * This is the cheaper, faster guardrail that runs on every commit.
 * (Visual snapshot / thumbnail regeneration is a separate manual step.)
 */

import { describe, it, expect } from "vitest";
import { createCanvas } from "@napi-rs/canvas";

import {
  hashStr,
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
  renderGrayScottMaze,
  renderSpaceColonization,
  renderRisograph,
  renderWoodcut,
  renderBarnsleyFern,
  renderBatikCrackle,
  renderHypsometric,
  renderBriansBrain,
} from "../../src";
import type { Renderer } from "../../src";

// Smaller canvas — keeps the test suite fast. Determinism doesn't depend
// on size; the contract is per-(W, H, SEED).
const W = 240;
const H = 126;

/** Render once and return a Uint8 copy of the pixel buffer. */
function renderOnce(render: Renderer, seed: number): Uint8ClampedArray {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, W, H);
  render(ctx as unknown as CanvasRenderingContext2D, W, H, seed);
  return new Uint8ClampedArray(ctx.getImageData(0, 0, W, H).data);
}

function buffersEqual(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Each entry says whether SEED actually changes the output.
 * With the 2026-06 renderer updates, *all* renderers now produce visibly
 * different output for different seeds (no more "house-style" identical-across-slugs
 * covers). The flag is retained for documentation / future house-style cases.
 */
const RENDERERS: {
  name: string;
  render: Renderer;
  seedIndependent: boolean;
}[] = [
  { name: "renderHoarfrost", render: renderHoarfrost, seedIndependent: false },
  { name: "renderHarmonograph", render: renderHarmonograph, seedIndependent: false },
  { name: "renderLichtenberg", render: renderLichtenberg, seedIndependent: false },
  { name: "renderSandpile", render: renderSandpile, seedIndependent: false },
  { name: "renderKarman", render: renderKarman, seedIndependent: false },
  { name: "renderSchlieren", render: renderSchlieren, seedIndependent: false },
  { name: "renderPenrose", render: renderPenrose, seedIndependent: false },
  { name: "renderLSystem", render: renderLSystem, seedIndependent: false },
  { name: "renderClifford", render: renderClifford, seedIndependent: false },
  { name: "renderStippling", render: renderStippling, seedIndependent: false },
  { name: "renderPainterly", render: renderPainterly, seedIndependent: false },
  { name: "renderFlow", render: renderFlow, seedIndependent: false },
  { name: "renderTopo", render: renderTopo, seedIndependent: false },
  { name: "renderLife", render: renderLife, seedIndependent: false },
  { name: "renderGrayScottMaze", render: renderGrayScottMaze, seedIndependent: false },
  { name: "renderSpaceColonization", render: renderSpaceColonization, seedIndependent: false },
  { name: "renderRisograph", render: renderRisograph, seedIndependent: false },
  { name: "renderWoodcut", render: renderWoodcut, seedIndependent: false },
  { name: "renderBarnsleyFern", render: renderBarnsleyFern, seedIndependent: false },
  { name: "renderBatikCrackle", render: renderBatikCrackle, seedIndependent: false },
  { name: "renderHypsometric", render: renderHypsometric, seedIndependent: false },
  { name: "renderBriansBrain", render: renderBriansBrain, seedIndependent: false },
  // The ASCII renderer uses document.createElement('canvas') internally
  // for its supersampled scratch canvas. That works in jsdom but is
  // slow; covered by its own dedicated test.
];

describe("determinism", () => {
  describe("hashStr is stable", () => {
    it("hashes the same string to the same number every time", () => {
      const a = hashStr("better-covers");
      const b = hashStr("better-covers");
      expect(a).toBe(b);
    });

    it("hashes different strings to different numbers", () => {
      const a = hashStr("better-covers");
      const b = hashStr("og-cover");
      expect(a).not.toBe(b);
    });

    it("matches the documented FNV-1a fingerprint", () => {
      // FNV-1a of "" is the offset basis 2166136261.
      expect(hashStr("")).toBe(2166136261);
    });
  });

  describe.each(RENDERERS)("$name", ({ render, seedIndependent }) => {
    it("produces identical pixels across two calls with the same seed", () => {
      const seed = hashStr("the-same-slug");
      const a = renderOnce(render, seed);
      const b = renderOnce(render, seed);
      expect(buffersEqual(a, b)).toBe(true);
    });

    if (seedIndependent) {
      it("ignores SEED (house-style / slug-invariant cover)", () => {
        const a = renderOnce(render, hashStr("slug-one"));
        const b = renderOnce(render, hashStr("slug-two"));
        expect(buffersEqual(a, b)).toBe(true);
      });
    } else {
      it("produces meaningfully different pixels for different seeds", () => {
        const a = renderOnce(render, hashStr("slug-one"));
        const b = renderOnce(render, hashStr("slug-two"));
        expect(buffersEqual(a, b)).toBe(false);
        // At least 3 % of pixels should differ — at the small test size some
        // renderers (e.g. stippling) change fewer than 5 % of pixels.
        let diff = 0;
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) diff++;
        }
        expect(diff / a.length).toBeGreaterThan(0.03);
      });
    }
  });
});
