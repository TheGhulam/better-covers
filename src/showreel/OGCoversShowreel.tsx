import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { BEATS, TOTAL_FRAMES } from "./video-config";
// Load fonts at module init so they're ready before any frame renders
import "./fonts";
import { Letterbox } from "./lib/Letterbox";
import { IntroClaims } from "./beats/01_IntroClaims";
import { GridReveal } from "./beats/02_GridReveal";
import { HeroKarman } from "./beats/03_HeroHoarfrost";
import { HeroClifford } from "./beats/04_HeroClifford";
import { HeroFidenza } from "./beats/05_HeroFidenza";
import { HarmonographTransition } from "./beats/06_StipplingTransition";
import { RapidFire } from "./beats/07_RapidFire";
import { EndCard } from "./beats/08_EndCard";

const GrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 64;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch' seed='${seed}'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${uri}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
        opacity: 0.03,
        pointerEvents: "none",
      }}
    />
  );
};

export const OGCoversShowreel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0c" }}>
      {/* Music — spans full 30s, fades out over last 30 frames */}
      <Audio
        src={staticFile("music/yep-by-fgb.mp3")}
        volume={(f) => {
          const duck = interpolate(f, [410, 420, 440, 453], [1, 0.4, 0.4, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(f, [870, 900], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return duck * fadeOut;
        }}
      />

      {/* Beat 1 — Intro claims: 0–60 */}
      <Sequence
        from={BEATS.introClaims.from}
        durationInFrames={BEATS.introClaims.to - BEATS.introClaims.from}
        premountFor={30}
      >
        <IntroClaims />
      </Sequence>

      {/* Beat 2 — Grid reveal: 60–135 */}
      <Sequence
        from={BEATS.gridReveal.from}
        durationInFrames={BEATS.gridReveal.to - BEATS.gridReveal.from}
        premountFor={60}
      >
        <GridReveal />
      </Sequence>

      {/* Beat 3 — Hero Kármán: 135–270 */}
      <Sequence
        from={BEATS.heroHoarfrost.from}
        durationInFrames={BEATS.heroHoarfrost.to - BEATS.heroHoarfrost.from}
        premountFor={30}
      >
        <HeroKarman />
      </Sequence>

      {/* Beat 4 — Hero Clifford: 270–390 */}
      <Sequence
        from={BEATS.heroClifford.from}
        durationInFrames={BEATS.heroClifford.to - BEATS.heroClifford.from}
        premountFor={30}
      >
        <HeroClifford />
      </Sequence>

      {/* Beat 5 — Harmonograph dark→light transition: 390–480 */}
      <Sequence
        from={BEATS.stipplingTransition.from}
        durationInFrames={
          BEATS.stipplingTransition.to - BEATS.stipplingTransition.from
        }
        premountFor={30}
      >
        <HarmonographTransition />
      </Sequence>

      {/* Beat 6 — Hero Fidenza (dark→light): 480–600 */}
      <Sequence
        from={BEATS.heroFidenza.from}
        durationInFrames={BEATS.heroFidenza.to - BEATS.heroFidenza.from}
        premountFor={30}
      >
        <HeroFidenza />
      </Sequence>

      {/* Beat 7 — Rapid-fire: 600–750 */}
      <Sequence
        from={BEATS.rapidFire.from}
        durationInFrames={BEATS.rapidFire.to - BEATS.rapidFire.from}
        premountFor={30}
      >
        <RapidFire />
      </Sequence>

      {/* Beat 8 — End card: 750–900 */}
      <Sequence
        from={BEATS.endCard.from}
        durationInFrames={BEATS.endCard.to - BEATS.endCard.from}
        premountFor={30}
      >
        <EndCard />
      </Sequence>

      {/* Letterbox spans beats 03+04 continuously so bars don't retract at the cut */}
      <Sequence
        from={BEATS.heroHoarfrost.from}
        durationInFrames={BEATS.heroClifford.to - BEATS.heroHoarfrost.from}
      >
        <Letterbox
          duration={BEATS.heroClifford.to - BEATS.heroHoarfrost.from}
        />
      </Sequence>

      {/* Film grain — tiling 200×200 SVG noise, seed cycles per frame */}
      <GrainOverlay />
    </AbsoluteFill>
  );
};
