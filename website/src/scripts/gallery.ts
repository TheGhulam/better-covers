/**
 * Home-page interactivity:
 *  1. Animate a one-shot Conway's Life reveal into the hero canvas.
 *  2. Lazily render each gallery cover as it enters the viewport.
 *  3. Cache rendered PNGs in sessionStorage so re-scrolling is instant.
 */

import { COVERS } from '../covers/catalog';
import { hashStr, mulberry32 } from '../covers/shared';

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

  const genLabel = document.getElementById('hero-gen');
  const cap = document.getElementById('hero-cap');
  if (!genLabel || !cap) return;

  paint();

  if (REDUCED_MOTION) {
    for (let i = 0; i < TOTAL; i++) step();
    paint();
    genLabel.textContent = String(TOTAL);
    cap.classList.add('frozen');
    cap.innerHTML = `<span class="dot"></span>stabilized · generation ${TOTAL} · B3/S23`;
    return;
  }

  let gen = 0;
  const tick = () => {
    step();
    gen++;
    paint();
    genLabel.textContent = String(gen);
    if (gen < TOTAL) {
      setTimeout(tick, 130);
    } else {
      cap.classList.add('frozen');
      cap.innerHTML = `<span class="dot"></span>stabilized · generation ${gen} · B3/S23`;
    }
  };
  setTimeout(tick, 600);
}

/* ------------------------------------------------------------------
   Gallery — IntersectionObserver triggers each slot's render once,
   then caches a JPEG dataURL in sessionStorage so a re-render after
   a fast scroll back doesn't re-pay the compute cost.
   ------------------------------------------------------------------ */
function initGalleryRenderers() {
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

  slots.forEach((s) => io.observe(s));
}

export function initGallery() {
  initHero();
  initGalleryRenderers();
}
