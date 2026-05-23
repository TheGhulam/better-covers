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
import { BEATS, BG, FG, ACCENT, DIM } from "../video-config";
import { RAPID_FIRE_COVERS } from "../lib/covers";
import { jetBrainsMono, sourceSerif4 } from "../fonts";
import { useBassPulse } from "../lib/useBassPulse";

// 17 covers × 13 frames = 221 frames, filling the 220-frame rapid-fire window.
// 13 frames @ 30fps ≈ 433ms — beat-matched to the track.
const FRAMES_PER_COVER = 13;

export const RapidFire: React.FC = () => {
  const frame = useCurrentFrame();
  const coverIndex = Math.min(
    Math.floor(frame / FRAMES_PER_COVER),
    RAPID_FIRE_COVERS.length - 1,
  );
  const cover = RAPID_FIRE_COVERS[coverIndex];

  // Frames since the current cover appeared.
  const localFrame = frame - coverIndex * FRAMES_PER_COVER;

  // Punch-in on cover swap: starts at 1.04, settles to 1.0 over 5 frames.
  const punchScale = interpolate(localFrame, [0, 5], [1.04, 1.0], {
    extrapolateRight: "clamp",
  });
  const punchOpacity = interpolate(localFrame, [0, 3], [0.85, 1.0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Tick on each cover swap — very low in the mix, like a film leader countdown */}
      {RAPID_FIRE_COVERS.map((_, i) => (
        <Sequence
          key={`tick-${i}`}
          from={i * FRAMES_PER_COVER}
          durationInFrames={10}
        >
          <Audio src={staticFile("sfx/tick.mp3")} volume={0.12} />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{ transform: `scale(${punchScale})`, opacity: punchOpacity }}
      >
        <Img
          src={cover.png}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </AbsoluteFill>

      {/* Gradient for caption legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(8,8,10,0.88) 0%, transparent 28%)",
        }}
      />

      {/* Cover num tag + heading — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 72,
        }}
      >
        <div
          style={{
            fontFamily: sourceSerif4,
            fontWeight: 600,
            fontSize: 52,
            color: FG,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          {cover.title}
        </div>
        <div
          style={{
            fontFamily: jetBrainsMono,
            fontSize: 20,
            color: DIM,
            letterSpacing: "0.06em",
          }}
        >
          {cover.subtitle}
        </div>
        <div
          style={{
            fontFamily: jetBrainsMono,
            fontSize: 18,
            color: ACCENT,
            marginTop: 10,
            letterSpacing: "0.04em",
          }}
        >
          seed: {cover.slug}
        </div>
      </div>
    </AbsoluteFill>
  );
};
