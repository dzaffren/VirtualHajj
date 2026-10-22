import { expect, test } from "@playwright/test";
import {
  openTawaf,
  past,
  walkArc,
  walkLaps,
  walkTo,
  walkToAngle,
  walkToLine,
} from "./tawaf";

// Walking takes a while on CI, even at the hook's pace (O26).
test.describe.configure({ timeout: 120_000 });

test("walks seven rounds with hints on", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start tawaf" }).click();
  await expect(page).toHaveURL(/\/tawaf\/$/);
  await openTawaf(page);
  await expect(page.getByText("Before you start")).toBeVisible();

  await walkToLine(page);
  await expect(page.getByText("Round 1 of 7")).toBeVisible();
  await walkLaps(page, 7, async (lap) => {
    if (lap === 7) return;
    await expect(page.getByText(`Round ${lap + 1} of 7`)).toBeVisible();
    if (lap !== 3) return;
    // In round 4, a 2 m step back clockwise to turn round names no mistake.
    const into = past + 0.5;
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
  await openTawaf(page);
  const before = await page.evaluate(() => window.vh!.position());
  const box = (await page.locator("canvas").boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.8);
  await expect
    .poll(() => page.evaluate(() => window.vh!.position()))
    .not.toEqual(before);
});

test("names the wrong way and the Hijr Ismail", async ({ page }) => {
  await openTawaf(page);
  await walkToLine(page);
  await walkLaps(page, 2);
  const card = page.locator(".card");
  await expect(card).toContainText("Round 3 of 7");

  // Round 3: 8 m on, then 4 m back clockwise, then on to the line.
  await walkToAngle(page, past + 0.5);
  await walkToAngle(page, past + 0.5 - 4 / 16);
  await expect(card).toContainText("This round does not count");
  await expect(card).toContainText(
    "Turn round, so the Kaabah is on your left.",
  );
  await walkArc(page, past + 0.5, past + 2 * Math.PI);
  await expect(card).toContainText("Round 3 of 7");

  // Round 3 again: in through the Hijr Ismail's east gap, out through the west one, and on to the line.
  await walkArc(page, past, 0.3);
  await walkTo(page, 8, -6);
  await walkTo(page, 0, -9);
  await expect(card).toContainText("This round does not count");
  await expect(card).toContainText("Walk outside the Hijr Ismail wall.");
  await walkTo(page, -8, -6);
  await walkArc(page, 2.8, past + 2 * Math.PI);
  await expect(card).toContainText("Round 3 of 7");

  await walkLaps(page, 5);
  const done = page.getByRole("dialog");
  await expect(done).toContainText(
    "Round 3: you walked with the Kaabah on your right.",
  );
  await expect(done).toContainText(
    "Round 3: you walked inside the Hijr Ismail.",
  );
});

test("counts with hints off", async ({ page }) => {
  await openTawaf(page);
  await page.getByRole("switch", { name: /Hints/ }).click();
  await openTawaf(page);

  // Hints stay off after a reload: no top card, and a Done button.
  await expect(page.getByRole("switch", { name: /Hints/ })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(page.locator(".card")).toHaveCount(0);
  const done = page.getByRole("button", { name: "Done" });
  await expect(done).toBeVisible();

  await walkToLine(page);
  await walkLaps(page, 6);
  await done.click();
  const card = page.locator(".card");
  await expect(card).toContainText("Not done yet");
  await expect(card).toContainText("Six rounds count. Tawaf has seven.");
  await expect(card).toContainText("Walk one more round, then press Done.");

  await walkLaps(page, 1);
  await expect(card).toHaveCount(0);
  await done.click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toContainText("Tawaf done. Seven rounds.");
  await expect(sheet).toContainText("You pressed Done after six rounds.");
});

test("the menu takes focus, and Escape gives it back", async ({ page }) => {
  await openTawaf(page);
  const menuButton = page.getByRole("button", { name: "Menu" });
  await menuButton.click();
  const menu = page.getByRole("dialog");
  await expect(menu.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(menuButton).toBeFocused();
});

test("switches to Malay in the middle of a tawaf", async ({ page }) => {
  await openTawaf(page);
  await walkToLine(page);
  await walkLaps(page, 1);
  const card = page.locator(".card");
  await expect(card).toContainText("Round 2 of 7");

  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("radio", { name: "Bahasa Melayu" }).click();
  await page.getByRole("button", { name: "Teruskan" }).click();
  await expect(card).toContainText("Pusingan 2 daripada 7");
  await walkLaps(page, 1);
  await expect(card).toContainText("Pusingan 3 daripada 7");

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ms");
  await expect(
    page.getByText("Seret untuk melihat sekeliling Kaabah."),
  ).toBeVisible();
});

test.describe("on a Malay phone", () => {
  test.use({ locale: "ms-MY" });

  test("starts in Malay on a Malay phone", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Mula tawaf" }).click();
    await expect(page).toHaveURL(/\/tawaf\/$/);
    await openTawaf(page);
    await expect(page.getByText("Sebelum mula")).toBeVisible();
    await walkToLine(page);
    await expect(page.getByText("Pusingan 1 daripada 7")).toBeVisible();
  });
});
