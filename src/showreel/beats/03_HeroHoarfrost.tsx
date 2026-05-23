import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  Easing,
  staticFile,
} from "remotion";
import { BEATS, BG, FG, DIM, ACCENT } from "../video-config";
import { sourceSerif4, geist, jetBrainsMono } from "../fonts";
import { useBassPulse } from "../lib/useBassPulse";

const DURATION = 135;

export const HeroKarman: React.FC = () => {
  const frame = useCurrentFrame();
  const bass = useBassPulse(BEATS.heroHoarfrost.from);

  const baseScale = interpolate(frame, [0, DURATION], [1.07, 1.02], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const scale = baseScale * (1 + bass * 0.015);

  const translateY = interpolate(frame, [0, DURATION], [0, -2], {
    extrapolateRight: "clamp",
  });

  const captionOpacity = interpolate(frame, [30, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [120, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateY(${translateY}%)`,
          opacity: exitOpacity,
        }}
      >
        <Img
          src={staticFile("covers/showcase-karman.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </AbsoluteFill>

      {/* Bottom-left caption */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 100,
          opacity: captionOpacity * exitOpacity,
        }}
      >
        <div
          style={{
            fontFamily: sourceSerif4,
            fontWeight: 600,
            fontSize: 52,
            color: FG,
            textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            marginBottom: 10,
          }}
        >
          Kármán Street
        </div>
        <div
          style={{
            fontFamily: geist,
            fontWeight: 400,
            fontSize: 30,
            color: DIM,
            textShadow: "0 1px 6px rgba(0,0,0,0.9)",
          }}
        >
          Von Kármán 1911
        </div>
        <div
          style={{
            fontFamily: jetBrainsMono,
            fontSize: 22,
            color: ACCENT,
            marginTop: 14,
            textShadow: "0 1px 6px rgba(0,0,0,0.9)",
            letterSpacing: "0.04em",
          }}
        >
          seed: karman
        </div>
      </div>
    </AbsoluteFill>
  );
};
