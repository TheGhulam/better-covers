"use client";

/**
 * The fifteen-cover catalog with gallery metadata.
 *
 * Each entry pairs a renderer with the page chrome that appears around it
 * in the demo gallery: the catalog number, the field-notes headline, the
 * body paragraph, and the references line. The `seed` and `subtitle` here
 * are the defaults used in the gallery; consumers calling `<Cover />`
 * directly can override both.
 *
 * @module covers
 */

import type { ReactNode } from "react";
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
} from "./renderers";
import type { Renderer } from "./shared";

export interface CoverEntry {
  render: Renderer;
  seed: string;
  title: string;
  subtitle: string;
  dark?: boolean;
  num: string;
  h2: string;
  body: ReactNode;
  refs: string;
}

export const COVERS: CoverEntry[] = [
  {
    render: renderHoarfrost,
    seed: "dla-hoarfrost",
    title: "Hoarfrost",
    subtitle: "Particles random-walking up until they touch the cluster overhead",
    num: "01 · Diffusion-limited aggregation (inverted)",
    h2: "Frost on a cornice, grown downward from a seed line",
    body: (
      <>
        Walkers drift through a void; the moment one touches an existing
        cluster, it sticks forever. Seed the cluster along the top edge and
        the dendrites hang downward — frost on a window ledge, lightning in
        reverse. The form is fractal, with a Hausdorff dimension near 1.71,
        in the same family as mineral inclusions and Lichtenberg figures.
      </>
    ),
    refs: "Witten & Sander 1981 · grid-walk · seed line at top",
  },
  {
    render: renderHarmonograph,
    seed: "harmonograph",
    title: "Harmonograph",
    subtitle:
      "Three pendulums, four damped sinusoids per axis, one sheet of paper",
    num: "02 · Harmonograph",
    h2: "A Victorian drawing machine, drawn in code",
    body: (
      <>
        Two pendulums move a pen, a third moves the paper. Their decaying
        sine waves interfere into the guilloché patterns you'll find on the
        back of any pre-2000 banknote. Four damped sinusoids per axis;
        frequencies chosen near integer ratios for almost-closed curves.
      </>
    ),
    refs: "Blackburn 1844 · Goold 1893 · damped-sinusoid pair · 24000 samples",
  },
  {
    render: renderLichtenberg,
    seed: "lichtenberg",
    title: "Lichtenberg",
    subtitle: "A dielectric breakdown captured inside acrylic",
    num: "03 · Lichtenberg figures",
    h2: "Frozen lightning in a block of plastic",
    body: (
      <>
        Charge a block of acrylic with a particle accelerator, then ground
        it; the trapped charge punches its way out, leaving a branching
        crystallographic discharge. Visually a DLA variant with growth
        exponent η &gt; 1 — the same Laplacian-growth family as fingering
        and mineral dendrites, just thirstier for low-density paths.
      </>
    ),
    refs: "Lichtenberg 1777 · Niemeyer–Pietronero–Wiesmann 1984 · η ≈ 2 DLA",
  },
  {
    render: renderSandpile,
    seed: "sandpile",
    title: "Sandpile",
    subtitle: "A million grains dropped on a single cell, stabilized",
    num: "04 · Abelian sandpile",
    h2: "Self-organized criticality on a square lattice",
    body: (
      <>
        A cell with four or more grains topples one grain to each neighbor;
        iterate until everything is stable. Drop a large pile at a single
        origin and the stabilized lattice is a Persian-miniature four-tone
        fractal whose continuum limit is still being worked out by Levine
        and Pegden.
      </>
    ),
    refs: "Bak–Tang–Wiesenfeld 1987 · Dhar 1990 · topple-stabilize",
  },
  {
    render: renderKarman,
    seed: "karman",
    title: "Kármán Street",
    subtitle: "A wake of alternating vortices behind a bluff body",
    num: "05 · Kármán vortex street",
    h2: "The dimensionless frequency of a wake",
    body: (
      <>
        For Reynolds numbers between forty and a hundred thousand, a fluid
        passing a cylinder sheds counter-rotating vortices at a fixed
        Strouhal number near 0.2. Von Kármán's 1911 model places them on a
        staggered double row with spacing ratio 0.28. The same pattern
        appears in MODIS cloud streets behind island peaks.
      </>
    ),
    refs: "Strouhal 1878 · Bénard 1908 · von Kármán 1911 · Lamb–Oseen advected dye",
  },
  {
    render: renderSchlieren,
    seed: "schlieren",
    title: "Schlieren",
    subtitle: "A heat plume rendered by its refractive-index gradient",
    num: "06 · Schlieren / shadowgraph",
    h2: "The optics of a knife-edge cutoff",
    body: (
      <>
        Toepler's 1864 schlieren technique places a knife-edge at the focal
        point of a collimated beam: any horizontal density gradient deflects
        rays past the edge and brightens the image. Heat plumes, shock
        fronts, and candle convection become visible. Algorithmically: an
        advected fBm density field, gradient in y, sigmoid through a
        one-sided cutoff.
      </>
    ),
    refs: "Toepler 1864 · Schardin 1942 · ∂ρ/∂y → sigmoid luminance",
  },
  {
    render: renderPenrose,
    seed: "penrose",
    title: "Penrose",
    subtitle: "Two rhombs, matching rules, no translational symmetry",
    num: "07 · Penrose tiling (P3 deflation)",
    h2: "Five-fold order without a unit cell",
    body: (
      <>
        The P3 tiling uses two rhombs — thin (36°/144°) and fat (72°/108°) —
        with matching rules that prohibit any periodic completion. The
        inflation rule subdivides each fat into two fat and one thin; each
        thin into one fat and one thin. Iterate five or six levels, color
        tiles by deflation depth, and you recover the Darb-i Imam
        quasicrystalline palette Lu and Steinhardt identified in 2007.
      </>
    ),
    refs: "Penrose 1974 · de Bruijn 1981 · Lu & Steinhardt 2007 · inflation rule",
  },
  {
    render: renderLSystem,
    seed: "lsystem",
    title: "Lindenmayer",
    subtitle: "A bracketed string-rewriting grammar interpreted as a turtle",
    num: "08 · L-system plants",
    h2: "A grammar for branching",
    body: (
      <>
        Lindenmayer's 1968 parallel rewriting system applies one rule
        everywhere in a string at once; the result is interpreted as turtle
        moves with bracketed push and pop. From a one-letter axiom and a
        single production, six iterations of{" "}
        <code>F → F[+F]F[−F]F</code> at 25.7° give a recognizably botanical
        silhouette.
      </>
    ),
    refs: "Lindenmayer 1968 · Prusinkiewicz & Lindenmayer 1990 · bracketed turtle",
  },
  {
    render: renderClifford,
    seed: "clifford",
    title: "Clifford",
    subtitle:
      "A 2D iterated map, four and a half million points, log-tonemapped",
    num: "09 · Strange attractor (Clifford / de Jong)",
    h2: "A fractal set, traced by an orbit",
    body: (
      <>
        Clifford Pickover's iterated sine-cosine map produces a smooth
        fractal attractor whose density varies by orbit recurrence:{" "}
        <code>x ← sin(a·y) + c·cos(a·x)</code>,{" "}
        <code>y ← sin(b·x) + d·cos(b·y)</code>. Accumulate millions of
        points into a 2D histogram, log-tonemap the count, and you get a
        chronophotographic glow rather than a neon-on-black demo.
      </>
    ),
    refs: "Pickover 1990 · de Jong 1987 · 4.5×10⁶-point histogram · log map",
  },
  {
    render: renderStippling,
    seed: "stippling",
    title: "Stippling",
    subtitle: "A blue-noise point distribution with minimum-distance constraint",
    dark: true,
    num: "10 · Poisson-disk stippling (Bridson 2007)",
    h2: "The retinal-cone mosaic, in ink",
    body: (
      <>
        Bridson's 2007 algorithm maintains an active list of seed points;
        each draws thirty candidates from the annulus [r, 2r] and accepts
        the first with no neighbor closer than r. The result is the
        blue-noise distribution you see in the cone mosaic of the human
        fovea, in sand-grain packing, and in any well-engraved 18th-century
        plate.
      </>
    ),
    refs: "Bridson 2007 · Mitchell 1987 · annulus rejection · density-modulated radius",
  },
  {
    render: renderPainterly,
    seed: "painterly-atmosphere",
    title: "Atmosphere",
    subtitle: "Overlapping color-field blobs in a restrained warm-cool palette",
    num: "11 · Painterly atmosphere",
    h2: "A color-field background, painted by gradient",
    body: (
      <>
        Four to six soft-edged radial blobs in a restrained palette of
        three families — Dusk, Earth, Ember — chosen per cover from the
        slug seed. A first blob biased toward the upper-left third anchors
        the composition; the rest float free. A film-grain pass breaks the
        otherwise machine-clean gradient banding into something closer to a
        Rothko reproduction than a CSS demo.
      </>
    ),
    refs: "color-field painting · radial-gradient blobs · slug-seeded grain",
  },
  {
    render: renderFlow,
    seed: "flow-fidenza",
    title: "Fidenza",
    subtitle: "Fourteen hundred particles drifting along an fBm vector field",
    num: "12 · Flow field",
    h2: "A vector field, walked with ink",
    body: (
      <>
        Tyler Hobbs's 2021 <em>Fidenza</em> is the canonical reference: a
        low-frequency fBm noise field defines an angle at every point, and
        a few thousand particles are released into it, each leaving a
        low-alpha trail of short segments. Here, 1400 particles, 70 steps
        apiece, 0.7 px line width, one palette family of warm earth tones —
        the bare minimum that still reads as ink on paper rather than
        vector art.
      </>
    ),
    refs: "Tyler Hobbs · Fidenza (2021) · fBm vector field · ink-trail strokes",
  },
  {
    render: renderTopo,
    seed: "topo-contour",
    title: "Contour",
    subtitle: "An fBm heightfield read as cartographic iso-lines",
    num: "13 · Topographic contours",
    h2: "The cartographic convention, fed by noise",
    body: (
      <>
        A fractal Brownian motion heightfield is summed with a single
        Gaussian peak at a slug-seeded position; contour lines fall at
        fourteen evenly spaced thresholds. The peak densifies into
        concentric summit rings — a recognizable landmark on every cover,
        the way a USGS quad always has at least one named hill. Warm-ochre
        ink on charcoal, grain to break the perfect bands.
      </>
    ),
    refs: "USGS contour convention · marching squares · fBm + Gaussian summit",
  },
  {
    render: renderLife,
    seed: "life-conway",
    title: "Game of Life",
    subtitle:
      "A B3/S23 cellular automaton, twenty-two generations from a slug seed",
    num: "14 · Conway's Game of Life",
    h2: "A cellular automaton snapshot, not a portrait",
    body: (
      <>
        Seed a 120×63 grid with 32% density from the slug hash, run
        twenty-two generations of Conway's 1970 B3/S23 rule under
        wraparound boundaries, and freeze. The surviving cells are colored
        amber at the center fading to slate at the edges, with a smoothstep
        alpha falloff in the bottom third so the title sits on clean
        ground. The snapshot is deterministic but never the same twice.
      </>
    ),
    refs: "Conway 1970 (Gardner) · B3/S23 · 22 generations · smoothstep legibility",
  },
  {
    render: renderAscii,
    seed: "ascii-landscape",
    title: "ASCII Landscape",
    subtitle: "A right-anchored scene sampled into γ-corrected glyphs",
    num: "15 · ASCII landscape",
    h2: "The brightness-ramp, applied to a scene built for it",
    body: (
      <>
        A procedural landscape — sun, radiating rays, hills, a small tree
        cluster, a reflection pillar on water — is drawn at 4× supersample
        on the right two-thirds of the canvas, with the left third
        hard-masked to pure black. Each 7×11 cell is averaged into a
        luminance value, γ-corrected at 0.55 to pull sub-pixel structure
        into mid-density glyphs, and rendered through a ramp built from
        the post's own title characters.
      </>
    ),
    refs: "ASCII art tradition · aalib 1997 · 4× supersample · γ=0.55 · title-derived ramp",
  },
];
