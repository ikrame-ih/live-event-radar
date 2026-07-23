import { expect, test } from "@playwright/test";

test.describe("LiveEvent Radar — Command Center (root)", () => {
  test("root page renders command center with incidents", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Live now" })
    ).toBeVisible();
    await expect(page.getByText("Simulator")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Venue map" })
    ).toBeVisible();
  });

  test("session tally populates after stream runs", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Totals will appear as stock moves during the event.")
    ).toBeVisible();
    await page.waitForTimeout(3500);
    const tally = page.locator("section", {
      has: page.getByRole("heading", { name: "Session tally" }),
    });
    await expect(tally.getByText(/out/).first()).toBeVisible();
    await expect(tally.getByRole("button", { name: "End event" })).toBeVisible();
  });

  test("tally zone row toggles selection on repeat click", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3500);
    const row = page.locator(".bry-incident-row").first();
    await expect(row).toBeVisible();
    await row.click();
    await expect(row).toHaveAttribute("aria-pressed", "true");
    await row.click();
    await expect(row).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("LiveEvent Radar — /dashboard (live dashboard)", () => {
  test("shows title and stock events section", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Live dashboard", level: 1 })
    ).toBeVisible();
    await expect(
      page.locator('[role="status"].bry-inset', { hasText: "Simulator" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Venue map", level: 2 })
    ).toBeVisible();
    await expect(page.locator("[data-venue-leaflet-map]")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Stock events", level: 2 })
    ).toBeVisible();
    await expect(page.getByText("Stored")).toBeVisible();
    await expect(
      page.getByPlaceholder("Search by zone or product…")
    ).toBeVisible();
    await expect(page.getByRole("group", { name: "Zone filter" })).toBeVisible();
    await expect(
      page.getByRole("group", { name: "Event type filter" })
    ).toBeVisible();
    await expect(page.getByText("Teatinos")).toHaveCount(0);
  });

  test("mock stream grows KPI count without reload", async ({ page }) => {
    await page.goto("/dashboard");
    const count = page.locator("[data-kpi-buffer-count]");
    const before = Number((await count.textContent()) ?? "0");
    await page.waitForTimeout(2500);
    const after = Number((await count.textContent()) ?? "0");
    expect(after).toBeGreaterThan(before);
  });

  test("worker echo hook exposes sr-only marker", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.locator('[data-worker-echo="live-event-radar"]')
    ).toBeAttached();
  });

  test("stock event rows populate after mock runs", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(3500);
    await expect(page.locator(".bry-event-row").first()).toBeVisible();
    await expect(
      page.getByText("Spike").or(page.getByText("Consumed")).first()
    ).toBeVisible();
  });

  test("stock event click selects only that row", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(3500);
    const rows = page.locator(".bry-event-row");
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThan(1);
    await rows.nth(0).click();
    await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "true");
    await rows.nth(1).click();
    await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "false");
  });
});
