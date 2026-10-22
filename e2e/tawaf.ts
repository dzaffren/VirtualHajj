import { expect, type Page } from "@playwright/test";
import { lineAngle, onCircle } from "../src/scene/mataf";

// Steers the pilgrim through the ?e2e=1 hook (D43), round a circle 16 m out, clear of the Kaabah and the Hijr Ismail wall.
const r = 16;
// Just past the Hajar Aswad line. Add 2π for each lap.
export const past = lineAngle + 0.05;

// Opens /tawaf with the hook, once the first frame is drawn.
export async function openTawaf(page: Page) {
  await page.goto("/tawaf/?e2e=1");
  await expect(page.locator(".app")).toHaveAttribute("data-state", "ready");
}

export function walkTo(page: Page, x: number, z: number) {
  return page.evaluate(([x, z]) => window.vh!.walkTo(x, z), [x, z]);
}

export function walkToAngle(page: Page, angle: number) {
  const p = onCircle(r, angle);
  return walkTo(page, p.x, p.z);
}

// Round the circle from one angle to another, at most 30° a step, so no step cuts through the Kaabah.
export async function walkArc(page: Page, from: number, to: number) {
  const n = Math.ceil(Math.abs(to - from) / (Math.PI / 6));
  for (let i = 1; i <= n; i++)
    await walkToAngle(page, from + ((to - from) * i) / n);
}

// From the start, just past the Hajar Aswad line, so round 1 starts.
export function walkToLine(page: Page) {
  return walkToAngle(page, past);
}

// n laps anticlockwise from just past the line. after(lap) runs as each lap crosses the line.
export async function walkLaps(
  page: Page,
  n: number,
  after?: (lap: number) => Promise<void>,
) {
  for (let lap = 1; lap <= n; lap++) {
    await walkArc(
      page,
      past + 2 * Math.PI * (lap - 1),
      past + 2 * Math.PI * lap,
    );
    await after?.(lap);
  }
}
