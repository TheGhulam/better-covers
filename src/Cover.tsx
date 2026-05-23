"use client";

/**
 * `<Cover />` — a deterministic 1200 × 630 OG-image canvas with a
 * Power-Graph-style title overlay.
 *
 * Pass a `render` function from any of the renderers in `./renderers`,
 * a string `seed` (typically the post slug), and the title text. The
 * canvas is fixed at the OG aspect ratio (1200 × 630) and scales
 * responsively. CSS container queries on `.pg-title` size the type
 * relative to the cover, so the same overlay looks right at any width.
 *
 * @module Cover
 */

import { useEffect, useRef } from "react";
import { hashStr, type Renderer } from "./shared";

export interface CoverProps {
  /** The renderer — `(ctx, W, H, seed) => void`. */
  render: Renderer;
  /** Large serif title shown bottom-left. */
  title: string;
  /** One muted line under the title. */
  subtitle: string;
  /**
   * Deterministic seed string — typically the post slug. The same seed
   * always paints the same pixels.
   */
  seed: string;
  /** Use dark text — for light-background covers (Penrose, Clifford, etc.). */
  dark?: boolean;
  /** Optional class on the outer wrapper. */
  className?: string;
}

export function Cover({
  render,
  title,
  subtitle,
  seed,
  dark,
  className,
}: CoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    render(ctx, canvas.width, canvas.height, hashStr(seed));
  }, [render, seed]);

  return (
    <div className={`pg-cover${className ? " " + className : ""}`}>
      <canvas ref={canvasRef} width={1200} height={630} />
      <div className={`pg-title${dark ? " dark" : ""}`}>
        <div className="t">{title}</div>
        <div className="s">{subtitle}</div>
      </div>
    </div>
  );
}
