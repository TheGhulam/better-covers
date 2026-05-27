/**
 * Home-page interactivity:
 *  1. Animate a one-shot Conway's Life reveal into the hero canvas.
 *  2. Lazily render each gallery cover as it enters the viewport.
 *  3. Cache rendered PNGs in sessionStorage so re-scrolling is instant.
 *  4. Wire each cover as a button that opens the studio <dialog>:
 *     edit the seed, re-render with a crossfade, download the PNG.
 */

import { COVERS, type CoverEntry } from '../covers/catalog';
import { hashStr, mulberry32 } from 'better-covers/shared';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------
   Hero — one-shot Life. Cheap enough to step in realtime: 120 × 63
   cells, 22 generations, one step per ~130 ms. We freeze the dot
   indicator at the end so the rest of the page reads as static.
   ------------------------------------------------------------------ */
function initHero() {
  const canvas = document.getElementById('hero') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const CELL = 10;
  const DENSITY = 0.32;
  const TOTAL = 22;

  const cols = Math.floor(W / CELL);
  const rows = Math.floor(H / CELL);

  // Vary the seed each visit so first-time wow doesn't get stale, but
  // we don't use Math.random — the slug-style hash keeps the result
  // reproducible inside one tab while still differing across sessions.
  const SEED = hashStr('better-covers-hero-' + (Date.now() % 9973).toString());
  const rand = mulberry32(SEED);

  let grid = new Uint8Array(cols * rows);
  for (let i = 0; i < grid.length; i++) grid[i] = rand() < DENSITY ? 1 : 0;

  const at = (g: Uint8Array, x: number, y: number) =>
    g[((y + rows) % rows) * cols + ((x + cols) % cols)];

  function legibilityAlpha(yNorm: number): number {
    if (yNorm <= 0.67) return 1;
    if (yNorm >= 0.95) return 0;
    const t = (yNorm - 0.67) / 0.28;
    return 1 - t * t * (3 - 2 * t);
  }

  function paint() {
    if (!ctx) return;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < rows; y++) {
      const yPx = y * CELL + CELL / 2;
      const f = legibilityAlpha(yPx / H);
      if (f <= 0) continue;
      for (let x = 0; x < cols; x++) {
        if (!grid[y * cols + x]) continue;
        const dx = (x - cols / 2) / cols;
        const dy = (y - rows / 2) / rows;
        const t = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 1.6);
        const r = Math.round(200 + (60 - 200) * t);
        const g = Math.round(136 + (78 - 136) * t);
        const b = Math.round(74 + (95 - 74) * t);
        ctx.fillStyle = `rgba(${r},${g},${b},${f.toFixed(3)})`;
        ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
      }
    }
  }

  function step() {
    const next = new Uint8Array(grid.length);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            if (dx || dy) n += at(grid, x + dx, y + dy);
        const alive = at(grid, x, y);
        next[y * cols + x] = alive
          ? (n === 2 || n === 3 ? 1 : 0)
          : (n === 3 ? 1 : 0);
      }
    }
    grid = next;
  }

  paint();

  if (REDUCED_MOTION) {
    for (let i = 0; i < TOTAL; i++) step();
    paint();
    return;
  }

  let gen = 0;
  const tick = () => {
    step();
    gen++;
    paint();
    if (gen < TOTAL) {
      setTimeout(tick, 130);
    }
    // Final frame stays frozen on canvas — no label needed.
  };
  setTimeout(tick, 600);
}

/* ------------------------------------------------------------------
   Gallery — IntersectionObserver triggers each slot's render once,
   then caches a JPEG dataURL in sessionStorage so a re-render after
   a fast scroll back doesn't re-pay the compute cost.
   ------------------------------------------------------------------ */
function initGalleryRenderers(onCoverClick: (entry: CoverEntry) => void) {
  const slots = document.querySelectorAll<HTMLElement>('.cover-slot');
  if (!slots.length) return;

  function renderInto(slot: HTMLElement) {
    const idx = Number(slot.dataset.idx);
    const c = COVERS[idx];
    if (!c) return;
    const canvas = slot.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cacheKey = `bc:${c.id}:${c.defaultSeed}`;

    // sessionStorage hit → paint instantly
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          slot.classList.remove('loading');
          slot.classList.add('in');
        };
        img.src = cached;
        return;
      }
    } catch {
      // sessionStorage unavailable (private mode, quota); fall through
    }

    // Defer the actual paint to the next frame so the IntersectionObserver
    // callback returns quickly. The deferred setTimeout adds a 16 ms beat
    // so the browser can honor the .in opacity transition before stalling.
    requestAnimationFrame(() => {
      setTimeout(() => {
        c.render(ctx, canvas.width, canvas.height, hashStr(c.defaultSeed));
        try {
          sessionStorage.setItem(cacheKey, canvas.toDataURL('image/jpeg', 0.85));
        } catch {
          /* over-quota; cache silently degrades */
        }
        slot.classList.remove('loading');
        requestAnimationFrame(() => slot.classList.add('in'));
      }, 16);
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          renderInto(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '400px 0px' },
  );

  slots.forEach((s) => {
    io.observe(s);
    // Wire the click → open studio
    s.addEventListener('click', () => {
      const idx = Number(s.dataset.idx);
      const c = COVERS[idx];
      if (c) onCoverClick(c);
    });
  });

  // Position tracker: a centered viewport band picks whichever slot is
  // currently crossing the middle of the screen. Updates the top-right
  // counter in the corner so the long vertical scroll has wayfinding.
  initPositionTracker(slots);
}

function initPositionTracker(slots: NodeListOf<HTMLElement>) {
  const currentEl = document.getElementById('position-current');
  if (!currentEl) return;

  let lastIdx = -1;

  function setIdx(idx: number) {
    if (idx === lastIdx) return;
    lastIdx = idx;
    currentEl!.textContent = String(idx + 1).padStart(2, '0');
    // Brief accent flash on change — gives the digit a tiny pulse.
    currentEl!.classList.remove('bumped');
    void currentEl!.offsetWidth;
    currentEl!.classList.add('bumped');
    window.setTimeout(() => currentEl!.classList.remove('bumped'), 420);
  }

  // Thin band centered on the viewport. Whichever slot's center is in
  // this band is the current one; if multiple are intersecting (transient
  // during fast scroll), pick the highest-ratio one.
  const trackio = new IntersectionObserver(
    (entries) => {
      let best: IntersectionObserverEntry | null = null;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (best) {
        const idx = Number((best.target as HTMLElement).dataset.idx);
        if (!Number.isNaN(idx)) setIdx(idx);
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  );
  slots.forEach((s) => trackio.observe(s));
}

/* ==================================================================
   Studio dialog
   Lives on the same page as the gallery. Native <dialog> gives us
   the focus trap, ESC handling, and backdrop click for free.
   ================================================================== */

interface StudioRefs {
  dialog: HTMLDialogElement;
  frame: HTMLElement;
  progress: HTMLElement;
  progressFill: HTMLElement;
  num: HTMLElement;
  title: HTMLElement;
  subtitle: HTMLElement;
  body: HTMLElement;
  refs: HTMLElement;
  seedMeta: HTMLElement;
  seedInput: HTMLInputElement;
  formatSelect: HTMLSelectElement;
  btnRender: HTMLButtonElement;
  btnDownload: HTMLButtonElement;
  btnShuffle: HTMLButtonElement;
  btnClose: HTMLButtonElement;
  info: HTMLElement;
  infoTrigger: HTMLButtonElement;
}

interface StudioState {
  active: CoverEntry | null;
  activeCanvas: HTMLCanvasElement | null;
  isRendering: boolean;
  savedTimer: number | null;
}

function bootStudio(): StudioRefs | null {
  const dialog = document.getElementById('studio') as HTMLDialogElement | null;
  if (!dialog) return null;

  const refs: StudioRefs = {
    dialog,
    frame: document.getElementById('stage-frame') as HTMLElement,
    progress: document.getElementById('stage-progress') as HTMLElement,
    progressFill: document.createElement('div'),
    num: document.getElementById('panel-num') as HTMLElement,
    title: document.getElementById('panel-title') as HTMLElement,
    subtitle: document.getElementById('panel-subtitle') as HTMLElement,
    body: document.getElementById('panel-body') as HTMLElement,
    refs: document.getElementById('panel-refs') as HTMLElement,
    seedMeta: document.getElementById('panel-seed-meta') as HTMLElement,
    seedInput: document.getElementById('seed-input') as HTMLInputElement,
    formatSelect: document.getElementById('format-select') as HTMLSelectElement,
    btnRender: document.getElementById('btn-render') as HTMLButtonElement,
    btnDownload: document.getElementById('btn-download') as HTMLButtonElement,
    btnShuffle: document.getElementById('btn-shuffle') as HTMLButtonElement,
    btnClose: document.getElementById('studio-close') as HTMLButtonElement,
    info: document.getElementById('info') as HTMLElement,
    infoTrigger: document.getElementById('info-trigger') as HTMLButtonElement,
  };

  // Imperative progress-fill so we can drive width with JS rather than CSS.
  refs.progressFill.style.cssText =
    'height:100%;width:0%;background:var(--accent);transition:width 100ms linear;';
  refs.progress.appendChild(refs.progressFill);

  return refs;
}

function openStudio(refs: StudioRefs, state: StudioState, entry: CoverEntry) {
  state.active = entry;
  state.activeCanvas = null;

  refs.num.textContent = entry.num;
  refs.title.textContent = entry.title;
  refs.subtitle.textContent = entry.subtitle;
  refs.body.textContent = entry.body;
  refs.refs.textContent = entry.refs;
  refs.seedInput.value = entry.defaultSeed;
  refs.seedMeta.textContent = entry.defaultSeed;

  // Clear any leftover stage canvases from a previous open.
  refs.frame.querySelectorAll('canvas').forEach((c) => c.remove());

  // Reset Saved state on the download button.
  refs.btnDownload.classList.remove('is-saved');
  if (state.savedTimer !== null) {
    clearTimeout(state.savedTimer);
    state.savedTimer = null;
  }

  // Reset info drawer to collapsed for each new cover open.
  refs.info.classList.remove('is-open');
  refs.infoTrigger.setAttribute('aria-expanded', 'false');

  refs.dialog.showModal();

  // Paint after the dialog enter animation has begun so the heavy
  // renderer doesn't fight the open transition for frame budget.
  requestAnimationFrame(() => {
    void renderMaster(refs, state, entry.defaultSeed, { crossfade: false });
  });

  // Focus the seed input once the open animation has settled — focusing
  // mid-transform causes the focus ring to jump around.
  setTimeout(() => refs.seedInput.focus({ preventScroll: true }), 320);
}

async function renderMaster(
  refs: StudioRefs,
  state: StudioState,
  seed: string,
  opts: { crossfade: boolean },
): Promise<void> {
  if (state.isRendering || !state.active) return;
  state.isRendering = true;
  refs.btnRender.disabled = true;
  refs.btnShuffle.disabled = true;

  const entry = state.active;
  const approxMs = Math.max(200, entry.approxMs || 600);

  refs.seedMeta.textContent = seed;

  // Drive the progress bar from 0 → 95% over approxMs, then snap to 100%.
  refs.progress.classList.add('is-active');
  refs.progressFill.style.transition = `width ${approxMs}ms linear`;
  refs.progressFill.style.width = '0%';
  requestAnimationFrame(() => {
    refs.progressFill.style.width = '95%';
  });

  // Yield so the progress bar paints and animates completely before we block the thread on
  // a heavy renderer. This simulates the progress bar filling smoothly over approxMs.
  await new Promise((r) => setTimeout(r, approxMs));

  const dims = refs.formatSelect.value.split('x');
  const renderW = Number(dims[0]) || 1200;
  const renderH = Number(dims[1]) || 630;

  // Update stage frame aspect ratio to match the selected format
  refs.frame.style.aspectRatio = `${renderW} / ${renderH}`;

  const next = document.createElement('canvas');
  next.width = renderW;
  next.height = renderH;
  next.className = 'stage-next';
  const ctx = next.getContext('2d');
  if (!ctx) {
    state.isRendering = false;
    refs.btnRender.disabled = false;
    refs.btnShuffle.disabled = false;
    return;
  }

  try {
    entry.render(ctx, renderW, renderH, hashStr(seed));
  } catch (err) {
    console.error('[better-covers] render failed', err);
  }

  // Crossfade in: the new canvas sits on top (z-index 2) and fades 0→1.
  if (state.activeCanvas && opts.crossfade) {
    state.activeCanvas.classList.add('stage-prev');
  }
  refs.frame.insertBefore(next, refs.progress);
  requestAnimationFrame(() => {
    next.classList.add('is-shown');
  });

  // Finish progress.
  refs.progressFill.style.transition = 'width 200ms ease-out';
  refs.progressFill.style.width = '100%';

  // After the crossfade settles, drop the old canvas and reset progress.
  window.setTimeout(() => {
    if (state.activeCanvas && state.activeCanvas !== next) {
      state.activeCanvas.remove();
    }
    state.activeCanvas = next;
    next.classList.remove('stage-next');
    state.isRendering = false;
    refs.btnRender.disabled = false;
    refs.btnShuffle.disabled = false;
    refs.progress.classList.remove('is-active');
    refs.progressFill.style.transition = 'width 0ms';
    refs.progressFill.style.width = '0%';
  }, 460);
}

/* ------------------------------------------------------------------
   Random seed generator — short evocative wordlists yield seeds like
   `lichtenberg-stormy-creek` rather than `lichtenberg-x7k2p9`. The
   seed is still deterministic because it feeds into hashStr →
   mulberry32, so the same string in produces the same cover out.
   ------------------------------------------------------------------ */
const SHUFFLE_ADJ = [
  'stormy', 'quiet', 'amber', 'cobalt', 'frost', 'iron',
  'velvet', 'paper', 'salt', 'rust', 'pearl', 'umber',
  'feral', 'gilded', 'foggy', 'slate', 'glass', 'jade',
  'molten', 'still', 'wax', 'cinder', 'tide', 'birch',
  'ochre', 'lichen', 'auroral', 'spectral', 'tannic',
];
const SHUFFLE_NOUN = [
  'creek', 'ridge', 'span', 'drift', 'mire', 'bough',
  'crest', 'eddy', 'fold', 'shoal', 'reach', 'cairn',
  'fern', 'wake', 'spar', 'hollow', 'bluff', 'kiln',
  'plate', 'snare', 'seam', 'arc', 'flue', 'ember',
  'lattice', 'marl', 'phloem', 'tundra',
];

function randomSeed(coverId: string): string {
  const a = SHUFFLE_ADJ[Math.floor(Math.random() * SHUFFLE_ADJ.length)];
  const n = SHUFFLE_NOUN[Math.floor(Math.random() * SHUFFLE_NOUN.length)];
  return `${coverId}-${a}-${n}`;
}

function bindStudio(refs: StudioRefs, state: StudioState) {
  refs.btnClose.addEventListener('click', () => refs.dialog.close());

  // Info drawer toggle — flips both the .is-open class (drives the
  // height + opacity transition) and the aria-expanded attribute
  // (drives the chevron rotation via the CSS selector).
  refs.infoTrigger.addEventListener('click', () => {
    const open = refs.info.classList.toggle('is-open');
    refs.infoTrigger.setAttribute('aria-expanded', String(open));
  });

  // Click outside the inner card closes the dialog. Clicking the backdrop
  // sets event.target to the <dialog> itself; clicking any descendant of
  // the inner panel sets it to the descendant.
  refs.dialog.addEventListener('click', (e) => {
    if (e.target === refs.dialog) refs.dialog.close();
  });

  refs.btnRender.addEventListener('click', () => {
    if (!state.active) return;
    const seed = refs.seedInput.value.trim() || state.active.defaultSeed;
    void renderMaster(refs, state, seed, { crossfade: true });
  });

  refs.formatSelect.addEventListener('change', () => {
    if (!state.active) return;
    const seed = refs.seedInput.value.trim() || state.active.defaultSeed;
    void renderMaster(refs, state, seed, { crossfade: true });
  });

  refs.seedInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      refs.btnRender.click();
    }
  });

  refs.btnDownload.addEventListener('click', () => {
    if (!state.activeCanvas || !state.active) return;
    const cleanSeed = (refs.seedInput.value || state.active.defaultSeed)
      .replace(/[^a-z0-9-_]/gi, '_')
      .slice(0, 60);
    const url = state.activeCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `better-covers_${state.active.id}_${cleanSeed}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    refs.btnDownload.classList.add('is-saved');
    if (state.savedTimer !== null) clearTimeout(state.savedTimer);
    state.savedTimer = window.setTimeout(() => {
      refs.btnDownload.classList.remove('is-saved');
      state.savedTimer = null;
    }, 1600);
  });

  refs.btnShuffle.addEventListener('click', () => {
    if (!state.active) return;
    // Avoid repeating the current seed; try up to 6 times before giving up.
    let seed = randomSeed(state.active.id);
    let guard = 0;
    while (seed === refs.seedInput.value && guard++ < 6) {
      seed = randomSeed(state.active.id);
    }
    refs.seedInput.value = seed;

    // Restart the spin animation by removing then re-adding the class
    // around a forced reflow.
    refs.btnShuffle.classList.remove('is-spinning');
    void refs.btnShuffle.offsetWidth;
    refs.btnShuffle.classList.add('is-spinning');

    void renderMaster(refs, state, seed, { crossfade: true });
  });
}

/* ==================================================================
   Boot
   ================================================================== */

export function initGallery() {
  initHero();

  // Slide corner elements out of view on scroll (links on all screens, description on desktop only)
  const brEl = document.querySelector('.corner.br');
  const blEl = document.querySelector('.corner.bl');
  if (brEl || blEl) {
    window.addEventListener(
      'scroll',
      () => {
        const scrolled = window.scrollY > 20;
        const isMobile = window.innerWidth <= 720;

        if (brEl) {
          if (scrolled) brEl.classList.add('scrolled');
          else brEl.classList.remove('scrolled');
        }
        if (blEl) {
          if (scrolled && !isMobile) blEl.classList.add('scrolled');
          else blEl.classList.remove('scrolled');
        }
      },
      { passive: true }
    );
  }

  const studioRefs = bootStudio();
  if (!studioRefs) {
    // Dialog markup missing — fall back to lazy gallery only.
    initGalleryRenderers(() => { });
    return;
  }
  const studioState: StudioState = {
    active: null,
    activeCanvas: null,
    isRendering: false,
    savedTimer: null,
  };
  bindStudio(studioRefs, studioState);

  initGalleryRenderers((entry) => openStudio(studioRefs, studioState, entry));
}
