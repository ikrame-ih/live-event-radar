/**
 * Refresh docs/assets/readme PNGs.
 * Usage: CAPTURE_README=1 npx playwright test e2e/capture-readme.spec.ts --project=desktop
 */
import { expect, test } from "@playwright/test";
import path from "node:path";

const OUT = path.join(process.cwd(), "docs", "assets", "readme");

test.describe.configure({ mode: "serial" });

test.skip(
  !process.env.CAPTURE_README,
  "Set CAPTURE_README=1 to refresh docs/assets/readme PNGs"
);

async function settleLiveUi(page: import("@playwright/test").Page) {
  // Hide Next.js / tooling overlays that spoil marketing screenshots.
  await page.addStyleTag({
    content: `
      nextjs-portal, [data-nextjs-toast], [data-next-badge-root] {
        display: none !important;
      }
    `,
  });
  await page.waitForTimeout(6500);
}

test("capture README screenshots", async ({ page }) => {
  // Wide desktop frame; fullPage shots capture the whole route.
  await page.setViewportSize({ width: 1440, height: 900 });

  // —— Command Center (`/`) ——
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Session tally" })
  ).toBeVisible();
  await settleLiveUi(page);
  await expect(page.locator(".bry-incident-row").first()).toBeVisible({
    timeout: 20_000,
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  // Primary README preview: entire Command Center page
  await page.screenshot({
    path: path.join(OUT, "command-center-activity.png"),
    type: "png",
    fullPage: true,
    animations: "disabled",
  });
  await page.screenshot({
    path: path.join(OUT, "command-center-full.png"),
    type: "png",
    fullPage: true,
    animations: "disabled",
  });

  // Hero crop: above-the-fold only
  await page.screenshot({
    path: path.join(OUT, "hero-command-center.png"),
    type: "png",
    fullPage: false,
    animations: "disabled",
  });

  const map = page.locator("#venue-map");
  await map.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await map.screenshot({
    path: path.join(OUT, "hero-venue-map-heat.png"),
    type: "png",
    animations: "disabled",
  });

  // —— Live dashboard (`/dashboard`) ——
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Live dashboard", level: 1 })
  ).toBeVisible();
  await settleLiveUi(page);
  await expect(page.locator(".bry-event-row").first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.locator("[data-venue-leaflet-map]")).toBeVisible();
  // Wait for Leaflet tiles to paint
  await page.waitForTimeout(1500);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  await page.screenshot({
    path: path.join(OUT, "telemetry-dashboard.png"),
    type: "png",
    fullPage: true,
    animations: "disabled",
  });
  await page.screenshot({
    path: path.join(OUT, "telemetry-dashboard-full.png"),
    type: "png",
    fullPage: true,
    animations: "disabled",
  });
});
