/**
 * 23 · Brian's Brain — 3-state cellular automaton snapshot
 *
 * Off / firing / refractory states on a toroidal grid. Firing cells become
 * refractory; off cells ignite when exactly two neighbors are firing. A short
 * run yields glider-rich filaments on a dark field.
 *
 * References
 * - Brian Callahan, 1996 (popularization of the rule).
 *
 * @module renderers/brians-brain
 */

import { addGrain, addVignette, mulberry32, type Renderer } from "../shared";

const CELL = 6;
const GENS = 48;
const DENSITY = 0.1;

export const renderBriansBrain: Renderer = (ctx, W, H, SEED) => {
  const rand = mulberry32(SEED);
  const cols = (W / CELL) | 0;
  const rows = (H / CELL) | 0;
  let grid = new Uint8Array(cols * rows);

  for (let i = 0; i < grid.length; i++) {
    grid[i] = rand() < DENSITY ? 1 : 0;
  }

  const at = (g: Uint8Array, x: number, y: number) =>
    g[((y + rows) % rows) * cols + ((x + cols) % cols)];

  for (let gen = 0; gen < GENS; gen++) {
    const next = new Uint8Array(grid.length);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const s = at(grid, x, y);
        let firing = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx || dy) firing += at(grid, x + dx, y + dy) === 1 ? 1 : 0;
          }
        }
        if (s === 0) next[y * cols + x] = firing === 2 ? 1 : 0;
        else if (s === 1) next[y * cols + x] = 2;
        else next[y * cols + x] = 0;
      }
    }
    grid = next;
  }

  ctx.fillStyle = "#060810";
  ctx.fillRect(0, 0, W, H);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const s = grid[y * cols + x];
      if (s === 1) ctx.fillStyle = "#8098b8";
      else if (s === 2) ctx.fillStyle = "#506878";
      else continue;
      ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
    }
  }

  addVignette(ctx, W, H);
  addGrain(ctx, W, H, 10);
};
