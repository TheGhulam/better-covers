/**
 * 14 · Conway's Game of Life — B3/S23 snapshot with bottom alpha falloff
 *
 * Seed a 120 × 63 grid with 32 % density from the slug hash, run twenty-two
 * generations of Conway's 1970 B3/S23 rule under wraparound (toroidal)
 * boundaries, and freeze. Surviving cells are colored amber at the centre,
 * fading to slate at the edges. A smoothstep alpha falloff from y = 0.67·H
 * to y = 0.95·H fades cells out under any title that lives in the bottom
 * third of the canvas — the v2 legibility fix.
 *
 * The snapshot is deterministic in the seed but never the same twice across
 * different posts.
 *
 * References
 * - M. Gardner, "Mathematical Games: The fantastic combinations of John
 *   Conway's new solitaire game 'life'," *Scientific American* 223:4,
 *   120–123 (October 1970) — the original publication.
 * - The B3/S23 rule notation: a cell is born (B) if it has exactly 3
 *   neighbors; it survives (S) on 2 or 3 neighbors; otherwise it dies.
 *
 * @module renderers/life
 */

import { mulberry32, type Renderer } from "../shared";

const LIFE_CELL_PX = 10;
const LIFE_GENERATIONS = 22;
const LIFE_INITIAL_DENSITY = 0.32;
const LIFE_FADE_START = 0.67;
const LIFE_FADE_END = 0.95;

/**
 * Smoothstep alpha falloff in the bottom band of the canvas: 1.0 above
 * `LIFE_FADE_START`, 0.0 below `LIFE_FADE_END`, cubic Hermite between.
 * Keeps the title area visually clean regardless of where the simulation
 * happens to settle.
 */
function legibilityAlpha(yNorm: number): number {
  if (yNorm <= LIFE_FADE_START) return 1;
  if (yNorm >= LIFE_FADE_END) return 0;
  const t = (yNorm - LIFE_FADE_START) / (LIFE_FADE_END - LIFE_FADE_START);
  return 1 - t * t * (3 - 2 * t); // smoothstep
}

export const renderLife: Renderer = (ctx, W, H, SEED) => {
  const rand = mulberry32(SEED);

  const cols = Math.floor(W / LIFE_CELL_PX);
  const rows = Math.floor(H / LIFE_CELL_PX);

  let grid = new Uint8Array(cols * rows);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = rand() < LIFE_INITIAL_DENSITY ? 1 : 0;
  }

  // Toroidal indexing: edges wrap to opposite edges. Cheaper than special-
  // casing the border for a 22-generation snapshot.
  const at = (g: Uint8Array, x: number, y: number) =>
    g[((y + rows) % rows) * cols + ((x + cols) % cols)];

  for (let gen = 0; gen < LIFE_GENERATIONS; gen++) {
    const next = new Uint8Array(grid.length);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx || dy) n += at(grid, x + dx, y + dy);
          }
        }
        const alive = at(grid, x, y);
        next[y * cols + x] = alive
          ? n === 2 || n === 3
            ? 1
            : 0
          : n === 3
            ? 1
            : 0;
      }
    }
    grid = next;
  }

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  const centerR = 200;
  const centerG = 136;
  const centerB = 74; // warm amber
  const edgeR = 60;
  const edgeG = 78;
  const edgeB = 95; // cool slate

  for (let y = 0; y < rows; y++) {
    const yPx = y * LIFE_CELL_PX + LIFE_CELL_PX / 2;
    const fade = legibilityAlpha(yPx / H);
    if (fade <= 0) continue;
    for (let x = 0; x < cols; x++) {
      if (!grid[y * cols + x]) continue;
      const dx = (x - cols / 2) / cols;
      const dy = (y - rows / 2) / rows;
      const t = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 1.6);
      const r = Math.round(centerR + (edgeR - centerR) * t);
      const g = Math.round(centerG + (edgeG - centerG) * t);
      const b = Math.round(centerB + (edgeB - centerB) * t);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fade.toFixed(3)})`;
      ctx.fillRect(
        x * LIFE_CELL_PX + 1,
        y * LIFE_CELL_PX + 1,
        LIFE_CELL_PX - 2,
        LIFE_CELL_PX - 2,
      );
    }
  }
};
