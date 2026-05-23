/**
 * Gallery stylesheet — scoped under `.pg-page` so it won't bleed into a host
 * page. Container queries on `.pg-title` size the cover overlay relative to
 * the cover itself, so the same overlay reads correctly at any width.
 *
 * @module styles
 */

export const styles = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.pg-page {
  --pg-bg: #0a0a0c;
  --pg-fg: #efeae0;
  --pg-muted: #807a72;
  --pg-dim: #4a4640;
  --pg-accent: #c8884a;
  --pg-line: #1c1c20;

  background: var(--pg-bg);
  color: var(--pg-fg);
  font-family: "Geist", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  padding: 72px 24px 96px;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
  max-width: 1140px;
  margin: 0 auto;
}

.pg-page * { box-sizing: border-box; }

.pg-page header { margin-bottom: 72px; max-width: 720px; }
.pg-page .eyebrow {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--pg-accent);
  text-transform: uppercase;
  margin-bottom: 16px;
}
.pg-page h1 {
  font-family: "Source Serif 4", Georgia, serif;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 18px;
  line-height: 1.15;
  color: var(--pg-fg);
}
.pg-page .lede {
  color: var(--pg-muted);
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
}
.pg-page .lede em { color: var(--pg-fg); font-style: italic; }

.pg-page .covers { display: flex; flex-direction: column; gap: 72px; }

.pg-page .card { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 880px) {
  .pg-page .card { grid-template-columns: 1.85fr 1fr; align-items: start; gap: 40px; }
}

.pg-cover {
  aspect-ratio: 1200 / 630;
  width: 100%;
  overflow: hidden;
  border-radius: 6px;
  position: relative;
  background: #111;
  box-shadow: 0 0 0 1px var(--pg-line), 0 24px 60px -32px rgba(0,0,0,0.7);
  container-type: inline-size;
}
.pg-cover canvas {
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

/* Power-Graph-style title overlay used on every cover. */
.pg-title {
  position: absolute;
  left: 5%;
  bottom: 8%;
  right: 5%;
  z-index: 5;
  pointer-events: none;
}
.pg-title .t {
  font-family: "Source Serif 4", Georgia, serif;
  font-size: 6.4cqw;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.0;
  color: #f5f0e6;
  margin-bottom: 0.9cqw;
  text-shadow: 0 1px 24px rgba(0,0,0,0.45);
}
.pg-title .s {
  font-family: "Geist", system-ui, sans-serif;
  font-size: 1.65cqw;
  font-weight: 400;
  letter-spacing: 0;
  color: rgba(220, 215, 205, 0.62);
  line-height: 1.35;
  text-shadow: 0 1px 16px rgba(0,0,0,0.55);
}
.pg-title.dark .t { color: #1a1612; text-shadow: none; }
.pg-title.dark .s { color: rgba(40, 30, 20, 0.62); text-shadow: none; }

.pg-page .meta { padding-top: 6px; }
.pg-page .meta .num {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  color: var(--pg-accent);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
}
.pg-page .meta h2 {
  font-family: "Source Serif 4", Georgia, serif;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.012em;
  margin: 0 0 10px;
  line-height: 1.3;
  color: var(--pg-fg);
}
.pg-page .meta p {
  color: var(--pg-muted);
  font-size: 13.5px;
  line-height: 1.6;
  margin: 0 0 12px;
}
.pg-page .meta p em { color: var(--pg-fg); font-style: italic; }
.pg-page .meta .refs {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 10.5px;
  color: var(--pg-dim);
  line-height: 1.7;
  display: block;
  padding-top: 8px;
  border-top: 1px solid var(--pg-line);
  letter-spacing: 0.02em;
}

.pg-page footer {
  margin-top: 96px;
  padding-top: 32px;
  border-top: 1px solid var(--pg-line);
  color: var(--pg-muted);
  font-size: 13px;
  line-height: 1.65;
  max-width: 720px;
}
.pg-page footer em { color: var(--pg-fg); font-style: italic; }
`;
