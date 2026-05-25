/**
 * better-covers-site / client
 * Wires the studio + the 3D fanned arc on the hero.
 */

import { COVERS, type CoverEntry } from "../covers/catalog";
import { hashStr, type Renderer } from "better-covers/shared";

const COVER_BY_ID = new Map<string, CoverEntry>(COVERS.map((c) => [c.id, c]));
let currentId = "hoarfrost";
let renderToken = 0;

const $ = <T extends Element = HTMLElement>(sel: string) =>
  document.querySelector(sel) as T;

const mainCanvas    = $<HTMLCanvasElement>("#mainCanvas");
const canvasFrame   = $<HTMLElement>("#canvasFrame");
const loaderLabel   = $<HTMLElement>("#loaderLabel");
const seedInput     = $<HTMLInputElement>("#seedInput");
const diceBtn       = $<HTMLButtonElement>("#diceBtn");
const rendererBtn   = $<HTMLButtonElement>("#rendererBtn");
const rendererSelect= $<HTMLElement>("#rendererSelect");
const rendererPop   = $<HTMLElement>("#rendererPopover");
const renNum        = $<HTMLElement>("#renNum");
const renName       = $<HTMLElement>("#renName");
const downloadBtn   = $<HTMLButtonElement>("#downloadBtn");
const copySeedBtn   = $<HTMLButtonElement>("#copySeedBtn");
const overlayT      = $<HTMLElement>("#overlayT");
const overlayS      = $<HTMLElement>("#overlayS");
const notesBody     = $<HTMLElement>("#notesBody");
const notesRefs     = $<HTMLElement>("#notesRefs");
const themeToggle   = $<HTMLButtonElement>("#themeToggle");
const themeLabel    = $<HTMLElement>("#themeLabel");
const themeIcon     = $<SVGElement>("#themeIcon");
const savedFlash    = $<HTMLElement>("#savedFlash");
const flashText     = $<HTMLElement>("#flashText");

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
const storedTheme = (() => {
  try { return localStorage.getItem("bc-theme"); } catch { return null; }
})();
const preferDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
applyTheme(storedTheme ?? (preferDark ? "dark" : "light"));

function applyTheme(t: string) {
  document.documentElement.dataset.theme = t;
  document.body.dataset.theme = t;
  themeLabel.textContent = t === "dark" ? "Dark" : "Light";
  themeIcon.innerHTML = t === "dark"
    ? `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>` // moon
    : `<circle cx="12" cy="12" r="4"/>
       <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>`;
  try { localStorage.setItem("bc-theme", t); } catch { /* noop */ }
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  // Re-paint everything since palette-sensitive renderers (painterly, etc) don't change but the canvas wash does
  renderMain({ skipLoader: true });
  // Re-render arc + catalog thumbnails (they used the previous canvas background)
  repaintAllThumbs();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function paintInto(canvas: HTMLCanvasElement, render: Renderer, seed: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  render(ctx, canvas.width, canvas.height, hashStr(seed));
}

async function renderMain(opts: { skipLoader?: boolean } = {}) {
  const cover = COVER_BY_ID.get(currentId)!;
  const seed = (seedInput.value || cover.defaultSeed).trim() || cover.defaultSeed;

  overlayT.textContent = cover.title;
  overlayS.textContent = cover.subtitle;
  notesBody.textContent = cover.body;
  notesRefs.textContent = cover.refs;
  canvasFrame.classList.toggle("title-dark", !!cover.dark);

  const tok = ++renderToken;
  if (!opts.skipLoader) {
    loaderLabel.textContent = "Painting…";
    canvasFrame.classList.add("loading");
  }

  // Give the browser a frame to show the loader before we block on heavy renderers
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  if (tok !== renderToken) return;

  try { paintInto(mainCanvas, cover.render, seed); }
  catch (err) { console.error("render failed", err); }

  if (tok !== renderToken) return;
  canvasFrame.classList.remove("loading");
  canvasFrame.classList.add("show-title");
}

let seedDebounce: number | undefined;
seedInput.addEventListener("input", () => {
  window.clearTimeout(seedDebounce);
  seedDebounce = window.setTimeout(() => renderMain(), 280);
});
seedInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    window.clearTimeout(seedDebounce);
    renderMain();
  }
});

// ---------------------------------------------------------------------------
// Dice — random seed
// ---------------------------------------------------------------------------
const DICE_NOUNS = [
  "frost", "ember", "lapis", "ochre", "vellum", "salt", "iron",
  "moth", "petal", "lichen", "drift", "wax", "amber", "kiln",
  "tide", "smoke", "char", "pollen", "rust", "mica", "ash",
  "hoar", "marl", "loam", "tundra", "lattice", "vortex", "fern",
  "marsh", "shale", "cinder", "indigo", "phloem",
];
const DICE_ADJS = [
  "winter", "halftone", "shoreline", "verdigris", "alkaline",
  "crackle", "stillborn", "magnetic", "phosphor", "tannic",
  "feldspar", "boreal", "kelpforest", "auroral",
  "spectral", "tincture", "cathode", "ochreous", "obsidian",
];
diceBtn.addEventListener("click", () => {
  const a = DICE_ADJS[Math.floor(Math.random() * DICE_ADJS.length)];
  const n = DICE_NOUNS[Math.floor(Math.random() * DICE_NOUNS.length)];
  seedInput.value = `${a}-${n}`;
  diceBtn.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
    { duration: 480, easing: "cubic-bezier(.2,.7,.2,1)" },
  );
  renderMain();
});

// ---------------------------------------------------------------------------
// Renderer dropdown
// ---------------------------------------------------------------------------
function setRenderer(id: string, opts: { resetSeed?: boolean; seed?: string } = {}) {
  const cover = COVER_BY_ID.get(id);
  if (!cover) return;
  currentId = id;
  renNum.textContent = cover.num;
  renName.textContent = cover.title;

  rendererPop.querySelectorAll(".renderer-option").forEach((el) => {
    el.classList.toggle("active", (el as HTMLElement).dataset.renderId === id);
  });

  if (opts.seed)      seedInput.value = opts.seed;
  else if (opts.resetSeed) seedInput.value = cover.defaultSeed;
  renderMain();
}

rendererBtn.addEventListener("click", () => {
  const isOpen = rendererSelect.classList.toggle("open");
  rendererBtn.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (e) => {
  if (!rendererSelect.contains(e.target as Node)) {
    rendererSelect.classList.remove("open");
    rendererBtn.setAttribute("aria-expanded", "false");
  }
});

rendererPop.addEventListener("click", (e) => {
  const opt = (e.target as HTMLElement).closest(".renderer-option") as HTMLElement | null;
  if (!opt) return;
  const id = opt.dataset.renderId!;
  rendererSelect.classList.remove("open");
  rendererBtn.setAttribute("aria-expanded", "false");
  setRenderer(id, { resetSeed: true });
});

// ---------------------------------------------------------------------------
// Download PNG
// ---------------------------------------------------------------------------
downloadBtn.addEventListener("click", async () => {
  const cover = COVER_BY_ID.get(currentId)!;
  const seed = (seedInput.value || cover.defaultSeed).trim() || cover.defaultSeed;

  if (canvasFrame.classList.contains("loading")) {
    await new Promise((r) => setTimeout(r, 80));
  }

  const out = document.createElement("canvas");
  out.width = 1200; out.height = 630;
  paintInto(out, cover.render, seed);

  const safeSeed = seed.replace(/[^a-z0-9_-]/gi, "_").slice(0, 60);
  const filename = `${cover.id}__${safeSeed}.png`;

  out.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showFlash(`Saved · ${filename}`);
  }, "image/png");
});

// ---------------------------------------------------------------------------
// Copy seed
// ---------------------------------------------------------------------------
copySeedBtn.addEventListener("click", async () => {
  const cover = COVER_BY_ID.get(currentId)!;
  const seed = (seedInput.value || cover.defaultSeed).trim() || cover.defaultSeed;
  try {
    await navigator.clipboard.writeText(seed);
    showFlash(`Copied · ${seed}`);
  } catch {
    showFlash("Copy failed");
  }
});

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
let flashTimer: number | undefined;
function showFlash(msg: string) {
  flashText.textContent = msg;
  savedFlash.classList.add("show");
  window.clearTimeout(flashTimer);
  flashTimer = window.setTimeout(() => savedFlash.classList.remove("show"), 2400);
}

// ---------------------------------------------------------------------------
// 3D fanned arc — layout + scroll/mouse motion
// ---------------------------------------------------------------------------
const arcStage  = document.getElementById("arcStage") as HTMLElement | null;
const arcTrack  = document.getElementById("arcTrack") as HTMLElement | null;
const arcCards  = Array.from(document.querySelectorAll<HTMLButtonElement>(".arc-card"));

function layoutArc() {
  if (!arcTrack || arcCards.length === 0) return;
  const n = arcCards.length;
  // Arc spans roughly ±55° around center, sitting on a circle of radius R
  const SPREAD_DEG = 55;            // half-spread
  const R = 720;                    // arc radius (px) on the z-plane
  const STEP = (SPREAD_DEG * 2) / (n - 1);

  arcCards.forEach((card, i) => {
    const angle = -SPREAD_DEG + i * STEP;    // -55..+55
    const rad   = (angle * Math.PI) / 180;
    const tx    = Math.sin(rad) * R;
    const tz    = -Math.cos(rad) * R + R;    // pull cards forward so center sits at z=0
    const ty    = -Math.abs(angle) * 0.55;   // lift edges slightly for a "lifted-deck" feel
    card.style.setProperty("--rot-y", `${angle * 0.85}deg`);
    card.style.setProperty("--tz",    `${tz}px`);
    card.style.setProperty("--tx",    `${tx}px`);
    card.style.setProperty("--ty",    `${ty}px`);
    card.style.zIndex = String(Math.round(100 - Math.abs(angle)));
  });
}
layoutArc();
window.addEventListener("resize", layoutArc);

const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

if (arcStage && arcTrack && !reduceMotion) {
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;
  let curMx = 0, curMy = 0, curS = 0;
  let raf = 0;

  window.addEventListener("mousemove", (e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouseX = (e.clientX / w - 0.5) * 2;       // -1..1
    mouseY = (e.clientY / h - 0.5) * 2;
  });

  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
  }, { passive: true });

  function tick() {
    // Damped follow for buttery feel
    curMx += (mouseX - curMx) * 0.08;
    curMy += (mouseY - curMy) * 0.08;
    curS  += (scrollY - curS) * 0.10;

    // Scroll spins the arc gently around Y; mouse adds local tilt
    const scrollRotY = curS * 0.025;          // deg per px
    const tiltY      = curMx * 6;             // mouse left/right
    const tiltX      = -curMy * 3;            // mouse up/down

    arcTrack.style.setProperty("--arc-scroll", `${scrollRotY}deg`);
    arcTrack.style.setProperty("--arc-tilt-y", `${tiltY}deg`);
    arcTrack.style.setProperty("--arc-tilt-x", `${tiltX}deg`);

    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}

// Click an arc card → load it into the studio + scroll
arcCards.forEach((card) => {
  const id = card.dataset.renderId!;
  card.addEventListener("click", () => {
    const seed = card.dataset.seed!;
    setRenderer(id, { seed });
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ---------------------------------------------------------------------------
// Thumbnails — arc + catalog
// ---------------------------------------------------------------------------
function renderThumbnail(canvas: HTMLCanvasElement, id: string, seed?: string) {
  const cover = COVER_BY_ID.get(id);
  if (!cover) return;
  try {
    paintInto(canvas, cover.render, seed ?? cover.defaultSeed);
    canvas.dataset.painted = "1";
  } catch (e) { console.error(e); }
}

// Arc cards — paint immediately with a small stagger
arcCards.forEach((card, i) => {
  const canvas = card.querySelector("canvas") as HTMLCanvasElement;
  setTimeout(() => renderThumbnail(canvas, card.dataset.renderId!, card.dataset.seed), 60 + i * 40);
});

// Catalog cards — lazy via IntersectionObserver
const catalogCards = document.querySelectorAll<HTMLButtonElement>(".cov-card");
catalogCards.forEach((card) => {
  const id = card.dataset.renderId!;
  card.addEventListener("click", () => {
    setRenderer(id, { resetSeed: true });
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function paintCatalog(card: HTMLElement) {
  const id = card.dataset.renderId!;
  const canvas = card.querySelector("canvas") as HTMLCanvasElement;
  if (!canvas || canvas.dataset.painted === "1") return;
  setTimeout(() => renderThumbnail(canvas, id), 0);
}

if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        paintCatalog(entry.target as HTMLElement);
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: "300px 0px" });
  catalogCards.forEach((card) => obs.observe(card));
} else {
  catalogCards.forEach((c) => paintCatalog(c));
}

function repaintAllThumbs() {
  arcCards.forEach((card) => {
    const canvas = card.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) { canvas.dataset.painted = ""; renderThumbnail(canvas, card.dataset.renderId!, card.dataset.seed); }
  });
  catalogCards.forEach((card) => {
    const canvas = card.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) { canvas.dataset.painted = ""; paintCatalog(card); }
  });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
renderMain();
