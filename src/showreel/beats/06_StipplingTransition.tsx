import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  staticFile,
} from "remotion";
import { BG, FG, DIM, ACCENT } from "../video-config";
import { sourceSerif4, geist, jetBrainsMono } from "../fonts";

const DARK_PNG = staticFile("covers/showcase-harmonograph.png");
const LIGHT_PNG = staticFile("covers/showcase-harmonograph-light.png");

const DROP_START = 30;
const DROP_DURATION = 36;

export const HarmonographTransition: React.FC = () => {
  const frame = useCurrentFrame();

  const t = (frame - DROP_START) / DROP_DURATION;
  const eased =
    t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
  const radius = interpolate(eased, [0, 1], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Caption on dark bg — fades out before the circle fully arrives
  const darkCaptionOpacity = interpolate(frame, [0, 8, 26, 36], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Caption on light bg — fades in as circle starts, persists to end
  const lightCaptionOpacity = interpolate(
    frame,
    [28, 38, 82, 90],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // "Dark mode" callout — visible before the drop, fades out as circle starts
  const darkCalloutOpacity = interpolate(frame, [0, 8, 26, 36], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Light mode" callout — fades in right as the circle begins
  const lightCalloutOpacity = interpolate(
    frame,
    [28, 38, 62, 70],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Whoosh fires 5 frames ahead of the circle wipe so it lands on the cut */}
      <Sequence from={DROP_START - 5} durationInFrames={30}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.12} />
      </Sequence>
      {/* Dark layer */}
      <AbsoluteFill>
        <Img
          src={DARK_PNG}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </AbsoluteFill>

      {/* Light layer revealed by expanding circle */}
      {frame >= DROP_START && (
        <AbsoluteFill style={{ clipPath: `circle(${radius}% at 50% 50%)` }}>
          <Img
            src={LIGHT_PNG}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Caption (dark bg) — top left */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 100,
          opacity: darkCaptionOpacity,
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
          Harmonograph
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
          Goold 1844
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
          seed: harmonograph
        </div>
      </div>

      {/* Caption (light bg) — same position, dark ink for legibility */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 100,
          opacity: lightCaptionOpacity,
        }}
      >
        <div
          style={{
            fontFamily: sourceSerif4,
            fontWeight: 600,
            fontSize: 52,
            color: "#1a1612",
            textShadow: "0 1px 0 rgba(255,255,255,0.6)",
            marginBottom: 10,
          }}
        >
          Harmonograph
        </div>
        <div
          style={{
            fontFamily: geist,
            fontWeight: 400,
            fontSize: 30,
            color: "#4a3f2f",
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          Goold 1844
        </div>
        <div
          style={{
            fontFamily: jetBrainsMono,
            fontSize: 22,
            color: "#8b5e2a",
            marginTop: 14,
            letterSpacing: "0.04em",
          }}
        >
          seed: harmonograph
        </div>
      </div>

      {/* Dark mode callout — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          right: 100,
          opacity: darkCalloutOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: sourceSerif4,
            fontWeight: 600,
            fontSize: 40,
            color: FG,
            textShadow: "0 2px 12px rgba(0,0,0,0.7)",
            textAlign: "right",
          }}
        >
          Dark mode
        </div>
      </div>

      {/* Light mode callout — bottom right, dark ink for legibility on light bg */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          right: 100,
          opacity: lightCalloutOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: sourceSerif4,
            fontWeight: 600,
            fontSize: 40,
            color: "#1a1612",
            textShadow:
              "0 0 3px rgba(245,236,214,0.9), 0 0 10px rgba(245,236,214,0.55)",
            textAlign: "right",
          }}
        >
          Light mode
        </div>
      </div>
    </AbsoluteFill>
  );
};
