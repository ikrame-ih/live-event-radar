/**
 * One-shot README screenshot refresh.
 * Usage: npx playwright test e2e/capture-readme.spec.ts --project=desktop
 */
import { expect, test } from "@playwright/test";
import path from "node:path";

const OUT = path.join(process.cwd(), "docs", "assets", "readme");

test.describe.configure({ mode: "serial" });

test.skip(
  !process.env.CAPTURE_README,
  "Set CAPTURE_README=1 to refresh docs/assets/readme PNGs"
);

test("capture README screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // —— Command Center ——
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Session tally" })
  ).toBeVisible();
  await page.waitForTimeout(5500);
  await expect(page.locator(".bry-incident-row").first()).toBeVisible({
    timeout: 15_000,
  });

  // README preview: map + Session tally in frame (not just the KPI hero)
  await page
    .getByRole("heading", { name: "Session tally" })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUT, "command-center-activity.png"),
    type: "png",
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(OUT, "hero-command-center.png"),
    type: "png",
  });
  await page.screenshot({
    path: path.join(OUT, "command-center-full.png"),
    type: "png",
    fullPage: true,
  });

  const map = page.locator("#venue-map");
  await map.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await map.screenshot({
    path: path.join(OUT, "hero-venue-map-heat.png"),
    type: "png",
  });

  // —— Live dashboard ——
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Live dashboard", level: 1 })
  ).toBeVisible();
  await page.waitForTimeout(4500);
  await expect(page.locator(".bry-event-row").first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator("[data-venue-leaflet-map]")).toBeVisible();

  await page.screenshot({
    path: path.join(OUT, "telemetry-dashboard.png"),
    type: "png",
  });
  await page.screenshot({
    path: path.join(OUT, "telemetry-dashboard-full.png"),
    type: "png",
    fullPage: true,
  });
});
