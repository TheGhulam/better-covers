# Changelog

All notable changes to this project will be documented in this file. The
format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- `renderSandpile` — SEED parameter was absent from the function signature,
  producing identical output for every slug. Added four palette families
  (warm ochre, navy, jade, violet) and a SEED-driven grain count (15 000–25 000)
  so different slugs render distinct covers.
- `renderPenrose` — SEED parameter was absent; tiling and colors were identical
  across all slugs. Added four Islamic-tile palette families and a SEED-derived
  rotation of the initial "sun" so each slug shows a different orientation and
  color scheme.
- `renderClifford` — SEED parameter was absent; the attractor always used the
  same `(a,b,c,d)` parameters and sepia ink. Added four curated parameter sets
  with matching paper/ink palettes, selected by SEED.
- `renderKarman` — SEED only controlled particle launch position within a
  narrow 80×24 px window while vortex geometry was fully fixed, making all
  slugs look nearly identical. Row separation now varies with SEED (8–15 % of H)
  so the vortex street is narrower or wider per slug.
- `renderSchlieren` — Plume centre was hardcoded at `W × 0.42`; the dominant
  structural feature (where the heat column rises) never varied. Plume x now
  ranges 30–70 % of W, seeded independently so the vignette follows it.
- `renderHypsometric` — SEED produced only a single phase shift on a pair of
  sine waves, making all slugs show identical terrain scrolled sideways. The
  elevation field is now generated with 5-octave fBm sampled at a SEED-offset
  position, yielding genuinely different continent shapes per slug.

## [0.2.0] - 2026-05-23

### Added

- Eight production renderers curated from the research pass:
  `renderGrayScottMaze`, `renderSpaceColonization`, `renderRisograph`,
  `renderWoodcut`, `renderBarnsleyFern`, `renderBatikCrackle`,
  `renderHypsometric`, `renderBriansBrain`.
- Shared helpers: `addVignette`, `rgb`, `lerp`, `clamp`, `voronoiCell`,
  `toneMapField`.

## [0.1.1] - 2026-05-23

### Removed

- Remotion showreel under `src/showreel/` (author-only demo video, not part
  of the library).

## [0.1.0] - 2026-05-23

### Added

- First public release of the cover library.
- Fifteen deterministic renderers split across single-purpose files under
  `src/renderers/`:
  1. `renderHoarfrost` — inverted DLA
  2. `renderHarmonograph` — damped pendulum drawing
  3. `renderLichtenberg` — η > 1 DLA
  4. `renderSandpile` — Abelian sandpile
  5. `renderKarman` — Lamb–Oseen vortex street
  6. `renderSchlieren` — knife-edge optics
  7. `renderPenrose` — P3 rhomb inflation
  8. `renderLSystem` — bracketed turtle L-system
  9. `renderClifford` — strange-attractor histogram
  10. `renderStippling` — Bridson Poisson-disk
  11. `renderPainterly` — color-field blobs
  12. `renderFlow` — Fidenza-style flow field
  13. `renderTopo` — fBm contour lines
  14. `renderLife` — Conway snapshot
  15. `renderAscii` — brightness-ramp landscape
- `<Cover />` React component and `<Gallery />` demo page.
- `COVERS` catalog with field-notes metadata for every cover.
- Shared utilities: `hashStr`, `mulberry32`, `hash2`, `smoothNoise`, `fbm`,
  `addGrain`, and the `Renderer` type signature.
- `LICENSE` (MIT), `ATTRIBUTIONS.md`, `CONTRIBUTING.md`, `SECURITY.md`.

### Changed

- **Harmonograph attribution corrected**: the previous note credited
  "Goold 1844" for the harmonograph. The 1844 date belongs to Hugh
  Blackburn's V-string pendulum at Glasgow. Joseph Goold's twin elliptic
  pendulum harmonograph is documented in Whitty's *The Harmonograph*
  (1893) and the Goold-Benham-Kerr-Wilberforce volume (1909). The
  catalog and renderer doc comment now read "Blackburn 1844 · Goold 1893."
- Kármán catalog `refs` line expanded to credit Strouhal 1878 and Bénard
  1908 alongside the 1911 stability analysis.
- ASCII catalog `refs` line now credits aalib (1997).

### Removed

- N/A — initial release.

### Security

- N/A — initial release.
