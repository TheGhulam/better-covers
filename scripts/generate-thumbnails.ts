/**
 * Render README thumbnail PNGs for every cover at 360 × 189 (30 % of OG size).
 *
 * Usage: npx tsx scripts/generate-thumbnails.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createCanvas } from "@napi-rs/canvas";

import { hashStr } from "../src/shared";
import {
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
} from "../src/renderers";
import type { Renderer } from "../src/shared";

const W = 360;
const H = 189;
const OUT_DIR = join(import.meta.dirname, "..", "docs", "thumbnails");

// ASCII uses document.createElement('canvas') for its supersample pass.
globalThis.document = {
  createElement(tag: string) {
    if (tag === "canvas") return createCanvas(1, 1);
    throw new Error(`document.createElement("${tag}") is not supported`);
  },
} as Document;

const COVERS: { slug: string; render: Renderer }[] = [
  { slug: "dla-hoarfrost", render: renderHoarfrost },
  { slug: "harmonograph", render: renderHarmonograph },
  { slug: "lichtenberg", render: renderLichtenberg },
  { slug: "sandpile", render: renderSandpile },
  { slug: "karman", render: renderKarman },
  { slug: "schlieren", render: renderSchlieren },
  { slug: "penrose", render: renderPenrose },
  { slug: "lsystem", render: renderLSystem },
  { slug: "clifford", render: renderClifford },
  { slug: "stippling", render: renderStippling },
  { slug: "painterly-atmosphere", render: renderPainterly },
  { slug: "flow-fidenza", render: renderFlow },
  { slug: "topo-contour", render: renderTopo },
  { slug: "life-conway", render: renderLife },
  { slug: "ascii-landscape", render: renderAscii },
];

mkdirSync(OUT_DIR, { recursive: true });

for (const { slug, render } of COVERS) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, W, H);
  render(ctx as unknown as CanvasRenderingContext2D, W, H, hashStr(slug));
  const out = join(OUT_DIR, `${slug}.png`);
  writeFileSync(out, canvas.toBuffer("image/png"));
  console.log(`wrote ${out}`);
}
