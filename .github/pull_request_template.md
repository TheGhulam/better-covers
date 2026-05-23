<!--
Thanks for opening a pull request. Please fill in the checklist below.
If this PR closes an issue, write "Closes #NNN" somewhere in the description.
-->

## What does this PR do?

<!-- A short paragraph. What changed and why. -->

## Type of change

- [ ] Bug fix
- [ ] New renderer (linked proposal issue: #___)
- [ ] Performance improvement (no visual change)
- [ ] Refactor (no behavior change)
- [ ] Documentation
- [ ] Tooling / CI

## Checklist

- [ ] `npm run lint`, `npm run typecheck`, `npm test` all pass locally
- [ ] New code is covered by tests
- [ ] No `Math.random`, `Date.now`, `performance.now`, or network calls in
      any renderer (the ESLint rules will block these — confirm you haven't
      disabled them)
- [ ] If a renderer was changed: ran twice with the same seed and got
      identical pixel buffers
- [ ] If visual output changed: the snapshot diff is attached or linked,
      and the description explains why
- [ ] `CHANGELOG.md` updated under `## [Unreleased]`
- [ ] For new renderers: doc comment includes a primary-source citation,
      and `ATTRIBUTIONS.md` has a corresponding section

## Screenshots / output

<!-- For visual changes, include before/after thumbnails. -->
