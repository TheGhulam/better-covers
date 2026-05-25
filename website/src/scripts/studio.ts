/**
 * Studio-page interactivity:
 *  - seed input (Enter to render)
 *  - renderer dropdown
 *  - randomize / render / download buttons
 *  - spinner overlay for renderers with approxMs > 500
 *  - deep-link via ?cover=<id>&seed=<value>
 */

import { COVERS, type CoverEntry } from '../covers/catalog';
import { hashStr } from '../covers/shared';

export function initStudio() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  const seedInput = document.getElementById('seed') as HTMLInputElement;
  const spinner = document.getElementById('spinner') as HTMLElement;
  const dd = document.getElementById('dd') as HTMLElement;
  const ddBtn = document.getElementById('dd-btn') as HTMLButtonElement;
  const ddMenu = document.getElementById('dd-menu') as HTMLElement;
  const mNum = document.getElementById('m-num') as HTMLElement;
  const mTitle = document.getElementById('m-title') as HTMLElement;
  const mSeed = document.getElementById('m-seed') as HTMLElement;
  const ddNum = document.getElementById('dd-num') as HTMLElement;
  const ddTitle = document.getElementById('dd-title') as HTMLElement;
  const blurb = document.getElementById('blurb') as HTMLElement;
  const blurbMeta = document.getElementById('blurb-meta') as HTMLElement;
  const spinnerEst = document.getElementById('spinner-est') as HTMLElement;

  /* ---------- deep-link resolution ---------- */
  let current: CoverEntry = COVERS[0]!;
  const params = new URLSearchParams(location.search);
  const reqCover = params.get('cover');
  const reqSeed = params.get('seed');
  if (reqCover) {
    const f = COVERS.find((c) => c.id === reqCover);
    if (f) current = f;
  }
  if (reqSeed) seedInput.value = reqSeed;

  /* ---------- syncs the entire UI to `current` ---------- */
  function syncUI() {
    ddNum.textContent = current.num;
    ddTitle.textContent = current.title;
    mNum.textContent = current.num;
    mTitle.textContent = current.title;
    mSeed.textContent = seedInput.value || current.defaultSeed;
    blurb.textContent = current.body;
    blurbMeta.textContent = current.refs;
    spinnerEst.textContent = '~' + Math.max(1, Math.round(current.approxMs / 1000)) + 's';
    ddMenu.querySelectorAll<HTMLElement>('.dropdown-item').forEach((i) => {
      i.classList.toggle('active', i.dataset.id === current.id);
    });
  }

  /* ---------- the actual paint ---------- */
  function render() {
    const seed = seedInput.value || current.defaultSeed;
    mSeed.textContent = seed;
    // Heavy renderers (Sandpile, Karman, Clifford, Gray-Scott) block the
    // main thread for 1–2 s; show the spinner so the click feels responsive.
    if (current.approxMs > 500) {
      spinner.classList.add('on');
      // A 30 ms beat gives the browser one paint to actually display the
      // spinner before we block on canvas work.
      setTimeout(() => {
        try {
          current.render(ctx!, W, H, hashStr(seed));
        } finally {
          spinner.classList.remove('on');
        }
      }, 30);
    } else {
      current.render(ctx!, W, H, hashStr(seed));
    }
  }

  /* ---------- dropdown ---------- */
  ddBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dd.classList.toggle('open');
    ddBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!dd.contains(e.target as Node)) {
      dd.classList.remove('open');
      ddBtn.setAttribute('aria-expanded', 'false');
    }
  });
  ddMenu.querySelectorAll<HTMLElement>('.dropdown-item').forEach((item) => {
    const handler = () => {
      const id = item.dataset.id;
      const found = COVERS.find((c) => c.id === id);
      if (!found) return;
      current = found;
      seedInput.value = current.defaultSeed;
      dd.classList.remove('open');
      ddBtn.setAttribute('aria-expanded', 'false');
      syncUI();
      render();
    };
    item.addEventListener('click', handler);
    item.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });

  /* ---------- controls ---------- */
  document.getElementById('render')?.addEventListener('click', render);

  document.getElementById('randomize')?.addEventListener('click', () => {
    const suffix = Math.random().toString(36).slice(2, 10);
    seedInput.value = `${current.id}-${suffix}`;
    render();
  });

  seedInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      render();
    }
  });

  document.getElementById('download')?.addEventListener('click', () => {
    const seed = seedInput.value || current.defaultSeed;
    const a = document.createElement('a');
    a.download = `${current.id}-${seed}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  /* ---------- first paint ---------- */
  syncUI();
  render();
}
