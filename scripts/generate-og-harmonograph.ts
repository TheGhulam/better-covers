/**
 * Generate the main OG image (1200×630) for better-covers.pages.dev
 * with a clear headline.
 *
 * Usage: npx tsx scripts/generate-og-harmonograph.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { createCanvas } from "@napi-rs/canvas";

import { renderHarmonograph } from "../src/renderers/02-harmonograph.ts";
import { hashStr } from "../src/shared/index.ts";

const W = 1200;
const H = 630;
const OUT_PATH = join(import.meta.dirname, "..", "website", "public", "og-harmonograph.jpg");

globalThis.document = {
  createElement(tag: string) {
    if (tag === "canvas") return createCanvas(1, 1);
    throw new Error(`document.createElement("${tag}") is not supported`);
  },
} as Document;

const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

// Render the harmonograph
const seed = hashStr("og-harmonograph-hero");
renderHarmonograph(ctx as any, W, H, seed);

// Add headline overlay
ctx.fillStyle = "rgba(0,0,0,0.45)";
ctx.fillRect(0, H - 170, W, 170);

ctx.fillStyle = "#f4e9d8";
ctx.font = "700 72px system-ui, -apple-system, sans-serif";
ctx.textAlign = "center";
ctx.fillText("Better Covers", W / 2, H - 95);

ctx.font = "400 28px system-ui, -apple-system, sans-serif";
ctx.fillStyle = "#d4c4a8";
ctx.fillText("Programmatic OG Images — No AI, just math", W / 2, H - 50);

// Export as high-quality JPEG
const buffer = canvas.toBuffer("image/jpeg", { quality: 0.82 });
writeFileSync(OUT_PATH, buffer);

console.log(`✓ Generated ${OUT_PATH}`);
console.log(`  Size: ${(buffer.length / 1024).toFixed(0)} KB`);
