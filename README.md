<div align="center">

# better-covers

Programmatic 1200 × 630 OG-image covers. Deterministic canvas renderers from physics, generative art, and cartographic tradition. No AI & no API calls.

[![npm version](https://img.shields.io/npm/v/better-covers.svg)](https://www.npmjs.com/package/better-covers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/TheGhulam/better-covers/actions/workflows/ci.yml/badge.svg)](https://github.com/TheGhulam/better-covers/actions/workflows/ci.yml)

</div>

Every renderer is a pure `(ctx, W, H, SEED) → void` function painting onto a 1200 × 630 canvas — the standard OG image size. The same slug always paints the same pixels. No clocks, no `Math.random`, no network. Drop the result into Next.js, Vite, CRA, or any other React app, or call the renderer directly from a Satori or node-canvas pipeline at build time.

## Install

```bash
npm install better-covers
```

Peer dependency: `react@>=18`.

## Quick start

```tsx
import { Cover, renderHoarfrost } from "better-covers";

export function Post() {
  return (
    <Cover
      render={renderHoarfrost}
      seed="my-post-slug"
      title="A piece on cold weather"
      subtitle="DLA descending from a top seed line"
    />
  );
}
```

Or call a renderer directly:

```ts
import { renderClifford, hashStr } from "better-covers";

const canvas = document.createElement("canvas");
canvas.width = 1200;
canvas.height = 630;
const ctx = canvas.getContext("2d")!;
renderClifford(ctx, 1200, 630, hashStr("any-string"));
```

The full demo gallery is available as a React component:

```tsx
import { Gallery } from "better-covers";

export default function GalleryPage() {
  return <Gallery />;
}
```

## Covers

| #   | Preview                                                                                       | Slug                   | Phenomenon                                      | Reference                                            |
| --- | --------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| 01  | <img src="docs/thumbnails/dla-hoarfrost.png" width="180" alt="Hoarfrost cover">               | `dla-hoarfrost`        | Diffusion-limited aggregation (inverted)        | Witten & Sander 1981                                 |
| 02  | <img src="docs/thumbnails/harmonograph.png" width="180" alt="Harmonograph cover">             | `harmonograph`         | Damped-pendulum drawing machine                 | Blackburn 1844 · Goold (Whitty 1893)                 |
| 03  | <img src="docs/thumbnails/lichtenberg.png" width="180" alt="Lichtenberg cover">               | `lichtenberg`          | Dielectric breakdown (tip-biased DLA heuristic) | Lichtenberg 1778 · Niemeyer–Pietronero–Wiesmann 1984 |
| 04  | <img src="docs/thumbnails/sandpile.png" width="180" alt="Sandpile cover">                     | `sandpile`             | Abelian sandpile                                | Bak–Tang–Wiesenfeld 1987 · Dhar 1990                 |
| 05  | <img src="docs/thumbnails/karman.png" width="180" alt="Kármán cover">                         | `karman`               | Kármán vortex street                            | Strouhal 1878 · Bénard 1908 · von Kármán 1911        |
| 06  | <img src="docs/thumbnails/schlieren.png" width="180" alt="Schlieren cover">                   | `schlieren`            | Toepler schlieren (knife-edge)                  | Toepler 1864 · Schardin 1934                         |
| 07  | <img src="docs/thumbnails/penrose.png" width="180" alt="Penrose cover">                       | `penrose`              | P3 rhomb tiling                                 | Penrose 1974 · de Bruijn 1981                        |
| 08  | <img src="docs/thumbnails/lsystem.png" width="180" alt="L-system cover">                      | `lsystem`              | L-system plants                                 | Lindenmayer 1968 · Prusinkiewicz 1990                |
| 09  | <img src="docs/thumbnails/clifford.png" width="180" alt="Clifford cover">                     | `clifford`             | Strange attractor                               | Pickover 1990 (cf. de Jong 1987)                     |
| 10  | <img src="docs/thumbnails/stippling.png" width="180" alt="Stippling cover">                   | `stippling`            | Poisson-disk blue noise                         | Bridson 2007 · Mitchell 1987                         |
| 11  | <img src="docs/thumbnails/painterly-atmosphere.png" width="180" alt="Atmosphere cover">       | `painterly-atmosphere` | Color-field painting                            | Rothko, Frankenthaler (inspiration)                  |
| 12  | <img src="docs/thumbnails/flow-fidenza.png" width="180" alt="Flow field cover">               | `flow-fidenza`         | Flow-field strokes                              | Hobbs 2021 (technique only)                          |
| 13  | <img src="docs/thumbnails/topo-contour.png" width="180" alt="Topographic cover">              | `topo-contour`         | Topographic iso-lines                           | USGS contour ink · iso-line banding                  |
| 14  | <img src="docs/thumbnails/life-conway.png" width="180" alt="Game of Life cover">              | `life-conway`          | Conway's Game of Life                           | Conway / Gardner 1970                                |
| 15  | <img src="docs/thumbnails/ascii-landscape.png" width="180" alt="ASCII landscape cover">       | `ascii-landscape`      | ASCII brightness-ramp landscape                 | ASCII art tradition · aalib 1997 · Bourke 1997       |
| 16  | <img src="docs/thumbnails/gray-scott-maze.png" width="180" alt="Gray-Scott Maze cover">       | `gray-scott-maze`      | Gray-Scott reaction-diffusion (maze)            | Pearson 1993                                         |
| 17  | <img src="docs/thumbnails/space-colonization.png" width="180" alt="Space colonization cover"> | `space-colonization`   | Space colonization tree growth                  | Runions et al. 2007                                  |
| 18  | <img src="docs/thumbnails/risograph.png" width="180" alt="Risograph cover">                   | `risograph`            | Risograph misregistration                       | Riso Kagaku 1980s                                    |
| 19  | <img src="docs/thumbnails/woodcut-hatch.png" width="180" alt="Woodcut cover">                 | `woodcut-hatch`        | Woodcut crosshatching                           | Dürer technique (inspiration)                        |
| 20  | <img src="docs/thumbnails/barnsley-fern.png" width="180" alt="Barnsley Fern cover">           | `barnsley-fern`        | Barnsley fern IFS attractor                     | Barnsley 1988                                        |
| 21  | <img src="docs/thumbnails/batik-crackle.png" width="180" alt="Batik Crackle cover">           | `batik-crackle`        | Batik wax-resist crackle                        | Indonesian batik tradition                           |
| 22  | <img src="docs/thumbnails/hypsometric.png" width="180" alt="Hypsometric Tint cover">          | `hypsometric`          | Hypsometric elevation color bands               | NOAA/GEBCO symbology                                 |
| 23  | <img src="docs/thumbnails/brians-brain.png" width="180" alt="Brian's Brain cover">            | `brians-brain`         | Brian's Brain 3-state CA                        | Callahan 1996                                        |
| 24  | <img src="docs/thumbnails/julia-dragon.png" width="180" alt="Julia set cover">                | `julia-dragon`         | Julia set (escape-time fractal)                 | Douady & Hubbard 1984                                |

Full primary-source citations available in [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) and inside the doc comments of each renderer. Research prototypes and the curated HTML gallery in [`research/`](research/) and [`examples/research-gallery/`](examples/research-gallery/).

## Determinism

Every renderer is deterministic in `(W, H, SEED)`. Don't use `Math.random`, `Date.now()`, `performance.now()` or `requestAnimationFrame`, instead use `mulberry32(seed)` or `hash2(x, y, seed)` from `better-covers/shared`. Renders at different canvas sizes may differ, but the shape and the seed preserve identity; the Clifford attractor's parameters don't change with `W`.

That makes the covers usable at build time and from edge runtimes: serialize a slug, get back the same image every time.

## Browser and runtime support

The renderers work anywhere the 2D canvas API is available, i.e. Chromium, Firefox, Safari, Edge. On the server, pair them with [`node-canvas`](https://github.com/Automattic/node-canvas) or [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas). The ASCII renderer needs `document.createElement('canvas')`, which `node-canvas` does not polyfill out of the box; see [`docs/server-rendering.md`](docs/server-rendering.md) for the workaround. On edge runtimes like Cloudflare Workers or Vercel Edge, pair the individual renderers with [`@vercel/og`](https://vercel.com/docs/og-image-generation) and an `OffscreenCanvas` polyfill as the `<Cover />` React tree itself won't run on the edge.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow. In short: open an issue before adding a new cover, every renderer needs a primary-source citation in its doc comment, and no verbatim copies of named artworks, i.e. you may implement a flow field, you may not reproduce a specific Fidenza output.

## License

MIT, go crazy

## Acknowledgments

The collection is dedicated to the people who looked carefully at one ordinary thing — frost on a window, a wake behind a stone, the way a pendulum loses energy — and described it precisely enough that the rest of us could draw it.
