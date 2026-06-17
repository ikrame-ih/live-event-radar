import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const showcaseDir = path.resolve(process.cwd(), "docs/assets/readme");

test.describe.configure({ mode: "serial" });

test.use({
  viewport: { width: 1280, height: 800 },
  video: {
    mode: "on",
    size: { width: 1280, height: 800 },
  },
});

test.beforeAll(() => {
  fs.mkdirSync(showcaseDir, { recursive: true });
});

test("capture hero, screens, and route transition clip", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Live operations" })
  ).toBeVisible();

  // Let the simulator populate KPIs, zone inventory, and activity rows.
  await page.waitForTimeout(4500);

  await page.screenshot({
    path: path.join(showcaseDir, "hero-command-center.png"),
    fullPage: false,
  });

  await page.screenshot({
    path: path.join(showcaseDir, "command-center-full.png"),
    fullPage: true,
  });

  const zoneActivity = page.locator("section", {
    has: page.getByRole("heading", { name: "Zone activity" }),
  });
  await expect(zoneActivity.getByText(/evt\/30s/).first()).toBeVisible({
    timeout: 8000,
  });

  await page.screenshot({
    path: path.join(showcaseDir, "command-center-activity.png"),
    fullPage: false,
  });

  await page.getByRole("link", { name: "Event stream" }).click();
  await expect(
    page.getByRole("heading", { name: "LiveEvent Radar", level: 1 })
  ).toBeVisible();
  await page.waitForTimeout(2500);

  await page.screenshot({
    path: path.join(showcaseDir, "telemetry-dashboard.png"),
    fullPage: false,
  });

  await page.screenshot({
    path: path.join(showcaseDir, "telemetry-dashboard-full.png"),
    fullPage: true,
  });

  await page.getByRole("link", { name: "Command Center" }).click();
  await expect(
    page.getByRole("heading", { name: "Live operations" })
  ).toBeVisible();
  await page.waitForTimeout(1200);
});

test.afterEach(async ({ page }) => {
  const videoPath = await page.video()?.path();
  if (!videoPath) return;

  fs.copyFileSync(videoPath, path.join(showcaseDir, "route-transition.webm"));
});
