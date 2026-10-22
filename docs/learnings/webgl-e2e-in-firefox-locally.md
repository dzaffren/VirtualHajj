# Run the WebGL e2e tests in headless Firefox on this machine

**Learned:** 2026-10-22 · **From:** tawaf /build

Headless Chromium on the dev machine drops every WebGL context, so a local `pnpm e2e` of the scene always fails. Headless Firefox from Playwright's cache draws: all 13 tawaf, viewer and perf tests passed in it.

Wrong: wait for CI to see any walking test run. Right: put a throwaway config at the repo root, list it in `.git/info/exclude`, and run `pnpm exec playwright test -c <it>`. The config spreads `playwright.config.ts`, sets `use.browserName: "firefox"`, and has one project with `grepInvert: /no WebGL 2/`. Run the `no-webgl` project in Chromium as usual. CI in Chromium still decides.
