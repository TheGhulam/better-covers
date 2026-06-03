/**
 * Dot-shimmer loader for gallery covers.
 *
 * A small stack of <canvas> layers, each painting the same dot grid at
 * independent random per-dot brightness, cross-fade their opacity on staggered
 * CSS keyframes. Because the lit/dim pattern differs per layer, the crossfade
 * reads as a per-dot twinkle; because it animates `opacity` on the compositor
 * thread, it keeps shimmering even while the cover's heavy *synchronous* render
 * blocks the main thread — the failure mode of a requestAnimationFrame loop,
 * which would freeze solid during that ~hundreds-of-ms block.
 *
 * This replaces an earlier DOM-cell grid-reveal that spawned hundreds of
 * layer-promoted <div>s per cover. Here each layer is drawn once (no per-frame
 * JS), the whole overlay is removed on cleanup, and the shimmer is purely
 * decorative (monochrome, no cover sampling) — so there is no getImageData, no
 * sampler canvas, no shadowBlur, and no animation loop to leak.
 *
 * Two-phase by design: `startReveal` builds the overlay and starts the CSS
 * twinkle *immediately* — before the caller runs its heavy render — so a slot
 * never shows a bare dark box. The caller invokes the returned `finish()` once
 * its render has painted; the overlay honors a minimum hold then fades out.
 */

export interface RevealOptions {
  /** distance between dot centers, display px */
  gap: number;
  /** base dot radius, display px */
  radius: number;
  /** number of stacked twinkle layers (more = smoother, slightly heavier) */
  layers: number;
  /** one twinkle cycle per layer, ms */
  twinkleMs: number;
  /** minimum shimmer time before the fade-out may start, ms */
  minHoldMs: number;
  /** whole-overlay fade-out duration, ms */
  fadeMs: number;
  /** dot color (any CSS color the canvas accepts) */
  dotColor: string;
}

// Tuned to the site's dark, minimal aesthetic. `dotColor` defaults to the site
// `--fg-dim` variable resolved at reveal time (see startReveal); the literal
// here is only a fallback if that variable is somehow absent.
const DEFAULTS: RevealOptions = {
  gap: 14,
  radius: 2,
  layers: 3,
  twinkleMs: 1400,
  minHoldMs: 700,
  fadeMs: 500,
  dotColor: '#6a6863', // --fg-dim
};

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type RGB = [number, number, number];

/** Parse #rgb / #rrggbb / rgb()/rgba() into an [r,g,b] triple. */
function parseRGB(color: string): RGB {
  const s = color.trim();
  if (s[0] === '#') {
    const hex = s.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const m = s.match(/(\d+(?:\.\d+)?)/g);
  if (m && m.length >= 3) {
    return [Number(m[0]), Number(m[1]), Number(m[2])];
  }
  return [106, 104, 99]; // --fg-dim fallback
}

/** Resolve a CSS custom property off :root, or null if unset. */
function resolveVar(name: string): string | null {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || null;
}

/** Handle returned by startReveal; call `finish()` when the cover has painted. */
export interface RevealHandle {
  finish(): void;
}

const NOOP_HANDLE: RevealHandle = { finish() {} };

/**
 * Begin the dot-shimmer over a slot whose cover is about to be (or is being)
 * rendered. Removes `.loading`, settles the slot into view, and starts the
 * compositor-driven twinkle immediately so the slot never shows as a bare dark
 * box — and so the motion survives the cover's synchronous render. Returns a
 * handle; call `finish()` once the cover canvas has painted to fade the overlay
 * out (after a minimum hold) and clean it up.
 *
 * No-op-safe: on reduced motion or a zero-size slot it shows the cover
 * immediately and returns a no-op handle.
 */
export function startReveal(
  slot: HTMLElement,
  canvas: HTMLCanvasElement,
  opts: Partial<RevealOptions> = {},
): RevealHandle {
  const o: RevealOptions = { ...DEFAULTS, ...opts };

  slot.classList.remove('loading');

  // Reduced motion, or no measurable box yet → just reveal the cover.
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  if (prefersReducedMotion() || W === 0 || H === 0) {
    slot.classList.add('in');
    return NOOP_HANDLE;
  }

  // `.revealing` pins the slot to its visible end-state with no transition, so
  // the shimmer plays on a settled slot rather than fighting the .in fade/slide.
  slot.classList.add('in', 'revealing');

  // Resolve the dot color once. Single-theme dark site, so no change observer.
  const dot = parseRGB(resolveVar('--fg-dim') ?? o.dotColor);
  const bg = resolveVar('--bg') ?? '#0a0a0a';

  const overlay = document.createElement('div');
  overlay.className = 'grid-reveal';
  // Paint the dark backdrop on the element itself, so the first frame (and the
  // gaps between dots) masks the unrendered cover beneath with no flash.
  overlay.style.background = bg;

  // Dot grid geometry (shared by every layer). Offset every other row for an
  // organic, non-gridded feel.
  const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2);
  const cols = Math.ceil(W / o.gap);
  const rows = Math.ceil(H / o.gap);
  const layerCount = Math.max(1, Math.round(o.layers));

  let built = 0;
  for (let l = 0; l < layerCount; l++) {
    const layer = document.createElement('canvas');
    const ctx = layer.getContext('2d');
    if (!ctx) continue;
    layer.width = Math.max(1, Math.round(W * dpr));
    layer.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Paint this layer's dots once, each at an independent random brightness so
    // the layers hold *different* lit/dim patterns. Cross-fading them then
    // makes individual dots brighten and dim out of sync — the twinkle.
    // Range chosen so most dots stay subdued but the brightest ones can reach
    // a strong peak (close to the dim foreground color) during their cycle.
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const x = col * o.gap + (row % 2 === 0 ? 0 : o.gap * 0.5);
        const y = row * o.gap;
        const alpha = 0.12 + Math.random() * 0.68; // 0.12 .. 0.80  (even brighter peaks)
        ctx.fillStyle = `rgba(${dot[0]}, ${dot[1]}, ${dot[2]}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, o.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Stagger each layer's opacity cycle evenly across the period so coverage
    // stays continuous (the field never blacks out between peaks). Pure
    // `opacity` keyframes → compositor-driven → immune to main-thread jank.
    const delay = -(o.twinkleMs / layerCount) * l; // negative = already in phase
    layer.style.animation =
      `bcTwinkle ${o.twinkleMs}ms ${delay}ms ease-in-out infinite`;
    overlay.appendChild(layer);
    built++;
  }

  if (built === 0) {
    // Canvas unavailable → skip the shimmer, just show the cover.
    slot.classList.add('in');
    slot.classList.remove('revealing');
    return NOOP_HANDLE;
  }

  slot.appendChild(overlay);

  const start = performance.now();
  let finishing = false;

  return {
    finish() {
      if (finishing) return;
      finishing = true;
      // Honor the minimum shimmer hold even if the cover painted instantly,
      // then fade the whole overlay out (the layers keep twinkling through the
      // fade since overlay opacity simply multiplies theirs) and tear it down.
      const elapsed = performance.now() - start;
      const wait = Math.max(0, o.minHoldMs - elapsed);
      window.setTimeout(() => {
        overlay.style.transition = `opacity ${o.fadeMs}ms var(--ease-out)`;
        overlay.style.opacity = '0';
        window.setTimeout(() => {
          overlay.remove();
          slot.classList.remove('revealing');
        }, o.fadeMs + 40);
      }, wait);
    },
  };
}
