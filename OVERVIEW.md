# VirtualHajj

**Status:** Active · **Updated:** 2026-10-21 by /build walking-skeleton

A virtual, interactive 3D space for learning Hajj procedures such as tawaf, sa'i and miqat.

## Run it

| Task    | Command        |
| ------- | -------------- |
| install | `pnpm install` |
| run     | `pnpm dev`     |
| test    | `pnpm test`    |
| e2e     | `pnpm e2e`     |
| lint    | `pnpm lint`    |

## Where things are

- `src/viewer/` — the Kaabah viewer at `/`
- `src/perf/` — the stress page at `/perf`, which proves a scene holds 30 FPS on a Galaxy A35
- `src/scene/` — the 3D parts both pages share: canvas setup, base scene, scene palette, orbit camera
- `src/ui/` — the HUD components: top card, primary button
- `e2e/` — Playwright tests, run by CI against the Cloudflare Pages preview
- `docs/` — specs, the design system and architecture notes

## Slices

Nothing shipped yet

| Slice    | Status   | What it does | Page     |
| -------- | -------- | ------------ | -------- |
| none yet | none yet | none yet     | none yet |

## More

README.md · docs/ARCHITECTURE.md · DECISIONS.md · CHANGELOG.md
