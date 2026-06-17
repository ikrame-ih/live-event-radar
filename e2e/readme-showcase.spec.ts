import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
// @ts-expect-error — no bundled types
import ffmpegPath from "ffmpeg-static";

const showcaseDir = path.resolve(process.cwd(), "docs/assets/readme");
const demoWebm = path.join(showcaseDir, "demo.webm");
const demoMp4 = path.join(showcaseDir, "demo.mp4");

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

test("capture hero PNG and smooth demo MP4", async ({ page }) => {
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

  await page.waitForTimeout(2200);
});

test.afterEach(async ({ page }) => {
  const videoPath = await page.video()?.path();
  if (!videoPath) return;

  fs.copyFileSync(videoPath, demoWebm);
  convertWebmToMp4(demoWebm, demoMp4);
});

function convertWebmToMp4(source: string, target: string) {
  if (!ffmpegPath || !fs.existsSync(source)) return;

  spawnSync(
    ffmpegPath,
    [
      "-y",
      "-i",
      source,
      "-t",
      "8",
      "-an",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-vf",
      "scale=960:-2:flags=lanczos",
      target,
    ],
    { stdio: "ignore" }
  );
}
