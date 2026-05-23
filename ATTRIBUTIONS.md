# Attributions

This document is the canonical provenance record for every cover, every
algorithm, and every external resource used by `better-covers`. The goal is that
a reader can verify, in one place, that every named person and every borrowed
technique is properly credited.

## Algorithm sources

### 01 · Hoarfrost — Diffusion-limited aggregation

- **T. A. Witten Jr. & L. M. Sander**, *Diffusion-Limited Aggregation, a
  Kinetic Critical Phenomenon*, Physical Review Letters **47**, 1400–1403
  (1981). [doi:10.1103/PhysRevLett.47.1400](https://doi.org/10.1103/PhysRevLett.47.1400)
- **T. A. Witten & L. M. Sander**, *Diffusion-limited aggregation*,
  Physical Review B **27**, 5686–5697 (1983).
- The 2D DLA fractal dimension ≈ 1.71 — see Davidovich & Procaccia,
  *Conformal Theory of the Dimensions of Diffusion Limited Aggregates*,
  Phys. Rev. Lett. **84**, 4944 (2000), and many simulation studies since.

### 02 · Harmonograph — pendulum drawing machine

- **Hugh Blackburn** (1844), V-string pendulum at the University of Glasgow.
  This is the primary 1844 reference; the earlier project description
  attributed "Goold 1844" appears to conflate Blackburn's pendulum with
  Joseph Goold's later contribution, which is corrected here.
- **Joseph Goold of Nottingham**, twin elliptic pendulum harmonograph, in
  H. Irvine Whitty, *The Harmonograph. Illustrated by Designs Actually
  Drawn by the Machine* (Jerrold & Sons, London, 1893).
- **J. Goold, C. E. Benham, R. Kerr & L. R. Wilberforce**, *Harmonic
  Vibrations and Vibration Figures* (Newton & Co., London, 1909) — the
  fullest published account of the technique.
- The harmonograph as a category was already attested in the 1870s with
  A. E. Donkin and Samuel Charles Tisley.

### 03 · Lichtenberg figures — dielectric breakdown

- **Georg Christoph Lichtenberg**, *Super nova methodo motum ac naturam
  fluidi electrici investigandi*, Novi Commentarii Societatis Regiae
  Scientiarum Gottingensis VII (Göttingen, 1777).
- **L. Niemeyer, L. Pietronero & H. J. Wiesmann**, *Fractal Dimension of
  Dielectric Breakdown*, Phys. Rev. Lett. **52**, 1033–1036 (1984) — the
  η > 1 generalization of DLA that the renderer's sticky-tip rule
  approximates.

### 04 · Abelian sandpile — self-organized criticality

- **P. Bak, C. Tang & K. Wiesenfeld**, *Self-organized criticality: An
  explanation of 1/f noise*, Phys. Rev. Lett. **59**, 381–384 (1987).
  [doi:10.1103/PhysRevLett.59.381](https://doi.org/10.1103/PhysRevLett.59.381)
- **D. Dhar**, *Self-organized critical state of sandpile automaton models*,
  Phys. Rev. Lett. **64**, 1613 (1990) — the Abelian property.
- Continuum-limit work: Levine & Pegden 2009; Pegden & Smart 2013; ongoing.

### 05 · Kármán vortex street

- **V. Strouhal**, *Über eine besondere Art der Tonerregung*, Annalen der
  Physik **241**, 216–251 (1878) — the dimensionless frequency.
- **H. Bénard**, *Formation de centres de giration à l'arrière d'un obstacle
  en mouvement*, Comptes Rendus Acad. Sci. **147**, 839–842 (1908) — the
  first experimental observation. French sources often use "Bénard–Kármán."
- **Th. von Kármán**, *Über den Mechanismus des Widerstandes, den ein
  bewegter Körper in einer Flüssigkeit erfährt*, Göttinger Nachrichten
  (1911 & 1912) — the stability analysis.
- **H. Lamb**, *Hydrodynamics*, 6th ed. (Cambridge, 1932), §334 — the
  Lamb–Oseen vortex regularization used by the renderer's `vel(x,y)`
  function.

### 06 · Schlieren / shadowgraph

- **A. Toepler**, *Beobachtungen nach einer neuen optischen Methode* (Cohen
  & Sohn, Bonn, 1864). Also: *Optische Studien nach der Methode der
  Schlierenbeobachtung*, Poggendorfer Annalen CXXXI (1867).
- **R. Hooke** in 1665 noticed the effect informally with two candles;
  **J. B. L. Foucault**'s 1859 knife-edge test for telescope mirrors used
  the same geometry. Toepler is credited with applying it to fluid flow
  and naming it.
- **H. Schardin**, *Das Toeplersche Schlierenverfahren*, VDI-Forschungsheft
  **367** (VDI-Verlag, Berlin, 1942) — modern variants.
- **G. S. Settles**, *Schlieren and Shadowgraph Techniques* (Springer,
  2001) — current reference.

### 07 · Penrose P3 tiling

- **R. Penrose**, *The role of aesthetics in pure and applied mathematical
  research*, Bulletin of the Institute of Mathematics and its Applications
  **10**, 266–271 (1974).
- **N. G. de Bruijn**, *Algebraic theory of Penrose's non-periodic
  tilings*, Indagationes Mathematicae **84**, 39–66 (1981) — the
  cut-and-project construction.
- **R. Ammann** independently discovered the P3 rhomb set around 1976.
- **P. J. Lu & P. J. Steinhardt**, *Decagonal and Quasi-Crystalline
  Tilings in Medieval Islamic Architecture*, Science **315**, 1106–1110
  (2007) — the Darb-i Imam palette.

### 08 · L-system plants

- **A. Lindenmayer**, *Mathematical models for cellular interaction in
  development, I and II*, Journal of Theoretical Biology **18**, 280–315
  (1968).
- **P. Prusinkiewicz & A. Lindenmayer**, *The Algorithmic Beauty of Plants*
  (Springer, 1990). The production `F → F[+F]F[−F]F` at 25.7° is from
  Chapter 1, §1.6.

### 09 · Clifford attractor — strange attractor

- **C. A. Pickover**, *Computers, Pattern, Chaos and Beauty* (St. Martin's
  Press, New York, 1990) — the original published source for the
  four-parameter sine-cosine iterated map used here.
- **A. K. Dewdney** popularized **Peter de Jong**'s closely related
  attractor in *Computer Recreations: Probing the strange attractions of
  chaos*, Scientific American **256**:7 (July 1987). The de Jong attractor
  is the historical sibling; the Clifford attractor is the one
  implemented here.

### 10 · Poisson-disk stippling

- **R. Bridson**, *Fast Poisson disk sampling in arbitrary dimensions*,
  ACM SIGGRAPH 2007 Sketches, Article 22.
  [doi:10.1145/1278780.1278807](https://doi.org/10.1145/1278780.1278807)
- **D. P. Mitchell**, *Generating antialiased images at low sampling
  densities*, ACM SIGGRAPH Computer Graphics **21**:4, 65–72 (1987) —
  origin of importance-modulated sample density.

### 11 · Painterly atmosphere — color-field

This renderer references the color-field painting tradition broadly. No
specific work is reproduced; the palettes and composition draw on:

- **Mark Rothko**, *Black on Maroon* (1958–59) and the Seagram Murals —
  the warm-on-warm temperature relationships.
- **Helen Frankenthaler**, *Mountains and Sea* (1952) — the soft,
  soaked-in blob edges.

The palettes ("Dusk", "Earth", "Ember") and composition geometry are
original to this project.

### 12 · Flow field — Fidenza family

The flow-field-of-particles technique long predates 2021. Notable prior
work includes Kerry Mitchell, Robert Hodgin, Anders Hoff (inconvergent),
Jared Tarbell, and many others.

- **T. Hobbs**, *Fidenza* (Art Blocks Curated, 11 June 2021),
  <https://www.artblocks.io/collection/fidenza-by-tyler-hobbs>.
- **T. Hobbs**, *Flow fields* (essay),
  <https://www.tylerxhobbs.com/words/flow-fields>.

This renderer is **not** a reproduction of *Fidenza*. It implements the
underlying flow-field technique in a deliberately minimal form (no
non-colliding curved rectangles, no per-particle width ladder, one palette
family). Hobbs's specific *Fidenza* algorithm and its outputs are his work;
those are not copied here.

### 13 · Topographic contours

- The "warm-ochre ink on charcoal" convention is **USGS US Topo** map
  styling. See <https://www.usgs.gov/programs/national-geospatial-program/us-topo>.
- **W. E. Lorensen & H. E. Cline**, *Marching cubes: A high-resolution 3D
  surface construction algorithm*, ACM SIGGRAPH **21**:4, 163–169 (1987) —
  the 2D "marching squares" degenerate case is what the renderer's
  threshold-crossing test implicitly computes.

### 14 · Conway's Game of Life

- **M. Gardner**, *Mathematical Games: The fantastic combinations of John
  Conway's new solitaire game "life"*, Scientific American **223**:4,
  120–123 (October 1970) — the public-record first publication. Devised by
  **John Horton Conway** earlier that year.
- The B3/S23 rule notation: born on exactly 3 neighbors, survives on 2 or
  3 neighbors.

### 15 · ASCII landscape

- The ASCII / typewriter / line-printer art tradition predates computers.
- **aalib** (1997, Jan Hubicka & contributors) is the canonical libre
  brightness-ramp ASCII renderer; while not directly used, it informs the
  γ-correction approach.
- The procedural landscape (sun, hills, reflection pillar, tree cluster)
  is project-original.

## Shared utilities

### `hashStr` — FNV-1a string hash

- **G. Fowler, L. C. Noll, K.-P. Vo**, *FNV non-cryptographic hash*
  (1991). Public domain.

### `mulberry32` — PRNG

- **T. Ettinger**, *Mulberry32* gist (2017),
  <https://gist.github.com/tommyettinger/46a3c5a8a2c4afda6f9fd2d6e3c5b78d>.
  Public domain.

### `smoothNoise` + `fbm` — value-noise lattice

- The lattice-noise-with-smoothstep-interpolation construction follows
  **K. Perlin**'s noise tradition; the specific value-noise variant (as
  opposed to gradient noise) is standard in the demoscene.
- **B. Mandelbrot & J. W. Van Ness**, *Fractional Brownian motions,
  fractional noises and applications*, SIAM Review **10**:4, 422–437
  (1968) — the fBm summation.

## Fonts

The demo Gallery loads three Google Fonts via `@import`:

- **Source Serif 4** — Frank Grießhammer, OFL 1.1.
- **Geist** — Vercel, OFL 1.1.
- **JetBrains Mono** — JetBrains, OFL 1.1.

A fourth, **Shantell Sans** (OFL 1.1), is loaded only by the optional
showreel composition.

All four are SIL Open Font License 1.1 and may be redistributed freely.

## Excluded resources

- **`yep-by-fgb.mp3`** — referenced by the optional Remotion showreel,
  **not included** in this repository. We were unable to identify the
  original artist with sufficient confidence to redistribute it. See
  `src/showreel/README.md` for guidance on supplying your own audio.

## Reporting an attribution issue

If you believe a name is missing, misattributed, or that we have improperly
used the name of an artwork or person, please open an issue tagged
`attribution`. We will respond promptly and either correct the record or
remove the use.
