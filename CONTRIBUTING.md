# Contributing to better-covers

Thanks for thinking about contributing. This project values a small,
well-curated collection over a large unfocused one, so we'd rather have
fewer, more carefully made covers than many. Please open an issue before
opening a PR for new work.

## Getting set up

```bash
git clone https://github.com/TheGhulam/better-covers
cd better-covers
npm install
npm run dev        # local demo gallery
npm test           # determinism + visual snapshot tests
npm run lint
npm run typecheck
```

## What kinds of contributions are welcome

**Yes, please:**

- Bug fixes — particularly determinism regressions (a renderer producing
  different pixels for the same seed across runs is a bug).
- Performance work — without changing the visual output.
- Better documentation, especially primary-source citations we missed.
- Server-rendering recipes (Satori, Takumi, `node-canvas`, `@vercel/og`).
- Accessibility / SSR improvements on the React side.
- New tests, especially snapshot tests at production size.

**Maybe — open an issue first:**

- A new cover renderer. Read the "Adding a new renderer" section below
  before starting. The collection sits at fifteen for a reason; we are
  more likely to swap an existing one than to grow.
- New skins / palettes on an existing renderer.

**No, sorry:**

- Direct reproductions of named artworks. You may *implement* the
  technique a known artwork uses; you may not produce a renderer whose
  output is meant to be mistaken for that artwork.
- AI-generated assets or models in the rendering pipeline. The project's
  one-line description is "no AI, no API calls, just math and your slug"
  and that's a hard line.
- Network calls or telemetry of any kind.

## Adding a new renderer

Open an issue first describing:

1. The phenomenon, algorithm, or artistic tradition the cover comes from.
2. The primary source (paper, book, dated publication) you'll cite.
3. A rough sketch or hand-drawn mockup of what the result should look
   like at 1200 × 630.
4. Why it earns a spot — what part of the visual space the existing
   fifteen don't cover.

Once accepted, your renderer must:

- Live in `src/renderers/NN-name.ts`, with a single default-exported
  `Renderer` and a doc comment at the top of the file that includes:
  - A one-sentence summary
  - A description of the algorithm
  - At least one primary-source citation (year, DOI / ISBN / URL)
- Be deterministic: same `(W, H, SEED)` → same pixels, every time. No
  `Math.random`, no clocks, no network.
- Render in under one second at 1200 × 630 on a modern laptop CPU. The
  sandpile (currently slowest at ~1.1 s) is the upper bound; anything
  slower must justify itself.
- Have a test in `tests/renderers/NN-name.test.ts` that hashes the output
  pixel buffer for three different seeds and snapshots the result.
- Be added to:
  - `src/renderers/index.ts` (barrel export)
  - `src/index.ts` (public barrel)
  - `src/covers.tsx` (catalog entry with body text and references)
  - `README.md` (the table)
  - `ATTRIBUTIONS.md` (a new section)
  - `CHANGELOG.md`

## Determinism is the contract

The single most important property of this library is that
`renderFoo(ctx, W, H, hashStr("my-slug"))` produces the same pixels every
time, in any runtime, today and in five years.

Things that break determinism:

- `Math.random()` — use `mulberry32(SEED)` instead
- `Date.now()`, `performance.now()` — never read the clock
- `requestAnimationFrame` — render in a single synchronous pass
- Reading from `localStorage`, `IndexedDB`, the network
- `Object.keys(map)` on an insertion-order-dependent path (Map iteration
  order is deterministic; spread of object keys is technically too in
  modern JS, but be explicit about ordering)
- Floating-point operations whose ordering depends on `Array.sort` of
  objects with equal keys — sort by a stable secondary key

Things that are fine:

- All four `Math.sin / cos / pow / exp / sqrt` (IEEE 754 deterministic)
- Reading the same canvas back via `getImageData`
- `OffscreenCanvas` where available

## Attribution style

In the doc comment of each renderer, the references section uses this
format:

```ts
/**
 * NN · Cover name — one-line description
 *
 * Paragraph describing the algorithm.
 *
 * References
 * - Author Name, "Paper title," Journal vol., pages (year).
 *   <https://doi.org/...>
 * - Author Name, *Book title* (Publisher, year), §1.6.
 */
```

Prefer DOI links over publisher links over Wikipedia. For named artworks
or NFTs, link to the artist's own site over a marketplace listing. Use
italics for book and artwork titles, quotes for paper titles.

When you're crediting a technique invented by someone famous but commonly
attributed to a later popularizer (e.g. de Jong's attractor vs. Pickover's
attractor), cite *both* and note the relationship.

## Testing

```bash
npm test             # run all tests
npm test -- --watch  # watch mode
npm run test:visual  # snapshot regen — only run after deliberate visual changes
```

Snapshot tests fix the pixel output of every renderer for a small set of
canonical seeds. If your PR changes a snapshot, the reviewer will ask why;
"intentional, here's the new look" is fine, "I don't know why this
changed" is a blocker.

## Code style

- TypeScript, strict mode (`tsconfig.json` already configures this).
- Prettier-formatted (run `npm run format`).
- ESLint rules in `.eslintrc.cjs`.
- 2-space indent, double-quoted strings.
- Comments are written for the reader who's looking at the code six months
  from now; no one-liners that just restate the code.

## Pull-request checklist

- [ ] Issue opened first (for non-trivial changes)
- [ ] `npm test`, `npm run lint`, `npm run typecheck` all pass
- [ ] New code is covered by tests
- [ ] Determinism: ran the renderer twice with the same seed and got
      identical buffers
- [ ] Citations in the doc comment, attribution section, and catalog
- [ ] Updated `CHANGELOG.md`
- [ ] If visual output changed, the snapshot diff is included in the PR
      description with a short note on why

## Questions

Open a discussion thread — they're better than DMs for things future
contributors will also need to know.
