# Decisions

Append-only. A changed decision is a new entry that supersedes the old one; only an
old entry's Status line ever changes.

## D1 · 2026-10-21 · Teach Shafi'i rulings, as in Tabung Haji courses

Why: the learners attend Tabung Haji courses, which teach the Shafi'i rulings.
Rejected: rulings that all four madhhabs share, with differences noted (more text in every rite, and it differs from the course).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D2 · 2026-10-21 · Run in the web browser on phone and laptop

Why: a learner opens a link with no install.
Rejected: installed mobile app (an install step before the first lesson), VR headset (few learners own one).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D3 · 2026-10-21 · Teach all three types of Hajj

Why: tamattu', ifrad and qiran differ in when Umrah is done and whether hady is due, so one fixed order teaches some learners the wrong order.
Rejected: tamattu' only (ifrad and qiran pilgrims learn the wrong order).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D4 · 2026-10-21 · Malay and English from the first rite

Why: Tabung Haji courses teach in Malay, and students and learners outside those courses need English.
Rejected: Malay only (no English for learners outside Malay courses), English only (does not match the Malay courses).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D5 · 2026-10-21 · Release each slice when it is done

Why: a course can test tawaf with real learners while the later rites are built, so the success test is checked early.
Rejected: one release after the full Hajj (no learner feedback until the last of seven slices).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D6 · 2026-10-21 · One content version for all ages

Why: plain text that a 10-year-old can follow also serves a first-time adult pilgrim, and every text is already written in two languages.
Rejected: a separate child version (it doubles the text again).
Source: docs/specs/virtual-hajj/shape.md
Status: active

## D15 · 2026-10-21 · A warm, quiet HUD for a third-person Hajj game

Why: learners walk as a character; a top card and corner controls keep the character and the goal in view, with text at 7:1.
Rejected: one bottom panel (it covers the character in third person), text set straight on the scene as Monument Valley does (cannot hold 7:1 over a moving 3D view), Linear's restraint (reads cool, against "warm"), a score or stars (not chosen in the brief; it can read as scoring worship).
Source: docs/design/system-brief.md
Status: active

## D16 · 2026-10-21 · Bright game palette: cream and clear sky by day, night blue by dark, one vivid orange accent

Why: the product is a 3D game, so the colours should read as one; every text pair still holds 7:1.
Rejected: sand and teal (muted; quieter than the game the user wants), Sky pastel (softer, and its plum sits near the overused purple look).
Source: docs/design/system-brief.md
Status: active

## D17 · 2026-10-21 · Build the app with React Three Fiber on React, TypeScript and Vite

Why: every rite is a 3D scene with UI on top, and React Three Fiber has the largest set of helpers (drei) and answers for 3D on the web.
Rejected: plain Three.js with TypeScript (scene and UI code written by hand), Svelte with Threlte (a smaller community, so fewer answers when stuck).
Source: docs/specs/walking-skeleton.md
Status: active

## D18 · 2026-10-21 · Host on Cloudflare Pages, with a preview URL per PR

Why: the build is static files that the free tier covers, Cloudflare's edge servers sit close to learners' phones, and each PR gets its own URL to check before merge.
Rejected: Vercel (a smaller edge network than Cloudflare's, and no gain for a static build), GitHub Pages (a slower CDN and no preview URL per PR), production-only deploys (no way to see a change before it is live).
Source: docs/specs/walking-skeleton.md
Status: active

## D19 · 2026-10-21 · Test with Vitest and Playwright

Why: Vitest runs on the app's own Vite config, and Playwright drives a real Chromium on CI, which the e2e test needs to draw a WebGL frame.
Rejected: Cypress (slower on CI), Vitest with no e2e test (the shape promises an e2e test in CI from slice 0).
Source: docs/specs/walking-skeleton.md
Status: active

## D20 · 2026-10-21 · Use pnpm

Why: installs are fast, and its strict layout fails on a package the code uses but never declared.
Rejected: npm (slower, and lets undeclared packages slip through), bun (less tested with Playwright).
Source: docs/specs/walking-skeleton.md
Status: active

## D21 · 2026-10-21 · Run CI on GitHub Actions

Why: one workflow runs the type-check, unit tests, build, deploy and the Playwright test on every push.
Rejected: Cloudflare Pages' built-in build (it only builds, so the type-check and Playwright would need a second CI).
Source: docs/specs/walking-skeleton.md
Status: active

## D22 · 2026-10-21 · Every scene holds 30 FPS on a Samsung Galaxy A35

Why: learners use phones (D2). The `/perf` page draws 200,000 triangles in 100 draw calls — an estimate of the Masjidil Haram scene, not a measurement — plus one walking figure of about 5,000 triangles and 20 bones, standing in for the character (D15). It passes only if no one-second reading after the first frame drops below 30 FPS over 5 minutes, long enough for the phone to heat up and slow down. A dropped 3D view is a fail.
Rejected: 60 FPS (forces heavy optimisation on every later scene), "loads and renders" (a stuttering scene still passes), the Galaxy A15 (a stricter bar than the shape's mid-range), a throwaway `/poc` (its number could not be re-run when `tawaf` adds the mosque), a 60-second run (too short to catch the phone slowing down as it heats up), a 5-minute average (hides stutter), a load with no figure (misses the character the game adds).
Source: docs/specs/walking-skeleton.md
Status: active

## D23 · 2026-10-21 · Keep the repo public, on a personal GitHub account

Why: GitHub Actions has no minute limit on public repos, and no secret lives in the code; the Cloudflare token sits in GitHub's secret store.
Rejected: a private repo (2,000 free Actions minutes a month), a GitHub org (no team to own it yet).
Source: docs/specs/walking-skeleton.md
Status: active

## D24 · 2026-10-21 · Serve production on the free pages.dev domain

Why: slice 0 needs no custom domain, and one can be added later with no code change.
Rejected: a custom domain now (DNS setup with nothing to gain yet).
Source: docs/specs/walking-skeleton.md
Status: active

## D25 · 2026-10-21 · Scene colours live in one scene palette, outside the UI system

Why: the design system covers only the UI drawn over the scene, and the sky, ground, kiswah and ihram colours belong to the place, not the HUD. One palette file keeps every rite's scene the same. The sky turns night blue in dark mode, as the UI does (D16).
Rejected: scene tokens in the design system (another `/design-system` run for colours the UI never uses), a fixed daytime scene (dark mode would put night-blue panels over a day sky).
Source: docs/specs/walking-skeleton.md
Status: active

## D26 · 2026-10-21 · Developer pages sit outside the learner HUD rules

Why: learners never reach `/perf`, because nothing links to it, and a 5-minute run needs a visible clock. The no-timer rule is there so learners never feel rushed. Developer pages still use the system's tokens and its 7:1 text contrast.
Rejected: holding `/perf` to the no-timer rule (no way to tell how long the run has left).
Source: docs/specs/walking-skeleton.md
Status: active

## D27 · 2026-10-21 · When the 3D view can't be shown, say so plainly and offer the way back

Why: a blank or frozen canvas leaves a first-time pilgrim, often older, with no idea what went wrong or what to do. The app covers the scene with the plain backdrop, says what happened in one line, and gives the next step: another browser when WebGL 2 is missing, a Reload button when the view drops.
Rejected: a blank page (says nothing), a message with no button (an older learner may not know how to reload a phone browser), a frozen frame (looks like the app hung).
Source: docs/specs/walking-skeleton.md
Status: active

## D28 · 2026-10-21 · Pin TypeScript to 6.0

Why: typescript-eslint, which the lint step uses, supports TypeScript below 6.1 (checked 2026-10-21). We move to 7 once it supports 7.
Rejected: TypeScript 7 (ESLint would lose its TypeScript-aware rules until typescript-eslint catches up).
Source: docs/specs/walking-skeleton.md
Status: active

## D29 · 2026-10-21 · UI components live in the app until tawaf

Why: slice 0 builds two, the top card and the primary button. Keeping them in `src/ui/` leaves the design-system package tokens-only, so `/design-sync` needs no change. They move into the package when `tawaf` adds more.
Rejected: exporting them from the design-system package now (the next `/design-sync` would have to switch the package from tokens-only to a component library for two components).
Source: docs/specs/walking-skeleton.md
Status: active

## D30 · 2026-10-21 · Fork PRs get the build and unit tests, never secrets

Why: the repo is public (D23), and fork PRs get no secrets, so they can't deploy. Deploy and e2e are skipped for them, and the owner reviews a fork PR by hand before merging, because GitHub counts a skipped required check as passed.
Rejected: `pull_request_target` (it runs fork code with the Cloudflare token), letting fork PRs fail at the deploy step (every outside PR would look broken).
Source: docs/specs/walking-skeleton.md
Status: active
