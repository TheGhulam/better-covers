import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ACCENT, BEATS, BG, DIM, FG } from "../video-config";
import { shantellSans, jetBrainsMono } from "../fonts";
import { useBassPulse } from "../lib/useBassPulse";

const CLAIMS = ["no AI", "no API calls", "just math + your slug"];
const CARD_FRAMES = 20;

/**
 * Each claim punches in with:
 *   - scale 1.08 → 1.00 (over 8 frames, easeOut)
 *   - letter-spacing 0.18em → 0.04em (tracking-in)
 *   - opacity 0 → 1 (over 5 frames)
 *   - a 1-frame white flash on the cut (3% white wash)
 * Then the active claim breathes with the bass amplitude.
 * An accent underline draws under from left.
 */
export const IntroClaims: React.FC = () => {
  const frame = useCurrentFrame();
  const bass = useBassPulse(BEATS.introClaims.from);

  const cardIndex = Math.min(
    Math.floor(frame / CARD_FRAMES),
    CLAIMS.length - 1,
  );
  const localFrame = frame - cardIndex * CARD_FRAMES;

  // Punch-in: scale + tracking + opacity
  const scale = interpolate(localFrame, [0, 8], [1.08, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const tracking = interpolate(localFrame, [0, 10], [0.18, 0.04], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(localFrame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Flash on cut: 3% white wash on the first frame of each card.
  const flashOpacity = interpolate(localFrame, [0, 3], [0.04, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Underline draws from 0 → full width over 14 frames.
  const underlineProgress = interpolate(localFrame, [3, 17], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Bass breath: only after the punch-in settles, so it doesn't fight it.
  const breathStart = 8;
  const breathStrength = interpolate(
    localFrame,
    [breathStart, breathStart + 4],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const breathScale = 1 + bass * 0.012 * breathStrength;

  // Pre-label fades in once, stays.
  const labelOpacity = interpolate(frame, [4, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Last claim is slightly larger weight visually since it's the punchline.
  const isLast = cardIndex === CLAIMS.length - 1;
  const fontSize = isLast ? 116 : 132;

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Centered claim */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity,
            transform: `scale(${scale * breathScale})`,
            transformOrigin: "center",
            position: "relative",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: shantellSans,
              fontWeight: 600,
              fontSize,
              letterSpacing: `${tracking}em`,
              color: FG,
              lineHeight: 1.15,
              whiteSpace: "nowrap",
            }}
          >
            {CLAIMS[cardIndex]}
          </div>
        </div>
      </AbsoluteFill>

      {/* Cut flash */}
      <AbsoluteFill
        style={{
          background: "white",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
