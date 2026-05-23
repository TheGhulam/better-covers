import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, Easing, staticFile } from "remotion";
import { BG, FG, DIM, ACCENT } from "../video-config";
import { sourceSerif4, geist, jetBrainsMono } from "../fonts";

const PNG = staticFile("covers/showcase-life.png");
const DURATION = 80;

export const HeroFidenza: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, DURATION], [1.09, 1.03], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const captionOpacity = interpolate(frame, [22, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [68, 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });


  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, opacity: exitOpacity }}>
        <Img
          src={PNG}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
          Game of Life
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
          Conway 1970
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
          seed: life-conway
        </div>
      </div>
    </AbsoluteFill>
  );
};
