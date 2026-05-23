# Server-side rendering

Every renderer in `better-covers` is a pure function of `(ctx, W, H, SEED)`,
which means they work anywhere a 2D canvas context exists — not just in
the browser. This guide covers the three common server / build-time
contexts.

## 1. Node + `node-canvas`

[`canvas`](https://github.com/Automattic/node-canvas) is the most mature
Node binding. It compiles native code, so binaries are platform-specific —
budget for that in your CI.

```ts
import { createCanvas } from "canvas";
import { writeFileSync } from "node:fs";
import { renderHoarfrost, hashStr } from "better-covers";

const canvas = createCanvas(1200, 630);
const ctx = canvas.getContext("2d");
renderHoarfrost(ctx as unknown as CanvasRenderingContext2D, 1200, 630, hashStr("my-post"));

writeFileSync("my-post.png", canvas.toBuffer("image/png"));
```

The `as unknown as CanvasRenderingContext2D` cast is needed because
`node-canvas`'s types are mostly but not perfectly compatible with the
DOM's `CanvasRenderingContext2D`. In practice every API the renderers
use (gradients, `getImageData`/`putImageData`, paths, fills, strokes,
`globalCompositeOperation`) is supported.

### Caveats

- **`measureText` results differ from browsers** — the ASCII renderer
  draws monospaced glyphs, so this matters less than you'd think, but
  font metrics will not be byte-identical.
- **`ImageData` is the same on disk**, but two-pixel-row antialiased
  edges can disagree between Cairo (Node) and Skia (Chrome) at the
  ±1-bit level. Snapshot tests are runtime-pinned.
- **JetBrains Mono needs to be registered** before drawing the ASCII
  cover; otherwise it falls back to a generic monospace:

  ```ts
  import { registerFont } from "canvas";
  registerFont("./fonts/JetBrainsMono-Regular.ttf", { family: "JetBrains Mono" });
  ```

## 2. `@napi-rs/canvas` (recommended for speed)

[`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas) is a Skia-based
Node binding. It's faster than `node-canvas` and ships prebuilt binaries
for every supported platform, so CI is simpler.

```ts
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync } from "node:fs";
import { renderFlow, hashStr } from "better-covers";

GlobalFonts.registerFromPath("./fonts/JetBrainsMono-Regular.ttf", "JetBrains Mono");

const canvas = createCanvas(1200, 630);
const ctx = canvas.getContext("2d");
renderFlow(ctx as unknown as CanvasRenderingContext2D, 1200, 630, hashStr("slug"));

writeFileSync("out.png", canvas.toBuffer("image/png"));
```

Skia and Chromium share the same rendering engine, so output is closer
to byte-identical with browsers than `node-canvas` is.

## 3. Edge runtimes + `@vercel/og`

[`@vercel/og`](https://vercel.com/docs/og-image-generation) renders React
to PNG via Satori (SVG) and Resvg (WASM). Because it doesn't expose a
2D canvas context, the `<Cover />` React component will not work
directly — Satori does not run the canvas APIs.

The pattern that works on the edge: pre-render the cover canvas in a
build step (with `node-canvas` or `@napi-rs/canvas`) and reference the
resulting PNG from your edge route.

Or, if your phenomenon is expressible in SVG (Penrose, L-system, harmonograph
strokes), port the relevant renderer to emit `<path>` / `<polygon>` and
hand the SVG to Satori directly. We don't ship SVG variants — but PRs
are welcome.

## 4. Build-time generation for static blogs

If you generate covers at build time (Next.js, Astro, Eleventy), the
recommended flow is:

1. Read your post frontmatter (or a list of slugs).
2. For each slug, pick a renderer (round-robin, hash-based, or per-post
   manual assignment).
3. Render to PNG with `@napi-rs/canvas`.
4. Write to `public/og/<slug>.png`.
5. Reference `/og/<slug>.png` from `<meta property="og:image">`.

A reference script:

```ts
// scripts/generate-og.ts
import { createCanvas } from "@napi-rs/canvas";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { hashStr } from "better-covers";
import * as renderers from "better-covers/renderers";

const RENDERER_POOL = [
  renderers.renderHoarfrost,
  renderers.renderKarman,
  renderers.renderFlow,
  renderers.renderTopo,
  renderers.renderClifford,
  renderers.renderStippling,
];

async function generate(slug: string) {
  const seed = hashStr(slug);
  const render = RENDERER_POOL[seed % RENDERER_POOL.length];

  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext("2d");
  render(ctx, 1200, 630, seed);

  await mkdir("public/og", { recursive: true });
  await writeFile(join("public/og", slug + ".png"), canvas.toBuffer("image/png"));
}

// Iterate over your posts here.
```

## Determinism across runtimes

The library guarantees determinism *per runtime*: the same seed, same
renderer, same canvas binding produces the same pixels. It does **not**
guarantee that `node-canvas`, `@napi-rs/canvas`, Chrome, Firefox, and
Safari all produce byte-identical output for the same call — the
underlying graphics backends (Cairo, Skia, Quartz, Direct2D) have small
differences in antialiasing and font rendering.

If byte-identical cross-runtime output matters to you (rare), pin one
runtime in CI and treat it as the source of truth. Snapshot tests in
this repo pin to jsdom + the bundled canvas; if your snapshots disagree
on the same renderer + seed, that's a runtime difference, not a
determinism failure.
