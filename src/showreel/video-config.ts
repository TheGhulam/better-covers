export const TOTAL_FRAMES = 900; // 30s @ 30fps
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

// Beat frame ranges
export const BEATS = {
  introClaims: { from: 0, to: 60 },
  gridReveal: { from: 60, to: 135 },
  heroHoarfrost: { from: 135, to: 270 },
  heroClifford: { from: 270, to: 390 },
  stipplingTransition: { from: 390, to: 480 },
  heroFidenza: { from: 480, to: 560 },
  rapidFire: { from: 560, to: 780 },
  endCard: { from: 780, to: 900 },
} as const;

export const ACCENT = "#c8884a";
export const BG = "#0a0a0c";
export const FG = "#efeae0";
export const DIM = "#807a72";
export const PILL_BG = "#1c1c20";
