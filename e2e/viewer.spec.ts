import { expect, test } from "@playwright/test";
import { lowerHalfColours } from "./frame";

test("draws the Kaabah", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app")).toHaveAttribute("data-state", "ready");
  await expect(page.locator(".backdrop")).toHaveCSS("opacity", "0");
  const shot = await page.locator("canvas").screenshot();
  expect(lowerHalfColours(shot)).toBeGreaterThan(1);
});
