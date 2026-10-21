# VirtualHajj · architecture

**Status:** Active · **Updated:** 2026-10-21 by /ship walking-skeleton

## Context

```mermaid
flowchart LR
    L((Learner)) -->|opens link on phone or laptop| CF[Cloudflare Pages]
    CF -->|static build| B[Browser: React Three Fiber on WebGL 2]
    D((Developer)) -->|pushes a branch| GA[GitHub Actions]
    GA -->|deploys dist/, runs Playwright| CF
```

A static site. There is no server and no database: the browser draws every scene.

## Components

```mermaid
flowchart LR
    VH["index.html → viewer/App"] -->|state, copy| TC[ui/TopCard]
    PH["perf/index.html → perf/App"] -->|readout| TC
    VH -->|renders in| CV["scene/canvasConfig: one Canvas setup"]
    PH -->|renders in| CV
    CV -->|draws| BS["scene/BaseScene: sky, ground, Kaabah"]
    PH -->|adds| SL["perf/StressLoad + perf/Figure"]
    PH -->|frame times| MT[perf/meter]
    MT -->|lowest, verdict| PH
    PAL[scene/palette] -->|day or night colours| BS
```

Both pages share the canvas setup and the base scene, so `/perf` measures what `/` draws (D22). Each HTML file carries its first card as plain markup, so it shows before the JavaScript arrives. On `/`, a plain script before the bundle shows the no-WebGL 2 message when the browser is too old to run the bundle. The UI uses the design system in `docs/design/design-system/`; the scene colours live in `src/scene/palette.ts`, outside it (D25).

| Part                        | What it does                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/viewer/viewerState.ts` | Pure reducer: `loading → ready \| no-webgl`, and `→ stopped` when the browser drops the 3D view |
| `src/scene/orbitStep.ts`    | Pure keyboard orbit: arrow keys turn, `+` and `-` zoom, inside the camera limits                |
| `src/perf/meter.ts`         | Pure meter: frames counted in fixed one-second slots from the first frame, verdict at 5:00 |

## Deployment

```mermaid
flowchart TB
    PUSH["push to a branch, or merge to main"] -->|starts| CHK["typecheck, lint, vitest"]
    CHK -->|passes| BLD["vite build → dist/"]
    BLD -->|"dist/, CLOUDFLARE_API_TOKEN"| DEP["wrangler pages deploy"]
    DEP -->|branch| PV["preview: a URL per branch"]
    DEP -->|main| PR["production: virtualhajj.pages.dev"]
    DEP -->|deployment-url| E2E["playwright test"]
    E2E -->|opens| PV
```

`.github/workflows/ci.yml` runs one job, `ci`. Fork PRs stop after the build, because they get no secrets (D30). Roll back from Cloudflare Pages › virtualhajj › Deployments, or `git revert` and merge.
