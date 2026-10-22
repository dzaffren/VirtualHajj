import { expect, test, type Page } from "@playwright/test";
import { lineAngle } from "../src/scene/mataf";
import {
  openTawaf,
  past,
  walkArc,
  walkLaps,
  walkTo,
  walkToAngle,
  walkToLine,
  walkToSpot,
} from "./tawaf";

// Walking takes a while on CI, even at the hook's pace (O26).
test.describe.configure({ timeout: 120_000 });

test("walks seven rounds with hints on", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start tawaf" }).click();
  await expect(page).toHaveURL(/\/tawaf\/$/);
  await openTawaf(page);
  await expect(page.getByText("Before you start")).toBeVisible();

  // The pilgrim stops at the line for istilam, and a tap on the floor does not move it.
  await walkToAngle(page, past);
  const istilam = page.getByRole("region", { name: "The Hajar Aswad line" });
  await expect(istilam).toContainText("بِسْمِ اللهِ وَاللهُ أَكْبَرُ");
  await expect(istilam).toContainText("Bismillāhi wallāhu akbar");
  const stopped = await page.evaluate(() => window.vh!.position());
  const box = (await page.locator("canvas").boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.3);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.vh!.position())).toEqual(stopped);

  await istilam.getByRole("button", { name: "Start round 1" }).click();
  await expect(istilam).toHaveCount(0);
  await walkToAngle(page, past);
  const card = page.locator(".card");
  await expect(card).toContainText("Round 1 of 7");

  // Round 2 starts with the istilam reminder, and the doa shows from the Rukun Yamani to the line.
  const reminds = async (round: number) => {
    await expect(card).toContainText(`Round ${round} of 7`);
    await expect(card).toContainText(
      "Raise your right hand to the Hajar Aswad.",
    );
    await expect(card).toContainText(
      "Say “Bismillāhi wallāhu akbar”, and kiss your hand.",
    );
  };
  await walkLaps(page, 1);
  await reminds(2);
  const yamani = past + 2 * Math.PI + (5 * Math.PI) / 3;
  await walkArc(page, past + 2 * Math.PI, yamani);
  await expect(card).toContainText("Say this doa as you walk.");
  await expect(card).toContainText(
    "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
  );
  await expect(card).toContainText(
    "Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ʿadhāban-nār",
  );
  await expect(card).toContainText(
    "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
  );
  await walkArc(page, yamani, past + 4 * Math.PI);
  await reminds(3);

  // Rounds 3 to 7. Each lap ends where the last one did.
  await walkLaps(page, 5, async (lap) => {
    if (lap === 5) return;
    await reminds(lap + 3);
    if (lap !== 1) return;
    // In round 4, a 2 m step back clockwise to turn round names no mistake.
    const into = past + 0.5;
    await walkToAngle(page, into);
    await walkToAngle(page, into - 2 / 16);
    await walkToAngle(page, into);
    await expect(card).toContainText("Round 4 of 7");
    await expect(page.getByText("This round does not count")).toHaveCount(0);
  });

  // After round 7, a walk back clockwise to the spot behind the Maqam Ibrahim names no mistake.
  await expect(card).toContainText("Seven rounds done");
  await expect(card).toContainText(
    "Walk to the glowing spot behind the Maqam Ibrahim.",
  );
  await walkArc(page, past, past - Math.PI / 3);
  await expect(page.getByText("This round does not count")).toHaveCount(0);
  await walkToSpot(page);
  const rakaat = page.getByRole("region", {
    name: "Two rakaat behind the Maqam Ibrahim",
  });
  await expect(rakaat).toContainText(
    "In the first rakaat, read al-Kafirun after al-Fatihah.",
  );
  await expect(rakaat).toContainText(
    "In the second rakaat, read al-Ikhlas after al-Fatihah.",
  );
  await rakaat.getByRole("button", { name: "Finish tawaf" }).click();

  const done = page.getByRole("dialog");
  await expect(done).toContainText("Tawaf done. Seven rounds.");
  await expect(done).toContainText("No mistakes on the way.");
  await expect(done).not.toContainText("You did not pray");
  await done.getByRole("button", { name: "Walk again" }).click();
  await expect(done).toHaveCount(0);
  await expect(page.getByText("Before you start")).toBeVisible();
  await walkToLine(page);
  await expect(page.getByText("Round 1 of 7")).toBeVisible();
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
  await walkToSpot(page);
  await page.getByRole("button", { name: "Finish tawaf" }).click();
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
  await expect(page.locator(".toast")).toContainText("Seven rounds count.");
  await expect(card).toHaveCount(0);
  await page.getByRole("button", { name: "Finish tawaf" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toContainText("Tawaf done. Seven rounds.");
  await expect(sheet).toContainText("You pressed Done after six rounds.");
  await expect(sheet).toContainText(
    "You did not pray the two rakaat behind the Maqam Ibrahim. They are sunnah, so your tawaf still counts.",
  );
});

test("with hints off, the spot behind the Maqam acts as Done at seven", async ({
  page,
}) => {
  await openTawaf(page);
  await page.getByRole("switch", { name: /Hints/ }).click();
  await walkToLine(page);
  await walkLaps(page, 7);
  await walkToSpot(page);
  const rakaat = page.getByRole("region", {
    name: "Two rakaat behind the Maqam Ibrahim",
  });
  await rakaat.getByRole("button", { name: "Finish tawaf" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toContainText("Tawaf done. Seven rounds.");
  await expect(sheet).toContainText("No mistakes on the way.");
  await expect(sheet).not.toContainText("You did not pray");
});

test("Show me how lowers the sheet and brings it back", async ({ page }) => {
  await openTawaf(page);
  await walkToAngle(page, past);
  const istilam = page.getByRole("region", { name: "The Hajar Aswad line" });
  await expect(
    istilam.getByRole("button", { name: "Start round 1" }),
  ).toBeFocused();
  // The doa shows in Readex Pro until Amiri loads, or if it fails.
  await expect(istilam.locator(".doa-arabic")).toHaveCSS(
    "font-family",
    /^"?Amiri"?, "?Readex Pro"?,/,
  );
  await istilam.getByRole("button", { name: "Show me how" }).click();
  await expect(istilam).toHaveCount(0);
  await expect(istilam).toBeVisible();
  await expect(
    istilam.getByRole("button", { name: "Show me how" }),
  ).toBeFocused();

  // Start round 1 turns the pilgrim along the tawaf, so Up walks it anticlockwise: its angle round the Kaabah goes up.
  await istilam.getByRole("button", { name: "Start round 1" }).click();
  await expect(istilam).toHaveCount(0);
  const angle = async () => {
    const { x, z } = await page.evaluate(() => window.vh!.position());
    return Math.atan2(-z, x);
  };
  const before = await angle();
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(400);
  await page.keyboard.up("ArrowUp");
  await expect.poll(angle).toBeGreaterThan(before + 0.05);
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
    await walkToAngle(page, past);
    const istilam = page.getByRole("region", { name: "Garisan Hajar Aswad" });
    await expect(istilam).toContainText("Bismillāhi wallāhu akbar");
    await istilam.getByRole("button", { name: "Mula pusingan 1" }).click();
    await walkToAngle(page, past);
    const card = page.locator(".card");
    await expect(card).toContainText("Pusingan 1 daripada 7");
    await walkLaps(page, 1);
    await expect(card).toContainText("Pusingan 2 daripada 7");
    await expect(card).toContainText(
      "Angkat tangan kanan ke arah Hajar Aswad.",
    );
  });
});

test("says when the view stops on /tawaf", async ({ page }) => {
  await openTawaf(page);
  await walkToLine(page);
  await expect(page.getByText("Round 1 of 7")).toBeVisible();
  await page.evaluate(() =>
    document
      .querySelector("canvas")
      ?.getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext(),
  );
  const app = page.locator(".app");
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
  await expect(page.getByText("Before you start")).toBeVisible();
});

test.describe("on a Malay browser with no WebGL 2", () => {
  test.use({ locale: "ms-MY" });

  const saysSo = async (page: Page) => {
    await expect(page.locator(".app")).toHaveAttribute(
      "data-state",
      "no-webgl",
    );
    await expect(
      page.getByText("Pelayar ini tidak dapat menunjukkan paparan 3D."),
    ).toBeVisible();
    await expect(
      page.getByText("Buka pautan ini dalam Chrome atau Safari yang terkini."),
    ).toBeVisible();
    await expect(page.getByRole("button")).toHaveCount(0);
  };

  test("says when there is no WebGL 2 on /tawaf, in Malay", async ({
    page,
  }) => {
    await page.goto("/tawaf/");
    await saysSo(page);
  });

  test("says when there is no WebGL 2 on /tawaf, in Malay, before the app runs", async ({
    page,
  }) => {
    await page.route("**/assets/*.js", (route) => route.abort());
    await page.goto("/tawaf/");
    await saysSo(page);
  });
});

test("hints on in the menu after seven rounds leads to the Maqam Ibrahim", async ({
  page,
}) => {
  await openTawaf(page);
  await page.getByRole("switch", { name: /Hints/ }).click();
  await walkToLine(page);
  await walkLaps(page, 7);
  await page.getByRole("button", { name: "Menu" }).click();
  const menu = page.getByRole("dialog");
  await menu.getByRole("switch").click();

  await expect(menu).toHaveCount(1);
  await expect(menu).toContainText("Paused");
  await menu.getByRole("button", { name: "Carry on" }).click();
  const card = page.locator(".card");
  await expect(card).toContainText("Seven rounds done");
  await expect(card).toContainText(
    "Walk to the glowing spot behind the Maqam Ibrahim.",
  );
});

test("an open sheet keeps focus from the controls behind it", async ({
  page,
}) => {
  await openTawaf(page);
  await page.getByRole("switch", { name: /Hints/ }).click();
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(
    page.getByRole("dialog").getByRole("button", { name: "Close menu" }),
  ).toBeFocused();

  for (const key of ["Shift+Tab", "Tab", "Tab"]) {
    await page.keyboard.press(key);
    const behind = await page.evaluate(
      () =>
        document.activeElement !== document.body &&
        !document.activeElement?.closest("[role=dialog]"),
    );
    expect(behind, `focus after ${key}`).toBe(false);
  }
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the hints switch thumb jumps, not slides", async ({ page }) => {
    await openTawaf(page);
    await expect(page.locator(".top-bar .switch-thumb")).toHaveCSS(
      "transition-duration",
      "0s",
    );
  });
});

test("the menu starts the tawaf again, and goes back to the Kaabah view", async ({
  page,
}) => {
  await openTawaf(page);
  await walkToLine(page);
  await expect(page.getByText("Round 1 of 7")).toBeVisible();

  const menuButton = page.getByRole("button", { name: "Menu" });
  await menuButton.click();
  await page.getByRole("button", { name: "Start tawaf again" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Before you start")).toBeVisible();

  await menuButton.click();
  await page.getByRole("button", { name: "Back to the Kaabah view" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Drag to look round the Kaabah.")).toBeVisible();
});

test("the edge arrow shows while the line is out of sight, and turns the pilgrim to it", async ({
  page,
}) => {
  await openTawaf(page);
  const arrow = page.getByRole("button", {
    name: "Turn to the Hajar Aswad line",
  });
  await expect(arrow).toHaveCount(0);

  // Clockwise away from the line, before round 1, so the camera faces away from it.
  await walkArc(page, lineAngle - 0.5, lineAngle - 2.4);
  await expect(arrow).toBeVisible();
  await arrow.click();
  await expect(arrow).toHaveCount(0);
});

test("the arrow keys walk the pilgrim, but not while the menu is open", async ({
  page,
}) => {
  await openTawaf(page);
  const position = () => page.evaluate(() => window.vh!.position());
  const holdUp = async () => {
    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(400);
    await page.keyboard.up("ArrowUp");
  };

  // The pilgrim starts facing along the tawaf, so Up walks it anticlockwise: its angle round the Kaabah goes up.
  const angle = async () => {
    const { x, z } = await position();
    return Math.atan2(-z, x);
  };
  const start = await angle();
  await holdUp();
  await expect.poll(angle).toBeGreaterThan(start + 0.1);

  await page.getByRole("button", { name: "Menu" }).click();
  const paused = await position();
  await holdUp();
  expect(await position()).toEqual(paused);
});
