import type { Page } from "@playwright/test";
import { lineAngle, onCircle } from "../src/scene/mataf";

// Steers the pilgrim through the ?e2e=1 hook (D43), round a circle 16 m out, clear of the Kaabah and the Hijr Ismail wall.
const r = 16;
const past = lineAngle + 0.05;

export function walkTo(page: Page, x: number, z: number) {
  return page.evaluate(([x, z]) => window.vh!.walkTo(x, z), [x, z]);
}

export function walkToAngle(page: Page, angle: number) {
  const p = onCircle(r, angle);
  return walkTo(page, p.x, p.z);
}

// From the start, just past the Hajar Aswad line, so round 1 starts.
export function walkToLine(page: Page) {
  return walkToAngle(page, past);
}

// Laps anticlockwise from just past the line, 12 points a lap. after(lap) runs as each lap crosses the line.
export async function walkLaps(
  page: Page,
  n: number,
  after?: (lap: number) => Promise<void>,
) {
  for (let lap = 1; lap <= n; lap++) {
    for (let i = 1; i <= 12; i++)
      await walkToAngle(page, past + 2 * Math.PI * (lap - 1 + i / 12));
    await after?.(lap);
  }
}
