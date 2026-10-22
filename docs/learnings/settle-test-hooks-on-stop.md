# A test hook's promise settles whenever the thing it waits for stops

**Learned:** 2026-10-22 · **From:** tawaf /build

`window.vh.walkTo` resolved only on arrival. The seventh crossing ended the tawaf and paused the walk 0.8 m before the last target, so the promise never resolved and the test hung for 2 minutes. It passed once by luck, because React took a frame to pause the walk.

Wrong: settle only on success. Right: settle on arrival, on a wall, and on pause.
