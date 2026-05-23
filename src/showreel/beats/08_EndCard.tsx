import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, useCurrentFrame, staticFile } from "remotion";
import { BG, FG, DIM } from "../video-config";
import { shantellSans, geist, jetBrainsMono } from "../fonts";

const GITHUB_URL = "github.com/TheGhulam/better-covers";

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();

  function fadeIn(startAt: number) {
    return interpolate(frame, [startAt, startAt + 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const endFade = interpolate(frame, [108, 120], [1, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pillFadeIn = fadeIn(18);

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* ASCII landscape background — art sits on the right half */}
      <AbsoluteFill>
        <Img
          src={staticFile("covers/showcase-ascii.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </AbsoluteFill>
      {/* Dark gradient covering left ~55% so text stays readable */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to right, rgba(8,8,10,0.96) 0%, rgba(8,8,10,0.88) 45%, rgba(8,8,10,0.10) 70%, transparent 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingLeft: 96,
          maxWidth: "55%",
          opacity: endFade,
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontFamily: shantellSans,
            fontWeight: 400,
            fontSize: 90,
            color: FG,
            letterSpacing: "-0.02em",
            lineHeight: 2,
            textAlign: "left",
            marginBottom: 32,
            opacity: fadeIn(6),
          }}
        >
          deterministic, offline
          <br />
          make yours now:
        </div>
        {/* GitHub URL pill */}
        <div
          style={{
            fontFamily: jetBrainsMono,
            fontWeight: 500,
            fontSize: 38,
            color: FG,
            opacity: pillFadeIn,
          }}
        >
          {GITHUB_URL}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
