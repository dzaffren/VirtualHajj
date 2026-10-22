# VirtualHajj

**Status:** Active · **Updated:** 2026-10-22 by /ship tawaf-stations

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
- `src/tawaf/` — the tawaf page at `/tawaf`: the walk loop, the tawaf and station rules, Show me how and the HUD
- `src/perf/` — the stress page at `/perf`, which proves a scene holds 30 FPS on a Galaxy A35
- `src/scene/` — the 3D parts the pages share: canvas setup, base scene, scene palette, orbit camera, the tawaf scene, the pilgrim and the walk step
- `src/ui/` — the HUD components: top card, buttons, sheets, station sheet, doa block, toast, hints switch, language choice
- `src/settings.ts` — the language and hints settings, kept on the device
- `e2e/` — Playwright tests, run by CI against the Cloudflare Pages preview
- `docs/` — specs, the design system and architecture notes

## Slices

| Slice              | Status  | What it does                                                                                                                  | Page |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- | ---- |
| walking-skeleton   | Shipped | A learner opens a link on a phone or laptop and turns the camera round a plain Kaabah; `/perf` proves a scene holds 30 FPS. | —    |
| tawaf              | Shipped | A learner walks a man in ihram seven times round the Kaabah, anticlockwise from the Hajar Aswad line, and the app names each mistake when it happens. With the hints off, the learner counts the rounds alone. | —    |
| tawaf-stations     | Shipped | The tawaf page teaches what a pilgrim does and says at three stations: istilam at the Hajar Aswad line, the doa from the Rukun Yamani, and two rakaat behind the Maqam Ibrahim. | —    |

## More

README.md · docs/ARCHITECTURE.md · DECISIONS.md · CHANGELOG.md
