/**
 * 15 · ASCII landscape — 4× supersampled scene → γ-corrected glyph mosaic
 *
 * A right-anchored procedural landscape — sun, radiating rays, hills, a
 * small tree cluster, a reflection pillar on water, foreground rocks and
 * grass — is drawn into a 4× supersampled offscreen canvas on the right
 * two-thirds of the frame. The left third is hard-masked to pure black.
 * Each 7 × 11 output cell is averaged into one luminance value;
 * γ = 0.55 maps luminance into a 16-character ramp.
 *
 * The ramp is built dynamically from the post's own title: up to six unique
 * letters from `title.toLowerCase()` are spliced into the mid-density band
 * of the base ramp `" .·-:;+=ixokXM@#"`, so each cover's grain reads as a
 * scrambled fingerprint of its own headline.
 *
 * References
 * - The ASCII art tradition long predates computers: see typewriter art of
 *   the 1900s and figlet/banner-style line printer art of the 1970s–80s.
 * - P. D. Burford, "ASCII Art Programs and Reduction Algorithms"
 *   (textfiles.com archive) — early discussion of brightness-ramp rendering.
 * - Lance Olsen et al., aalib (1997) — the canonical libre brightness-ramp
 *   ASCII renderer.
 *
 * @module renderers/ascii
 */

import { mulberry32, fbm, type Renderer } from "../shared";

const ASCII_CELL_W = 7;
const ASCII_CELL_H = 11;
const ASCII_SS = 4;
const ASCII_RAMP_BASE = " .·-:;+=ixokXM@#";

/**
 * Build the brightness ramp by splicing up to six unique title letters
 * (lower-cased, a–z only) into the mid-density band of the base ramp.
 */
function buildAsciiRamp(title: string): string {
  const seen = new Set<string>();
  const extra: string[] = [];
  for (const ch of title.toLowerCase()) {
    if (/[a-z]/.test(ch) && !seen.has(ch)) {
      seen.add(ch);
      extra.push(ch);
      if (extra.length >= 6) break;
    }
  }
  const arr = ASCII_RAMP_BASE.split("");
  for (let i = 0; i < extra.length; i++) arr.splice(7 + i * 2, 0, extra[i]);
  return arr.join("");
}

/**
 * Paint the supersampled monochrome landscape that the glyph mosaic samples.
 * White-on-black so we can read the luminance straight off the red channel
 * later.
 */
function drawAsciiScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  seed: number,
): void {
  const rand = mulberry32(seed);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  const horizon = H * 0.58;
  const sceneLeft = W * 0.4;
  const sceneRight = W;

  const sunX = W * (0.74 + rand() * 0.06);
  const sunY = H * (0.46 + rand() * 0.04);
  const sunR = H * 0.035;

  // 1. Radiating sun rays — mostly upper hemisphere.
  const RAYS = 75;
  for (let i = 0; i < RAYS; i++) {
    const a = -Math.PI + rand() * Math.PI * 1.15;
    const envelope =
      0.45 + fbm(Math.cos(a) * 4, Math.sin(a) * 4, seed + 7) * 0.55;
    const len = sunR * (2.5 + envelope * 22);
    const inner = sunR * 1.05;
    const x1 = sunX + Math.cos(a) * inner;
    const y1 = sunY + Math.sin(a) * inner;
    const x2 = sunX + Math.cos(a) * (inner + len);
    const y2 = sunY + Math.sin(a) * (inner + len);
    const grd = ctx.createLinearGradient(x1, y1, x2, y2);
    grd.addColorStop(0, "rgba(255,255,255,1.0)");
    grd.addColorStop(0.7, "rgba(255,255,255,0.85)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = grd;
    ctx.lineWidth = 2.0 + rand() * 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // 2. Sun disk.
  const sunGrd = ctx.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    sunR * 1.2,
  );
  sunGrd.addColorStop(0, "#ffffff");
  sunGrd.addColorStop(0.7, "#ffffff");
  sunGrd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sunGrd;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // 3. Hills — atmospheric back ridge + silhouetted front ridge.
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.beginPath();
  ctx.moveTo(sceneLeft, horizon);
  for (let x = sceneLeft; x <= sceneRight; x += 1) {
    const h =
      horizon -
      1 -
      fbm(x * 0.018, 1.2, seed + 53, 3) * H * 0.05 -
      fbm(x * 0.006, 3.0, seed + 67, 2) * H * 0.04;
    ctx.lineTo(x, h);
  }
  ctx.lineTo(sceneRight, horizon);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.moveTo(sceneLeft, horizon);
  for (let x = sceneLeft; x <= sceneRight; x += 1) {
    const h = horizon - 1 - fbm(x * 0.045, 0.7, seed + 31, 3) * H * 0.05;
    ctx.lineTo(x, h);
  }
  ctx.lineTo(sceneRight, horizon);
  ctx.closePath();
  ctx.fill();

  // 4. Midground tree cluster — past the left mask so they survive.
  const treeBaseY = horizon - 0.5;
  const trees: { x: number; h: number; w: number }[] = [
    { x: W * 0.52, h: H * 0.22, w: W * 0.04 },
    { x: W * 0.555, h: H * 0.28, w: W * 0.05 },
    { x: W * 0.59, h: H * 0.21, w: W * 0.042 },
    { x: W * 0.62, h: H * 0.16, w: W * 0.034 },
  ];
  for (const t of trees) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(t.x - 1.0, treeBaseY - t.h * 0.55, 2.0, t.h * 0.6);
    const crownY = treeBaseY - t.h * 0.7;
    const SPECKS = 110;
    for (let i = 0; i < SPECKS; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = Math.sqrt(rand());
      const ex = t.x + Math.cos(ang) * rad * t.w;
      const ey = crownY + Math.sin(ang) * rad * t.h * 0.55;
      const alpha = 0.85 - rad * 0.4;
      if (alpha <= 0) continue;
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.fillRect(ex - 1, ey - 1, 2, 2);
    }
  }

  // 5. Water gradient.
  const water = ctx.createLinearGradient(0, horizon, 0, H);
  water.addColorStop(0, "#181818");
  water.addColorStop(0.4, "#0a0a0a");
  water.addColorStop(1, "#000000");
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, W, H - horizon);

  // 6. Reflection pillar — vertical bright band broken into ripples.
  const pillarHalfWidth = sunR * 1.4;
  {
    let y = horizon;
    while (y < H) {
      const depth = (y - horizon) / (H - horizon);
      const bandH = 1 + Math.floor(rand() * 2);
      const gapH = 2 + Math.floor(depth * 5 + rand() * 3);
      const widen = 1 + depth * 1.8;
      const halfW = pillarHalfWidth * widen;
      const a = (1 - depth) * 0.7;
      if (a > 0.04) {
        const grd = ctx.createLinearGradient(sunX - halfW, 0, sunX + halfW, 0);
        grd.addColorStop(0, "rgba(255,255,255,0)");
        grd.addColorStop(0.5, `rgba(255,255,255,${a.toFixed(3)})`);
        grd.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(sunX - halfW, y, halfW * 2, bandH);
      }
      y += bandH + gapH;
    }
  }

  // 7. Surface striations — sparser with depth.
  for (let y = Math.floor(horizon); y < H; y++) {
    const depth = (y - horizon) / (H - horizon);
    const skip = 1 + Math.floor(depth * 3);
    if ((y - Math.floor(horizon)) % (1 + skip) !== 0) continue;
    const a = 0.13 - depth * 0.1;
    if (a <= 0) continue;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.fillRect(sceneLeft, y, sceneRight - sceneLeft, 1);
  }

  // 8. Foreground rocks.
  const rocks = 7;
  for (let i = 0; i < rocks; i++) {
    const rx = sceneLeft + W * (0.1 + rand() * 0.85);
    const ry = horizon + (H - horizon) * (0.55 + rand() * 0.4);
    const rw = 2.5 + rand() * 3.5;
    const rh = rw * (0.4 + rand() * 0.35);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(rx - rw * 0.7, ry - rh * 0.9, rw * 1.4, 0.7);
  }

  // 9. Foreground grass tufts.
  const grassY = H - 1.5;
  for (let x = sceneLeft + 2; x < sceneRight; x += 1.5) {
    const tuft = fbm(x * 0.35, 0, seed + 91, 2);
    if (tuft < 0.48) continue;
    const h = 1.5 + tuft * 4;
    ctx.fillStyle = `rgba(255,255,255,${(0.2 + tuft * 0.3).toFixed(3)})`;
    ctx.fillRect(x, grassY - h, 0.8, h);
  }

  // 10. Left-side hard mask — pure black title zone.
  const mask = ctx.createLinearGradient(0, 0, W * 0.48, 0);
  mask.addColorStop(0, "#000000");
  mask.addColorStop(0.75, "#000000");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, W * 0.48, H);

  // 11. Right-side vignette.
  const vig = ctx.createRadialGradient(
    W * 0.72,
    H * 0.45,
    H * 0.2,
    W * 0.72,
    H * 0.45,
    H * 1.0,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

/**
 * ASCII landscape renderer factory. Pass a title string and you get back a
 * standard {@link Renderer}; the title characters are mixed into the
 * brightness ramp so the cover's typography becomes part of its own grain.
 *
 * Requires a DOM (uses `document.createElement('canvas')`) — for SSR or
 * Node-only environments, use a polyfilled `OffscreenCanvas`.
 */
export function renderAsciiWith(title: string): Renderer {
  return (ctx, W, H, SEED) => {
    const cols = Math.floor(W / ASCII_CELL_W);
    const rows = Math.floor(H / ASCII_CELL_H);

    // 1. Draw scene into a supersampled offscreen canvas.
    const sceneW = cols * ASCII_SS;
    const sceneH = rows * ASCII_SS;
    const off = document.createElement("canvas");
    off.width = sceneW;
    off.height = sceneH;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    drawAsciiScene(offCtx, sceneW, sceneH, SEED);
    const big = offCtx.getImageData(0, 0, sceneW, sceneH).data;

    // 2. Down-sample by averaging SS × SS blocks into per-cell luminance.
    //    Scene is monochrome (white-on-black), so R ≈ G ≈ B; sample R only.
    const lum = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let acc = 0;
        for (let dy = 0; dy < ASCII_SS; dy++) {
          for (let dx = 0; dx < ASCII_SS; dx++) {
            const si = ((r * ASCII_SS + dy) * sceneW + (c * ASCII_SS + dx)) * 4;
            acc += big[si];
          }
        }
        lum[r * cols + c] = acc / (ASCII_SS * ASCII_SS) / 255;
      }
    }

    // 3. Render the character mosaic at full resolution.
    ctx.fillStyle = "#08090b";
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${ASCII_CELL_H - 1}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";

    const ramp = buildAsciiRamp(title);
    const rampLen = ramp.length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const l = lum[r * cols + c];
        if (l < 0.025) continue;
        // γ = 0.55 boost — pulls sub-pixel structure into mid-density glyphs.
        const idx = Math.min(
          rampLen - 1,
          Math.floor(Math.pow(l, 0.55) * rampLen),
        );
        const ch = ramp[idx];
        if (ch === " ") continue;
        const a = (0.35 + l * 0.55).toFixed(3);
        ctx.fillStyle = `rgba(232,220,195,${a})`;
        ctx.fillText(ch, c * ASCII_CELL_W, r * ASCII_CELL_H);
      }
    }
  };
}

/** Default ASCII renderer with a generic title-derived ramp. */
export const renderAscii: Renderer = renderAsciiWith("ASCII Landscape");
