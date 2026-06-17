import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const showcaseDir = path.resolve(process.cwd(), "docs/assets/readme");

test.describe.configure({ mode: "serial" });

test.use({
  viewport: { width: 1280, height: 800 },
});

test.beforeAll(() => {
  fs.mkdirSync(showcaseDir, { recursive: true });
});

test("capture README hero PNGs", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Live operations" })
  ).toBeVisible();

  await page.waitForTimeout(2200);
  await page.screenshot({
    path: path.join(showcaseDir, "hero-command-center.png"),
    fullPage: false,
  });

  const venueMap = page.locator("#venue-map");
  await venueMap.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400);

  await page.screenshot({
    path: path.join(showcaseDir, "hero-venue-map-heat.png"),
    fullPage: false,
  });

  await page.waitForTimeout(900);

  await page.getByRole("link", { name: "Event stream" }).click();
  await expect(
    page.getByRole("heading", { name: "LiveEvent Radar", level: 1 })
  ).toBeVisible();

  await page.waitForTimeout(1800);

  await expect(page.locator(".bry-row-capsule").first()).toBeVisible({
    timeout: 8000,
  });

  await page.screenshot({
    path: path.join(showcaseDir, "telemetry-dashboard.png"),
    fullPage: false,
  });
});
