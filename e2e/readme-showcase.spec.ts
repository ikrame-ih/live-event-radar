import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { GIFEncoder, quantize, applyPalette } from "gifenc";

const showcaseDir = path.resolve(process.cwd(), "docs/assets/readme");
const framesDir = path.join(showcaseDir, "frames");
const demoGif = path.join(showcaseDir, "demo.gif");

test.describe.configure({ mode: "serial" });

test.use({
  viewport: { width: 1280, height: 800 },
});

test.beforeAll(() => {
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
});

async function captureFrame(page: import("@playwright/test").Page, index: number) {
  const file = path.join(framesDir, `frame-${String(index).padStart(3, "0")}.png`);
  await page.screenshot({ path: file, type: "png" });
  return file;
}

test("capture hero PNG and ~8s demo GIF", async ({ page }) => {
  const frames: string[] = [];
  let frameIndex = 0;

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Live operations" })
  ).toBeVisible();

  await page.waitForTimeout(2000);
  frames.push(await captureFrame(page, frameIndex++));

  await page.waitForTimeout(1500);
  frames.push(await captureFrame(page, frameIndex++));

  await page.screenshot({
    path: path.join(showcaseDir, "hero-command-center.png"),
    fullPage: false,
  });

  const venueMap = page.locator("#venue-map");
  await venueMap.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  frames.push(await captureFrame(page, frameIndex++));

  await page.screenshot({
    path: path.join(showcaseDir, "hero-venue-map-heat.png"),
    fullPage: false,
  });

  await page.waitForTimeout(800);
  frames.push(await captureFrame(page, frameIndex++));

  await page.getByRole("link", { name: "Event stream" }).click();
  await expect(
    page.getByRole("heading", { name: "LiveEvent Radar", level: 1 })
  ).toBeVisible();
  frames.push(await captureFrame(page, frameIndex++));

  await page.waitForTimeout(1200);
  frames.push(await captureFrame(page, frameIndex++));

  await expect(page.locator(".bry-row-capsule").first()).toBeVisible({
    timeout: 8000,
  });

  await page.waitForTimeout(1000);
  frames.push(await captureFrame(page, frameIndex++));

  await page.waitForTimeout(1000);
  frames.push(await captureFrame(page, frameIndex++));

  encodeGif(frames, demoGif);
});

function encodeGif(framePaths: string[], outputPath: string) {
  const gif = GIFEncoder();

  for (const framePath of framePaths) {
    const png = PNG.sync.read(fs.readFileSync(framePath));
    const { width, height, data } = png;
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);

    gif.writeFrame(index, width, height, {
      palette,
      delay: 1000,
    });
  }

  gif.finish();
  fs.writeFileSync(outputPath, Buffer.from(gif.bytes()));
}
