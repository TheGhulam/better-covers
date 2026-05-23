# Showreel (Remotion)

This directory contains an optional 30-second Remotion video composition that
runs through the cover collection set to music. It is **not built by default**
and is **not exported from the package barrel** (`src/index.ts`) — the cover
library above stands alone.

## Why it isn't in the package

The showreel exists because the original project author needed a single
shareable video. To run it you need Remotion (`@remotion/player`,
`@remotion/media-utils`, `@remotion/google-fonts`) plus four Google Fonts
(Source Serif 4, Geist, JetBrains Mono, Shantell Sans).

The composition references `music/yep-by-fgb.mp3`. **That audio file is not
included in the repository.** It is not under a license that allows
redistribution, and we have not been able to identify the original artist
with confidence (multiple "FGB" entries exist on Bandcamp, Beatport, Apple
Music — none are an unambiguous match). If you are the artist, please open
an issue and we will add a proper attribution or remove the references.

## To run the showreel locally

1. Install Remotion in your downstream project.
2. Provide your own audio at `public/music/showreel.mp3` (any 30-second
   track works — instrumental electronic loops with a clear sub-bass attack
   line up best with `useBassPulse`).
3. Edit `OGCoversShowreel.tsx` and `lib/useBassPulse.ts` so the
   `staticFile(...)` calls point at your file path.
4. Provide cover PNGs in `public/covers/` matching the slugs in
   `covers.ts` — these are pre-rendered snapshots of the canvas renderers
   from this library, written to disk for instant frame-by-frame playback.
   Use `scripts/render-covers.ts` (not included; trivial to write — call
   each `render*` function into `node-canvas` and `toBuffer('image/png')`).

## Suggested replacement audio

Anything from [Free Music Archive](https://freemusicarchive.org/genre/Electronic/)
with a CC0 / CC-BY license, or generated AI music that you have the
rights to use, will work. Look for a track with:

- Clear sub-bass kicks for `useBassPulse` to lock onto
- A "drop" or texture change around 13–15 seconds (the cut from
  `heroClifford` to `stipplingTransition`)
- A fade-tolerant ending — the showreel ducks the volume over the last
  30 frames

## Source attribution for the showreel itself

The showreel structure and timing — eight beats, 900 frames at 30 fps,
the specific beat sequencing — is project-original and falls under the
repository's MIT license.
