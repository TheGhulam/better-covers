"use client";

/**
 * `<Gallery />` — a complete demo page showing every cover in the catalog
 * alongside its field-notes column (catalog number, headline, body, refs).
 *
 * Drop it into any React app to get a full one-page browser of the
 * collection. Styles are scoped under `.pg-page` so they won't bleed into
 * a host page.
 *
 * @module Gallery
 */

import { Cover } from "./Cover";
import { COVERS } from "./covers";
import { styles } from "./styles";

export function Gallery() {
  return (
    <>
      <style>{styles}</style>
      <main className="pg-page">
        <header>
          <div className="eyebrow">
            PROGRAMMATIC OG COVERS · FIFTEEN TEXTURES
          </div>
          <h1>
            Cover textures from physics, generative art, and cartographic
            tradition
          </h1>
          <p className="lede">
            Each cover is rendered live in the browser at the OG aspect ratio
            (1200×630). Ten are named phenomena — Witten, von Kármán, Toepler,
            Penrose, Pickover, Bridson — and five are house-style candidates
            drawn from generative art (Hobbs's <em>Fidenza</em>), cellular
            automata (Conway), and cartographic contour conventions. Every
            algorithm is deterministic from a slug seed, so the same post slug
            always paints the same cover.
          </p>
        </header>

        <section className="covers">
          {COVERS.map((c) => (
            <article className="card" key={c.seed}>
              <Cover
                render={c.render}
                title={c.title}
                subtitle={c.subtitle}
                seed={c.seed}
                dark={c.dark}
              />
              <div className="meta">
                <span className="num">{c.num}</span>
                <h2>{c.h2}</h2>
                <p>{c.body}</p>
                <code className="refs">{c.refs}</code>
              </div>
            </article>
          ))}
        </section>

        <footer>
          Fifteen textures, ten of them named after the physicist, chemist, or
          mathematician who first observed or described them, and five drawn
          from generative-art and cartographic convention. Every algorithm is
          deterministic from a slug seed — the same post slug always paints
          the same cover — and none takes more than a second to render at
          production size with Satori, Takumi, or vanilla canvas.
        </footer>
      </main>
    </>
  );
}

/** Default export so consumers can do `import Gallery from "better-covers/gallery"`. */
export default Gallery;
