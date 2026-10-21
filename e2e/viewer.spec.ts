import { expect, test } from "@playwright/test";
import { lowerHalfColours } from "./frame";

test("draws the Kaabah", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app")).toHaveAttribute("data-state", "ready");
  await expect(page.locator(".backdrop")).toHaveCSS("opacity", "0");
  const shot = await page.locator("canvas").screenshot();
  expect(lowerHalfColours(shot)).toBeGreaterThan(1);
});

test("says when the view stops", async ({ page }) => {
  await page.goto("/");
  const app = page.locator(".app");
  await expect(app).toHaveAttribute("data-state", "ready");
  await page.evaluate(() =>
    document
      .querySelector("canvas")
      ?.getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext(),
  );
  await expect(app).toHaveAttribute("data-state", "stopped");
  await expect(page.getByText("The 3D view stopped.")).toBeVisible();
  await expect(
    page.getByText("Reload the page to start it again."),
  ).toBeVisible();
  await Promise.all([
    page.waitForEvent("load"),
    page.getByRole("button", { name: "Reload" }).click(),
  ]);
  await expect(app).toHaveAttribute("data-state", "ready");
});

test("says when there is no WebGL 2", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".app")).toHaveAttribute("data-state", "no-webgl");
  await expect(
    page.getByText("This browser can't show the 3D view."),
  ).toBeVisible();
  await expect(
    page.getByText("Open this link in an up-to-date Chrome or Safari."),
  ).toBeVisible();
  await expect(page.getByRole("button")).toHaveCount(0);
});
