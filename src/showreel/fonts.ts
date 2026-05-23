import { loadFont as loadSourceSerif4 } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadShantellSans } from "@remotion/google-fonts/ShantellSans";

export const { fontFamily: sourceSerif4 } = loadSourceSerif4("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

export const { fontFamily: geist } = loadGeist("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const { fontFamily: jetBrainsMono } = loadJetBrainsMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const { fontFamily: shantellSans } = loadShantellSans("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
