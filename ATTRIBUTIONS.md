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
  [doi:10.1103/PhysRevB.27.5686](https://doi.org/10.1103/PhysRevB.27.5686)
- The 2D DLA fractal dimension ≈ **1.71** is the numerical consensus in
  simulation literature (Witten & Sander originally reported ~1.7 in 1981).
  Conformal-theory bounds: **B. Davidovich & I. Procaccia**, *Conformal
  theory of the dimensions of diffusion-limited aggregates*, Europhysics
  Letters **48**, 547 (1999).
  [doi:10.1209/epl/i1999-00518-y](https://doi.org/10.1209/epl/i1999-00518-y)
  (theory gives D₀ ≈ 1.69 ± 0.03, consistent with the numerical value).
- The renderer is **stylized lattice DLA** (inverted top-edge seed, periodic
  horizontal wrapping, per-column fBm depth caps) — not a faithful reproduction
  of the canonical Witten–Sander model.

### 02 · Harmonograph — pendulum drawing machine

- **Hugh Blackburn** (~1844), Y/V-string pendulum while a **Cambridge**
  student; later associated with his Glasgow professorship (from **1849**).
  He **reinvented** the Y-suspended pendulum in print around this date; James
  **Dean** and Nathaniel **Bowditch** (1815) described the same geometry
  earlier. The earlier project description attributed "Goold 1844" appears to
  conflate Blackburn's pendulum with Joseph Goold's later contribution, which
  is corrected here.
- **Joseph Goold of Nottingham**, twin elliptic pendulum harmonograph, in
  H. Irvine Whitty, *The Harmonograph. Illustrated by Designs Actually
  Drawn by the Machine* (Jerrold & Sons, London, 1893).
- **J. Goold, C. E. Benham, R. Kerr & L. R. Wilberforce**, *Harmonic
  Vibrations and Vibration Figures* (Newton & Co., London, 1909) — the
  fullest published account of the technique.
- The harmonograph as a category was already attested in the 1870s with
  **A. E. Donkin**, **Samuel Charles Tisley**, and **Tisley & Spiller** (1873).

### 03 · Lichtenberg figures — dielectric breakdown

- **Georg Christoph Lichtenberg**, *De nova methodo naturam ac motum fluidi
  electrici investigandi* (Commentatio prior), Novi Commentarii Societatis
  Regiae Scientiarum Gottingensis **VIII** (Göttingen, **1778**), 168–180.
- **L. Niemeyer, L. Pietronero & H. J. Wiesmann**, *Fractal Dimension of
  Dielectric Breakdown*, Phys. Rev. Lett. **52**, 1033–1036 (1984).
  [doi:10.1103/PhysRevLett.52.1033](https://doi.org/10.1103/PhysRevLett.52.1033)
  — the η > 1 dielectric-breakdown model family. The renderer uses a
  **tip-biased DLA heuristic** (random walkers + neighbor-count stickiness)
  inspired by that regime; it does not solve the Laplacian DBM. The underlying
  walker mechanism is the same family as cover 01 (Witten & Sander).

### 04 · Abelian sandpile — self-organized criticality

- **P. Bak, C. Tang & K. Wiesenfeld**, *Self-organized criticality: An
  explanation of 1/f noise*, Phys. Rev. Lett. **59**, 381–384 (1987).
  [doi:10.1103/PhysRevLett.59.381](https://doi.org/10.1103/PhysRevLett.59.381)
- **D. Dhar**, *Self-organized critical state of sandpile automaton models*,
  Phys. Rev. Lett. **64**, 1613–1616 (1990).
  [doi:10.1103/PhysRevLett.64.1613](https://doi.org/10.1103/PhysRevLett.64.1613)
  — the Abelian property.
- **W. Pegden & C. K. Smart**, *Convergence of the abelian sandpile*, Duke
  Math. J. **162**(4), 627–642 (2013).
  [doi:10.1215/00127094-2079677](https://doi.org/10.1215/00127094-2079677)
  — continuum limit of centrally seeded sandpiles. Fractal fine structure:
  **L. Levine, W. Pegden & C. K. Smart**, *Apollonian structure in the
  Abelian sandpile*, Geom. Funct. Anal. **26**(1), 306–336 (2016).

### 05 · Kármán vortex street

- **V. Strouhal**, *Über eine besondere Art der Tonerregung*, Annalen der
  Physik **241**, 216–251 (1878) — the dimensionless frequency.
- **H. Bénard**, *Formation périodique de centres de giration à l'arrière
  d'un obstacle en mouvement*, Comptes Rendus Acad. Sci. **147**, 839–842
  (1908) — the first experimental observation. French sources often use
  "Bénard–Kármán."
- **Th. von Kármán**, *Über den Mechanismus des Widerstandes, den ein
  bewegter Körper in einer Flüssigkeit erfährt*, Göttinger Nachrichten
  (1911 & 1912) — the stability analysis.
- **H. Lamb**, *Hydrodynamics*, 6th ed. (Cambridge, 1932), **§334-a** — the
  Lamb–Oseen vortex regularization used by the renderer's `vel(x,y)`
  function.

### 06 · Schlieren (Toepler knife-edge)

- **A. Toepler**, *Beobachtungen nach einer neuen optischen Methode* (Max
  Cohen & Sohn, Bonn, 1864). Also: *Optische Studien nach der Methode der
  Schlierenbeobachtung*, Poggendorff's Annalen **CXXXI** (1867).
- **R. Hooke**, *Micrographia* (1665), Observation LVIII — early notice of
  thermal refraction in air; **J. B. L. Foucault**'s 1859 knife-edge test for
  telescope mirrors used the same geometry. Toepler applied it to fluid flow
  and named the method in 1864.
- **H. Schardin**, *Das Toeplersche Schlierenverfahren*, VDI-Forschungsheft
  **367** (VDI-Verlag, Berlin, **1934**). Also: *Die Schlierenverfahren und
  ihre Anwendungen*, Ergebnisse der exakten Naturwissenschaften **20**,
  303–439 (Springer, 1942).
- **G. S. Settles**, *Schlieren and Shadowgraph Techniques* (Springer,
  2001) — current reference. This renderer implements **Toepler schlieren**
  (first-derivative visualization), not shadowgraph (∇²ρ).

### 07 · Penrose P3 tiling

- **R. Penrose**, *The role of aesthetics in pure and applied mathematical
  research*, Bulletin of the Institute of Mathematics and its Applications
  **10**, 266–271 (1974) — origin of Penrose tilings (P1 in this paper; P3
  rhombs came later).
- **N. G. de Bruijn**, *Algebraic theory of Penrose's non-periodic
  tilings*, Indagationes Mathematicae **84**, 39–66 (1981) — the
  cut-and-project formulation (related theory; the renderer uses Robinson-
  triangle inflation).
- **R. Ammann** independently discovered the P3 rhomb set around 1976.
- **P. J. Lu & P. J. Steinhardt**, *Decagonal and Quasi-Crystalline
  Tilings in Medieval Islamic Architecture*, Science **315**, 1106–1110
  (2007) — quasi-crystalline **geometry** at the Darb-i Imam shrine
  (Isfahan). The renderer's hex colors are an Islamic-tile-inspired palette,
  not colors recovered from that paper.

### 08 · L-system plants

- **A. Lindenmayer**, *Mathematical models for cellular interaction in
  development, I and II*, Journal of Theoretical Biology **18**, 280–315
  (1968) — origin of L-systems (not this bracketed turtle rule).
- **P. Prusinkiewicz & A. Lindenmayer**, *The Algorithmic Beauty of Plants*
  (Springer, 1990). The production `F → F[+F]F[−F]F` at 25.7° is from
  Chapter 1, **§1.6.3**, Figure 1.24(c) (the renderer uses 4 derivation
  steps; the figure uses n = 5).

### 09 · Clifford attractor — strange attractor

- **C. A. Pickover**, *Computers, Pattern, Chaos and Beauty* (St. Martin's
  Press, New York, 1990) — published source for **Pickover's Clifford
  (addition-form)** sine-cosine map implemented here. Also commonly cited:
  *Chaos in Wonderland* (1994).
- **A. K. Dewdney** popularized **Peter de Jong**'s closely related
  attractor in *Computer Recreations: Probing the strange attractions of
  chaos*, Scientific American **257**:1, 108–111 (July 1987). de Jong's
  four-parameter sin–cos map (subtraction form) predates Pickover's variant;
  the Clifford attractor is the one implemented here.

### 10 · Poisson-disk stippling

- **R. Bridson**, *Fast Poisson disk sampling in arbitrary dimensions*,
  ACM SIGGRAPH 2007 Sketches, Article 22.
  [doi:10.1145/1278780.1278807](https://doi.org/10.1145/1278780.1278807)
  — core active-list algorithm, extended here with a variable minimum-distance
  radius driven by a handcrafted density field.
- **D. P. Mitchell**, *Generating antialiased images at low sampling
  densities*, ACM SIGGRAPH Computer Graphics **21**:4, 65–72 (1987) —
  conceptual precedent for **region-varying sample density** (not a direct
  implementation of Mitchell's antialiasing pipeline).

### 11 · Painterly atmosphere — color-field

This renderer references the color-field painting tradition broadly. No
specific work is reproduced; the palettes and composition draw on:

- **Mark Rothko**, *Black on Maroon* (1958–59) and the Seagram Murals —
  tonal layering and warm/cool temperature relationships at the movement
  level (not palette fidelity to any single canvas).
- **Helen Frankenthaler**, *Mountains and Sea* (1952) — the soft,
  soaked-in blob edges.

The palettes ("Dusk", "Earth", "Ember") and composition geometry are
original to this project.

### 12 · Flow field — Fidenza family

The flow-field-of-particles technique long predates 2021. Notable prior
work includes Kerry Mitchell (*Modeling Vortical Flows* and related
algorithmic work), Robert Hodgin, Anders Hoff (inconvergent), Jared
Tarbell, and many others.

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

- Contour line color follows **USGS US Topo** elevation symbology
  (brown/ochre index and intermediate contours). See
  <https://www.usgs.gov/ngp-standards-and-specifications/us-topo-cartographic-specifications-elevation>.
  The **charcoal background** is stylized cover art, not US Topo cartography.
- **W. E. Lorensen & H. E. Cline**, *Marching cubes: A high resolution 3D
  surface construction algorithm*, ACM SIGGRAPH **21**:4, 163–169 (1987).
  [doi:10.1145/37402.37422](https://doi.org/10.1145/37402.37422)
  — iso-surface extraction lineage. This renderer draws iso-lines via
  **scalar-field banding** at 14 thresholds, not marching squares.

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
  brightness-ramp ASCII renderer; while not directly used, it established
  gamma/brightness/contrast tuning for ASCII rendering. This renderer uses
  γ = 0.55 as **project tuning** (aalib's default is 1.0).
- **P. Bourke**, *Character representation of grey scale images* (1997) —
  fixed brightness-ramp block sampling, closer to this renderer's technique
  than aalib's font-table approach.
- The procedural landscape (sun, hills, reflection pillar, tree cluster)
  is project-original.

### 16 · Gray-Scott reaction-diffusion (maze)

- **J. E. Pearson**, *Complex Patterns in a Simple System*, Science **261**,
  189–192 (1993).
  [doi:10.1126/science.261.5118.189](https://doi.org/10.1126/science.261.5118.189)
- **J. C. Gray & P. Scott**, autocatalytic model (1984).
- The renderer uses Pearson's labyrinth (maze) regime on a coarse grid;
  ochre channels on dark void, stylized.

### 17 · Space colonization

- **A. Runions, B. Lane & P. Prusinkiewicz**, *Modeling Trees with a Space
  Colonization Algorithm*, Eurographics Workshop on Natural Phenomena (2007).
- Simplified 2D branch growth; sage/ochre palette stylized.

### 18 · Risograph

- **Riso Kagaku** duplicator process (1980s).
- **J. Hug**, *Risomania: The New Spirit of Printing* (Niggli, 2018).
- Misregistered red/blue master layers; warm paper stock stylized.

### 19 · Woodcut hatch

- **Albrecht Dürer** woodcut crosshatching technique — technique only, not
  a reproduction of any specific print.
- **W. M. Ivins Jr.**, *How Prints Look* (Metropolitan Museum of Art, 1943).
- Ivory paper + warm black ink palette stylized.

### 20 · Barnsley fern

- **M. Barnsley**, *Fractals Everywhere* (Academic Press, 1988).
- Classic four-map IFS with standard probabilities; 50 000-point density
  histogram, stylized green tonemapping.

### 21 · Batik crackle

- Indonesian **batik** wax-resist dyeing tradition — crackle texture only,
  not a reproduction of any sacred motif or named pattern.
- Synthetic crackle field from summed sinusoids with seed phase offsets.

### 22 · Hypsometric tint

- **NOAA/GEBCO** bathymetric and hypsometric color-band symbology — stylized
  elevation bands, not a reproduction of any specific chart.
- Seven discrete bands from deep water to highland; distinct from cover 13
  iso-line contours.

### 23 · Brian's Brain

- **Brian Callahan**, 1996 (popularization of the three-state rule).
- Off / firing / refractory cellular automaton on a toroidal grid; distinct
  from cover 14 Conway B3/S23.

## Shared utilities

### `hashStr` — FNV-1a string hash

- **G. Fowler, L. C. Noll, K.-P. Vo**, *FNV non-cryptographic hash*
  (1991). Public domain.

### `mulberry32` — PRNG

- **T. Ettinger**, *Mulberry32* gist (2017),
  <https://gist.github.com/tommyettinger/46a874533244883189143505d203312c>.
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

All three are SIL Open Font License 1.1 and may be redistributed freely.

## Reporting an attribution issue

If you believe a name is missing, misattributed, or that we have improperly
used the name of an artwork or person, please open an issue tagged
`attribution`. We will respond promptly and either correct the record or
remove the use.
