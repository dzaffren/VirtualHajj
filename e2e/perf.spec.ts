import { expect, test } from "@playwright/test";

test("draws the full load", async ({ page }) => {
  await page.goto("/perf/");
  const drawn = page.locator("[data-drawn]");
  await expect(drawn).toHaveText(/triangles/);
  const [triangles, calls] = (await drawn.innerText())
    .replace(/,/g, "")
    .match(/\d+/g)!
    .map(Number);
  expect(triangles).toBeGreaterThanOrEqual(200_000);
  expect(calls).toBeGreaterThanOrEqual(100);
});
