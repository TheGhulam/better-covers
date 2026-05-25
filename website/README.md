# better-covers-site

A risograph-zine front-end for [better-covers](https://github.com/TheGhulam/better-covers) — type a seed, paint a 1200×630 cover, save the PNG.

## Stack

- **Astro 6** (static site, minimal JS)
- **TypeScript** (strict mode)
- 23 deterministic canvas renderers bundled in `src/covers/renderers/`

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
```

## Layout

```
src/
├── pages/index.astro      # the single page
├── styles/main.css        # full design system (Fraunces / EB Garamond / JetBrains Mono)
├── scripts/main.ts        # interactivity (theme, render, dropdown, rails, download)
├── covers/
│   ├── catalog.ts         # 23 covers with metadata
│   ├── shared/index.ts    # hashStr, mulberry32, fbm, addGrain, etc.
│   └── renderers/         # 01-hoarfrost.ts … 23-brians-brain.ts
```

## Notes

- Heavy renderers (Sandpile, Karman, Clifford, Gray-Scott) block for 1–2s. The studio shows a spinner overlay while painting.
- The floating thumbnail rails combine three motion sources: continuous drift, scroll reactivity, mouse-tilt 3D rotation. All gated by `prefers-reduced-motion`.
- Theme persists in `localStorage` under `bc-theme`. First visit honors the OS preference.
- Renderers are pure `(ctx, W, H, SEED) → void` functions — they don't read the clock or call `Math.random`. Determinism comes from FNV-1a hashing the slug then seeding `mulberry32`.

MIT.
