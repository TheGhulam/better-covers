"use client";

/**
 * The twenty-four-cover catalog with gallery metadata.
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
  renderGrayScottMaze,
  renderSpaceColonization,
  renderRisograph,
  renderWoodcut,
  renderBarnsleyFern,
  renderBatikCrackle,
  renderHypsometric,
  renderBriansBrain,
  renderJulia,
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
    subtitle:
      "Particles random-walking up until they touch the cluster overhead",
    num: "01 · Diffusion-limited aggregation (inverted)",
    h2: "Frost on a cornice, grown downward from a seed line",
    body: (
      <>
        Walkers drift through a void; the moment one touches an existing
        cluster, it sticks forever. Seed the cluster along the top edge and the
        dendrites hang downward — frost on a window ledge, lightning in reverse.
        The form is fractal, with a Hausdorff dimension near 1.71, in the same
        family as mineral inclusions and Lichtenberg figures.
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
        Two pendulums move a pen, a third moves the paper. Their decaying sine
        waves interfere into the guilloché patterns you'll find on the back of
        any pre-2000 banknote. Four damped sinusoids per axis; frequencies
        chosen near integer ratios for almost-closed curves.
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
        Charge a block of acrylic with a particle accelerator, then ground it;
        the trapped charge punches its way out, leaving a branching
        crystallographic discharge. Visually a DLA variant with growth exponent
        η &gt; 1 — the same Laplacian-growth family as fingering and mineral
        dendrites, just thirstier for low-density paths.
      </>
    ),
    refs: "Lichtenberg 1778 · Niemeyer–Pietronero–Wiesmann 1984 · tip-biased DLA heuristic",
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
        iterate until everything is stable. Drop a large pile at a single origin
        and the stabilized lattice is a Persian-miniature four-tone fractal
        whose continuum limit was proved by Pegden & Smart (2013).
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
        passing a cylinder sheds counter-rotating vortices at a fixed Strouhal
        number near 0.2. Von Kármán's 1911 model places them on a staggered
        double row with spacing ratio 0.28. The same pattern appears in MODIS
        cloud streets behind island peaks.
      </>
    ),
    refs: "Strouhal 1878 · Bénard 1908 · von Kármán 1911 · Lamb–Oseen advected dye",
  },
  {
    render: renderSchlieren,
    seed: "schlieren",
    title: "Schlieren",
    subtitle: "A heat plume rendered by its refractive-index gradient",
    num: "06 · Schlieren (Toepler knife-edge)",
    h2: "The optics of a knife-edge cutoff",
    body: (
      <>
        Toepler's 1864 schlieren technique places a knife-edge at the focal
        point of a collimated beam: any horizontal density gradient deflects
        rays past the edge and brightens the image. Heat plumes, shock fronts,
        and candle convection become visible. Algorithmically: an advected fBm
        density field, gradient in y, sigmoid through a one-sided cutoff.
      </>
    ),
    refs: "Toepler 1864 · Schardin 1934 · ∂ρ/∂y → sigmoid luminance",
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
        with matching rules that prohibit any periodic completion. The inflation
        rule subdivides each fat into two fat and one thin; each thin into one
        fat and one thin. Iterate five or six levels, color tiles by deflation
        depth, and you get an Islamic-tile-inspired palette over quasi-
        crystalline geometry — the structure Lu and Steinhardt identified at the
        Darb-i Imam shrine in 2007.
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
        Lindenmayer's 1968 parallel rewriting system applies one rule everywhere
        in a string at once; the result is interpreted as turtle moves with
        bracketed push and pop. From a one-letter axiom and a single production,
        six iterations of <code>F → F[+F]F[−F]F</code> at 25.7° give a
        recognizably botanical silhouette.
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
        Clifford Pickover's iterated sine-cosine map produces a smooth fractal
        attractor whose density varies by orbit recurrence:{" "}
        <code>x ← sin(a·y) + c·cos(a·x)</code>,{" "}
        <code>y ← sin(b·x) + d·cos(b·y)</code>. Accumulate millions of points
        into a 2D histogram, log-tonemap the count, and you get a
        chronophotographic glow rather than a neon-on-black demo.
      </>
    ),
    refs: "Pickover 1990 · de Jong 1987 · 4.5×10⁶-point histogram · log map",
  },
  {
    render: renderStippling,
    seed: "stippling",
    title: "Stippling",
    subtitle:
      "A blue-noise point distribution with minimum-distance constraint",
    dark: true,
    num: "10 · Poisson-disk stippling (Bridson 2007)",
    h2: "The retinal-cone mosaic, in ink",
    body: (
      <>
        Bridson's 2007 algorithm maintains an active list of seed points; each
        draws thirty candidates from the annulus [r, 2r] and accepts the first
        with no neighbor closer than r. The result is the blue-noise
        distribution you see in the cone mosaic of the human fovea, in
        sand-grain packing, and in any well-engraved 18th-century plate.
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
        Four to six soft-edged radial blobs in a restrained palette of three
        families — Dusk, Earth, Ember — chosen per cover from the slug seed. A
        first blob biased toward the upper-left third anchors the composition;
        the rest float free. A film-grain pass breaks the otherwise
        machine-clean gradient banding into something closer to color-field
        atmosphere than a CSS demo.
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
        low-frequency fBm noise field defines an angle at every point, and a few
        thousand particles are released into it, each leaving a low-alpha trail
        of short segments. Here, 1400 particles, 70 steps apiece, 0.7 px line
        width, one palette family of warm earth tones — the bare minimum that
        still reads as ink on paper rather than vector art.
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
        A fractal Brownian motion heightfield is summed with a single Gaussian
        peak at a slug-seeded position; contour lines fall at fourteen evenly
        spaced thresholds. The peak densifies into concentric summit rings — a
        recognizable landmark on every cover, the way a USGS quad always has at
        least one named hill. Warm-ochre ink on charcoal, grain to break the
        perfect bands.
      </>
    ),
    refs: "USGS contour ink · iso-line banding · fBm + Gaussian summit",
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
        Seed a 120×63 grid with 32% density from the slug hash, run twenty-two
        generations of Conway's 1970 B3/S23 rule under wraparound boundaries,
        and freeze. The surviving cells are colored amber at the center fading
        to slate at the edges, with a smoothstep alpha falloff in the bottom
        third so the title sits on clean ground. The snapshot is deterministic
        but never the same twice.
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
        cluster, a reflection pillar on water — is drawn at 4× supersample on
        the right two-thirds of the canvas, with the left third hard-masked to
        pure black. Each 7×11 cell is averaged into a luminance value,
        γ-corrected at 0.55 to pull sub-pixel structure into mid-density glyphs,
        and rendered through a ramp built from the post's own title characters.
      </>
    ),
    refs: "ASCII art tradition · aalib 1997 · Bourke 1997 · 4× supersample · γ=0.55",
  },
  {
    render: renderGrayScottMaze,
    seed: "gray-scott-maze",
    title: "Gray-Scott Maze",
    subtitle: "Labyrinthine channels on a coarse reaction-diffusion grid",
    num: "16 · Gray-Scott reaction-diffusion (maze)",
    h2: "Turing chemistry in the labyrinth regime",
    body: (
      <>
        Activator V and substrate U evolve via Laplacian coupling in Pearson's
        maze regime — elongated channels winding through inhibitor walls on a
        coarse grid, twelve hundred steps, then upscale. Ochre channels on a
        dark void, grain to break the perfect symmetry.
      </>
    ),
    refs: "Pearson 1993 · Gray-Scott · F=0.029 k=0.057 · maze regime",
  },
  {
    render: renderSpaceColonization,
    seed: "space-colonization",
    title: "Colonization",
    subtitle: "Attractors in the canopy, branches reaching up",
    num: "17 · Space colonization",
    h2: "Trees grown by hunger for light",
    body: (
      <>
        Scatter attractor points in the upper canopy; grow branch tips from a
        trunk base toward the nearest unconsumed attractor. When a tip enters
        the kill radius, the attractor vanishes. Two hundred twenty iterations
        produce the skeletal winter-tree silhouette Runions et al. popularized
        for botanical modeling.
      </>
    ),
    refs: "Runions et al. 2007 · 90–130 attractors · kill radius 10px",
  },
  {
    render: renderRisograph,
    seed: "risograph",
    title: "Risograph",
    subtitle: "Three misregistered spot-color layers on warm paper",
    num: "18 · Risograph",
    dark: true,
    h2: "Duplicator drift as composition",
    body: (
      <>
        Riso Kagaku's 1980s duplicator prints spot-color masters in sequence;
        perfect registration is optional. Three seed-offset layers — red, blue,
        and a mixed third pass — overprint the same fBm blob with deliberate
        drift. Warm paper stock, grain to sell the physical print.
      </>
    ),
    refs: "Riso Kagaku 1980s · 3 offset layers · master red + blue misregister",
  },
  {
    render: renderWoodcut,
    seed: "woodcut-hatch",
    title: "Woodcut",
    subtitle: "Crosshatched relief lines on ivory paper",
    num: "19 · Woodcut hatch",
    dark: true,
    h2: "Ink lines carved in the Dürer tradition",
    body: (
      <>
        Relief woodcut builds tone from parallel hatch strokes; crossing angles
        darken the form. An fBm density field plus a Gaussian bump sets where
        lines land — technique from the Dürer woodcut tradition, not a
        reproduction of any named print. Ivory paper, warm black ink.
      </>
    ),
    refs: "Dürer woodcut technique · fBm density · dual-angle crosshatch",
  },
  {
    render: renderBarnsleyFern,
    seed: "barnsley-fern",
    title: "Barnsley Fern",
    subtitle: "Fifty thousand IFS points tonemapped by visit density",
    num: "20 · Barnsley fern IFS",
    h2: "A fractal fern from four affine maps",
    body: (
      <>
        Michael Barnsley's iterated function system applies four affine
        transformations with fixed probabilities; fifty thousand points
        accumulate into a soft botanical silhouette. Density tonemapping gives
        the frond structure depth without neon-on-black contrast.
      </>
    ),
    refs: "Barnsley 1988 · 4-map IFS · 50 000-point histogram",
  },
  {
    render: renderBatikCrackle,
    seed: "batik-crackle",
    title: "Batik Crackle",
    subtitle: "Wax-resist crackle lines on an indigo ground",
    num: "21 · Batik crackle",
    h2: "Resist dyeing made visible",
    body: (
      <>
        Indonesian batik applies wax to cloth before indigo dyeing; the wax
        cracks under tension and leaves fine warm resist lines. Here, summed
        sinusoids with seed phase offsets extract a synthetic crackle field —
        technique inspired by the tradition, not a reproduction of any motif.
      </>
    ),
    refs: "Indonesian batik tradition · nodal crackle threshold 0.22",
  },
  {
    render: renderHypsometric,
    seed: "hypsometric",
    title: "Hypsometric Tint",
    subtitle: "Elevation color bands from deep water to highland",
    num: "22 · Hypsometric tint",
    h2: "Cartographic color by elevation",
    body: (
      <>
        NOAA and GEBCO bathymetric charts use discrete hypsometric color bands
        to read depth and elevation at a glance. A scalar heightfield maps to
        seven bands from deep water through shallow shelf to lowland and
        highland — color-band cartography rather than iso-line contours (cover
        13).
      </>
    ),
    refs: "NOAA/GEBCO symbology · 7 elevation bands · fBm heightfield",
  },
  {
    render: renderBriansBrain,
    seed: "brians-brain",
    title: "Brian's Brain",
    subtitle: "Three-state CA snapshot with glider filaments",
    num: "23 · Brian's Brain",
    h2: "Excitable media on a toroidal grid",
    body: (
      <>
        Brian Callahan's three-state cellular automaton: off, firing, and
        refractory. Off cells ignite when exactly two neighbors are firing;
        firing cells become refractory on the next tick. Forty-eight generations
        from a sparse seed yield glider-rich filaments on a dark field —
        distinct from Conway's B3/S23 snapshot (cover 14).
      </>
    ),
    refs: "Callahan 1996 · 3-state CA · 48 generations · 10% seed density",
  },
  {
    render: renderJulia,
    seed: "julia-dragon",
    title: "Julia set",
    subtitle:
      "Escape-time fractal with smooth iteration count and orbit-trap colouring",
    num: "24 · Julia set (escape-time fractal)",
    h2: "A boundary between order and chaos",
    body: (
      <>
        Fix a complex constant c and iterate z → z² + c from every pixel. Orbits
        that escape to infinity paint the exterior; those that stay bounded fill
        the solid Julia set. The smooth iteration count (
        <em>continuous potential</em>) eliminates banding by measuring how far
        the orbit overshot the bailout radius, while an orbit-trap pass accents
        the fine filaments near the fractal boundary. The SEED selects one of
        eight topologically distinct c values — from the three-lobed Douady
        rabbit to interlocking dragon spirals — plus an independent colour
        palette.
      </>
    ),
    refs: "Douady & Hubbard 1984 · Rampe 2002 (SIC) · Bourke 2006 (orbit trap) · 8 presets",
  },
];
