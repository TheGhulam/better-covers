/**
 * 17 · Space colonization — branch growth
 *
 * Random attractor points in the canopy; branch tips extend toward the
 * nearest attractor until influence zones collapse.
 *
 * References
 * - A. Runions, B. Lane & P. Prusinkiewicz, *Modeling Trees with a Space
 *   Colonization Algorithm*, Eurographics Workshop on Natural Phenomena (2007).
 *
 * @module renderers/space-colonization
 */

import {
  addGrain,
  addVignette,
  mulberry32,
  rgb,
  type Renderer,
} from "../shared";

type Node = { x: number; y: number; parent: number };

export const renderSpaceColonization: Renderer = (ctx, W, H, SEED) => {
  const r = mulberry32(SEED);
  const scale = Math.min(W, H) / 630;
  const trunkX = W * (0.38 + ((SEED % 997) / 997) * 0.24);

  ctx.fillStyle = rgb(10, 12, 8);
  ctx.fillRect(0, 0, W, H);

  const attractors: { x: number; y: number; alive: boolean }[] = [];
  const count = Math.max(
    12,
    Math.floor((90 + Math.floor(r() * 40) + (SEED % 17)) * scale),
  );
  const cx = W * 0.5;
  const cy = H * 0.35;
  const rot = ((SEED % 6283) / 6283) * Math.PI * 2 + SEED * 0.0001;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);
  for (let i = 0; i < count; i++) {
    const ax = W * (0.12 + r() * 0.76) - cx;
    const ay = H * (0.08 + r() * 0.55) - cy;
    attractors.push({
      x: cx + ax * cosR - ay * sinR,
      y: cy + ax * sinR + ay * cosR,
      alive: true,
    });
  }

  const nodes: Node[] = [{ x: trunkX, y: H * 0.94, parent: -1 }];
  const step = Math.max(2, 7 * scale);
  const kill = Math.max(3, 10 * scale);
  const maxIter = Math.max(80, Math.floor(220 * scale));

  for (let iter = 0; iter < maxIter; iter++) {
    const nearest = new Int32Array(attractors.length).fill(-1);
    const dist = new Float32Array(attractors.length).fill(Infinity);

    for (let ni = 0; ni < nodes.length; ni++) {
      const n = nodes[ni];
      for (let ai = 0; ai < attractors.length; ai++) {
        if (!attractors[ai].alive) continue;
        const dx = attractors[ai].x - n.x;
        const dy = attractors[ai].y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < dist[ai]) {
          dist[ai] = d2;
          nearest[ai] = ni;
        }
      }
    }

    const growth = new Map<number, { x: number; y: number; w: number }>();
    for (let ai = 0; ai < attractors.length; ai++) {
      if (!attractors[ai].alive || nearest[ai] < 0) continue;
      const n = nodes[nearest[ai]];
      const dx = attractors[ai].x - n.x;
      const dy = attractors[ai].y - n.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const key = nearest[ai];
      const prev = growth.get(key);
      const nx = dx / len;
      const ny = dy / len;
      if (!prev) growth.set(key, { x: nx, y: ny, w: 1 });
      else {
        growth.set(key, {
          x: prev.x + nx,
          y: prev.y + ny,
          w: prev.w + 1,
        });
      }
    }

    if (growth.size === 0) break;

    for (const [pi, g] of growth) {
      const p = nodes[pi];
      const len = Math.sqrt(g.x * g.x + g.y * g.y) || 1;
      nodes.push({
        x: p.x + (g.x / len) * step,
        y: p.y + (g.y / len) * step,
        parent: pi,
      });
    }

    for (let ai = 0; ai < attractors.length; ai++) {
      if (!attractors[ai].alive) continue;
      for (let ni = 0; ni < nodes.length; ni++) {
        const dx = attractors[ai].x - nodes[ni].x;
        const dy = attractors[ai].y - nodes[ni].y;
        if (dx * dx + dy * dy < kill * kill) {
          attractors[ai].alive = false;
          break;
        }
      }
    }
  }

  ctx.lineCap = "round";
  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i];
    const p = nodes[n.parent];
    const depth = n.y / H;
    ctx.strokeStyle = rgb(
      127 + (212 - 127) * (1 - depth),
      141 + (165 - 141) * (1 - depth),
      127 + (90 - 127) * (1 - depth),
      0.62 + (1 - depth) * 0.38,
    );
    ctx.lineWidth = Math.max(0.8, 3.2 * scale * (1 - depth * 0.85));
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(n.x, n.y);
    ctx.stroke();
  }

  addVignette(ctx, W, H, 0.42);
  addGrain(ctx, W, H, 10);
};
