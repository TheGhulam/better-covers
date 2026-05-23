# Security Policy

## Supported versions

Only the latest minor release on the `main` branch receives security
updates. We do not currently maintain LTS branches.

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| Older    | :x:                |

## Reporting a vulnerability

If you find a security issue — including one that would let a malicious
slug crash the renderer, leak memory, exhaust CPU, or trigger
cross-site issues when the gallery is embedded — please **do not open a
public GitHub issue.**

Instead, report it privately through **GitHub Security Advisories**: the
[Report a vulnerability](https://github.com/TheGhulam/better-covers/security/advisories/new)
button on the repository's Security tab.

Please include:

- A description of the issue and its impact
- A minimal reproduction (a seed string, a renderer call, expected vs.
  actual behavior)
- The runtime and version you observed it in (browser + version, Node
  version, edge runtime)
- Any suggested fix, if you have one

You can expect:

- An acknowledgement within **3 business days**
- A status update within **10 business days**
- A coordinated public disclosure once a fix is released, with credit to
  the reporter (unless you ask to remain anonymous)

## Threat model

This library is a pure rendering layer. It does not make network calls,
read from disk, evaluate user code, or persist state. The realistic
security surface is therefore narrow:

- **Denial-of-service via pathological seed**: a renderer that takes a
  seed should always finish in bounded time. A seed that causes a
  renderer to allocate gigabytes or loop indefinitely is a bug we want
  to know about.
- **Memory disclosure via canvas read-back**: if a renderer ever ends up
  in a position where `getImageData` returns uninitialized memory from
  another origin, that's a serious issue. (We don't currently know of
  any path that could do this, but reports welcome.)
- **CSS injection via the Gallery stylesheet**: the gallery loads three
  Google Fonts via `@import`. If you embed the gallery in a strict CSP
  context, you'll need to allow `fonts.googleapis.com` and
  `fonts.gstatic.com`, or replace `styles.ts` with self-hosted fonts.

This library is **not** intended to safely render attacker-controlled HTML
or scripts — it never touches either. The `seed` string is hashed into a
32-bit integer before any renderer sees it; no user data flows past that.
