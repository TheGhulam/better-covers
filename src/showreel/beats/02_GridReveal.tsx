import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, ACCENT, BEATS, FG, DIM } from "../video-config";
import { COVERS, Cover } from "../lib/covers";
import { sourceSerif4, geist, jetBrainsMono, shantellSans } from "../fonts";
import { useBassPulse } from "../lib/useBassPulse";

const TEXT = "every cover is uniquely generated";
const TYPE_START = 8;
const FRAMES_PER_CHAR = 1.5;

function getTypedText(frame: number): string {
  const chars = Math.min(TEXT.length, Math.max(0, Math.floor((frame - TYPE_START) / FRAMES_PER_CHAR)));
  return TEXT.slice(0, chars);
}

function cursorVisible(frame: number): boolean {
  return Math.floor(frame / 12) % 2 === 0;
}

const GRID_WIDTH = 1600;
const CELL_ASPECT = 1200 / 630; // ~1.905
const COLS = 4;
const ROWS = 4;
const GAP = 16;

const CELL_W = (GRID_WIDTH - GAP * (COLS - 1)) / COLS;
const CELL_H = CELL_W / CELL_ASPECT;
const GRID_HEIGHT = ROWS * CELL_H + GAP * (ROWS - 1);

const TOPO_LIGHT: Cover = {
  ...COVERS[12],
  png: staticFile("covers/showcase-topo-light.png"),
};

// 15 covers (topo = dark) + topo light as 16th cell for contrast
const GRID_ITEMS = [
  ...COVERS,
  TOPO_LIGHT,
];

export const GridReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bass = useBassPulse(BEATS.gridReveal.from);

  // Last 10 frames: fade out
  const exitOpacity = interpolate(frame, [65, 75], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [65, 75], [1, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bass-driven camera pulse on the whole grid, fades in after reveal settles.
  const bassEnabled = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bassScale = 1 + bass * 0.018 * bassEnabled;

  const typedText = getTypedText(frame);
  const isDoneTyping = typedText.length === TEXT.length;
  const showCursor = !isDoneTyping && frame >= TYPE_START && cursorVisible(frame);
  const textFadeIn = interpolate(frame, [TYPE_START, TYPE_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = textFadeIn * exitOpacity;

  return (
    <AbsoluteFill style={{ background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: GRID_WIDTH,
          height: GRID_HEIGHT,
          position: "relative",
          opacity: exitOpacity,
          transform: `scale(${exitScale * bassScale})`,
        }}
      >
        {GRID_ITEMS.map((cover, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = col * (CELL_W + GAP);
          const y = row * (CELL_H + GAP);

          // Stagger: cell i starts at frame i * 2.5
          const startFrame = Math.floor(i * 2.5);
          const localFrame = Math.max(0, frame - startFrame);

          const scale = spring({
            frame: localFrame,
            fps,
            config: { damping: 12, stiffness: 120 },
            durationInFrames: 30,
          });
          const mappedScale = interpolate(scale, [0, 1], [0.6, 1]);
          const opacity = interpolate(scale, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

          // Each cell gets a tiny per-cell bass shimmer, phase-offset by index
          // so the grid feels alive rather than uniformly pulsing.
          const cellSettled = localFrame > 20 ? 1 : 0;
          const cellPhaseOffset = (i % 4) * 0.18; // 0, 0.18, 0.36, 0.54
          const cellBass = Math.max(0, bass - cellPhaseOffset);
          const cellBassScale = 1 + cellBass * 0.025 * cellSettled * bassEnabled;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: CELL_W,
                height: CELL_H,
                transform: `scale(${mappedScale * cellBassScale})`,
                opacity,
                overflow: "hidden",
                borderRadius: 4,
              }}
            >
              {cover ? (
                <>
                  <Img
                    src={cover.png}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "20px 14px 10px",
                      background: "linear-gradient(to top, rgba(8,8,10,0.82) 0%, transparent 100%)",
                      fontFamily: jetBrainsMono,
                      fontSize: 11,
                      color: ACCENT,
                      letterSpacing: "0.05em",
                    }}
                  >
                    seed: {cover.slug}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#111114",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                    padding: "16px 18px",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontFamily: jetBrainsMono,
                      fontSize: 10,
                      color: ACCENT,
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    08 · L-system plants
                  </div>
                  <div
                    style={{
                      fontFamily: sourceSerif4,
                      fontWeight: 600,
                      fontSize: 18,
                      color: FG,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.2,
                    }}
                  >
                    A grammar for branching
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Diagonal handwritten overlay */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            transform: "rotate(-9deg) translateY(-48px)",
            opacity: textOpacity,
            position: "relative",
          }}
        >
          {/* Scrim band behind text */}
          <div
            style={{
              position: "absolute",
              inset: "-48px -80px",
              background: "rgba(10,10,12,0.82)",
              filter: "blur(32px)",
            }}
          />
          <div
            style={{
              position: "relative",
              fontFamily: shantellSans,
              fontWeight: 400,
              fontSize: 90,
              color: "#ffffff",
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {typedText}
            {showCursor && <span>|</span>}
          </div>
        </div>
      </AbsoluteFill>

      {/* Typing click sounds */}
      {Array.from({ length: TEXT.length }, (_, i) => (
        <Sequence key={i} from={TYPE_START + Math.round(i * FRAMES_PER_CHAR)} durationInFrames={20}>
          <Audio src="https://remotion.media/mouse-click.wav" volume={0.18} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
