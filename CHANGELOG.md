# Changelog

All notable changes to this project will be documented in this file. The
format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
