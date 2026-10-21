# Design sync notes

## Setup this repo needs

- Tokens-only DS: no React components yet, so `window.VirtualHajj` is empty. The package is `docs/design/design-system/` (`package.json`, empty `index.js` entry, `base.css` as `cssEntry`, `tokens/*.css` via `tokensPkg` + `tokensGlob`).
- `tokensPkg` resolves through `node_modules`, so after every `npm i` in `.ds-sync/` recreate the link: `mkdir -p .ds-sync/node_modules/@virtualhajj && ln -sfn ../../../docs/design/design-system .ds-sync/node_modules/@virtualhajj/design-system`. npm deletes it on each install.
- Converter deps: `(cd .ds-sync && npm i esbuild ts-morph @types/react react@18.3.1 react-dom@18.3.1 playwright@1.64.0)`. npm's allow-scripts blocks esbuild's postinstall; esbuild still works because `@esbuild/linux-x64` installs as an optional dep.
- Playwright 1.64.0 pins chromium-1248, which is already in `~/.cache/ms-playwright/`. A different version needs a ~200MB download.
- Run from the repo root: `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules .ds-sync/node_modules --out ./ds-bundle`.
- The converter copies only `.md`/`.mdx` guidelines. After every build, copy the HTML cards by hand: `cp docs/design/design-system/guidelines/*.html ds-bundle/guidelines/`, then re-run `package-validate.mjs`.
- The render check covers component previews only (0 here). Screenshot the guideline cards in light and dark with a small Playwright script; this run found a dark-mode bug that way.

## Re-sync risks

- Guideline HTML cards are outside `_ds_sync.json`, so the re-sync diff cannot see a changed card. Re-upload `guidelines/**` on every sync.
- Fonts load at runtime from Google Fonts (`[FONT_REMOTE]`); nothing ships in `fonts/`. Offline or blocked networks fall back to `system-ui`.
- The generated README body still says "React library" and "0 components". The conventions header above it says the DS is tokens-only; update the header when components land.
- The canvas boards (https://claude.ai/artifact/EWyrXLHtQcxsn2gNoMvXLL) pad buttons by 20px, which is off the spacing scale. Code and the conventions header use `--vh-space-6` (24px).
- When the app gains React components, this stops being tokens-only: point `entry` at the built component entry, expect `[ZERO_MATCH]` to go away, and author previews in `.design-sync/previews/`.
