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

test("says when there is no WebGL 2, even before the app runs", async ({
  page,
}) => {
  await page.route("**/assets/*.js", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".app")).toHaveAttribute("data-state", "no-webgl");
  await expect(
    page.getByText("This browser can't show the 3D view."),
  ).toBeVisible();
});

test("says when the browser is too old to run the app", async ({ page }) => {
  // A browser that can't parse the bundle can't parse this check either.
  await page.addInitScript(() => {
    window.Function = function () {
      throw new SyntaxError("Unexpected token '{'");
    } as unknown as FunctionConstructor;
  });
  await page.route("**/assets/*.js", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".app")).toHaveAttribute("data-state", "no-webgl");
  await expect(
    page.getByText("Open this link in an up-to-date Chrome or Safari."),
  ).toBeVisible();
});
