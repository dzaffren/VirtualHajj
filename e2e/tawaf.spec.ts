import { expect, test } from "@playwright/test";
import { lineAngle } from "../src/scene/mataf";
import { walkLaps, walkToAngle, walkToLine } from "./tawaf";

// Walking takes a while on CI, even at the hook's pace (O26).
test.describe.configure({ timeout: 120_000 });

test("walks seven rounds with hints on", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start tawaf" }).click();
  await expect(page).toHaveURL(/\/tawaf\/$/);
  await page.goto("/tawaf/?e2e=1");
  await expect(page.locator(".app")).toHaveAttribute("data-state", "ready");
  await expect(page.getByText("Before you start")).toBeVisible();

  await walkToLine(page);
  await expect(page.getByText("Round 1 of 7")).toBeVisible();
  await walkLaps(page, 7, async (lap) => {
    if (lap === 7) return;
    await expect(page.getByText(`Round ${lap + 1} of 7`)).toBeVisible();
    if (lap !== 3) return;
    // In round 4, a 2 m step back clockwise to turn round names no mistake.
    const into = lineAngle + 0.05 + 2 * Math.PI * 3 + 0.5;
    await walkToAngle(page, into);
    await walkToAngle(page, into - 2 / 16);
    await walkToAngle(page, into);
    await expect(page.getByText("Round 4 of 7")).toBeVisible();
    await expect(page.getByText("This round does not count")).toHaveCount(0);
  });

  const done = page.getByRole("dialog");
  await expect(done).toContainText("Tawaf done. Seven rounds.");
  await expect(done).toContainText("No mistakes on the way.");
  await expect(done.getByRole("button", { name: "Walk again" })).toBeVisible();
});

test("a click on the floor walks the pilgrim there", async ({ page }) => {
  await page.goto("/tawaf/?e2e=1");
  await expect(page.locator(".app")).toHaveAttribute("data-state", "ready");
  const before = await page.evaluate(() => window.vh!.position());
  const box = (await page.locator("canvas").boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.8);
  await expect
    .poll(() => page.evaluate(() => window.vh!.position()))
    .not.toEqual(before);
});
