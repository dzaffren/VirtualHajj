# VirtualHajj · architecture

**Status:** Active · **Updated:** 2026-10-22 by /ship tawaf-stations

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
    VH["index.html → viewer/App"] -->|Start tawaf link| TH["tawaf/index.html → tawaf/App"]
    VH -->|lang| ST["settings: localStorage"]
    TH -->|lang, hints| ST
    PH["perf/index.html → perf/App"] -->|readout| UI["ui/: TopCard, Sheet, buttons"]
    VH -->|state, copy| UI
    TH -->|view, copy| UI
    VH -->|renders in| CV["scene/canvasConfig: one Canvas setup"]
    TH -->|renders in| CV
    PH -->|renders in| CV
    CV -->|draws| BS["scene/BaseScene: sky, ground, Kaabah"]
    TH -->|draws| TS["scene/TawafScene + Pilgrim: Hijr wall, line, Maqam, pilgrim"]
    TS -->|on top of| BS
    PH -->|"Pilgrim, Hijr wall, line, Maqam"| TS
    PH -->|adds, then times| SL["perf/StressLoad + perf/meter"]
    PAL[scene/palette] -->|day or night colours| BS
```

All three pages share the canvas setup and the base scene, and `/perf` draws the tawaf parts too, so `/perf` measures what `/` and `/tawaf` draw (D22, D42). Each HTML file carries its first card as plain markup, so it shows before the JavaScript arrives. On `/` and `/tawaf`, a plain script before the bundle picks the language. It also shows the no-WebGL 2 message when the browser is too old to run the bundle. The UI uses the design system in `docs/design/design-system/`; the scene colours live in `src/scene/palette.ts`, outside it (D25).

Inside `/tawaf`, the walk runs in refs, outside React:

```mermaid
flowchart LR
    TS[scene/TawafScene floor] -->|tap x, z| W["tawaf/Walker, each frame"]
    K[arrow keys] -->|held keys, kept by tawaf/App| W
    W -->|"pose, target, keys, dt"| WK[scene/walk]
    WK -->|next pose| W
    W -->|new position| R[tawaf/tawafRules]
    R -->|"station entered: stop and stand"| W
    R -->|view, only when it changes| TH[tawaf/App]
    TH -->|view, hints, lang| HUD[tawaf/TawafHud]
    HUD -->|"Done, hints, menu, Start round 1, Show me how, Finish tawaf"| TH
    TH -->|"Show me how: raise the hand, from tawaf/showMe"| W
```

React renders only when the HUD's view changes, so the page does not re-render 60 times a second. At a station, the rules hold the walk, the `Walker` stands the pilgrim for istilam or the two rakaat, and the HUD shows the station sheet until the learner presses on. With `?e2e=1`, `Walker` adds `window.vh.walkTo` and `window.vh.position`, so the e2e tests walk the pilgrim (D43).

| Part                        | What it does                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/viewer/viewerState.ts` | Pure reducer: `loading → ready \| no-webgl`, and `→ stopped` when the browser drops the 3D view |
| `src/scene/orbitStep.ts`    | Pure keyboard orbit: arrow keys turn, `+` and `-` zoom, inside the camera limits                |
| `src/perf/meter.ts`         | Pure meter: frames counted in fixed one-second slots from the first frame, verdict at 5:00 |
| `src/tawaf/tawafRules.ts`   | Pure tawaf rules: counts rounds from the Hajar Aswad line, voids a round on a mistake, and handles Done (D32, D33). Raises the istilam and rakaat stations, and names the part of each round (D45 to D48) |
| `src/tawaf/showMe.ts`       | Pure curve for Show me how: the right hand rises, holds and falls, and cuts with reduced motion (D49) |
| `src/scene/walk.ts`         | Pure walk step: towards a tap or by the arrow keys, kept out of the Kaabah, off the Hijr wall and the Maqam's base, and inside the edge |
| `src/settings.ts`           | Picks the language and the hints from `localStorage` and the browser, and saves changes (D34, D35) |

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
