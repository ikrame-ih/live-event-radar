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
    const tally = page.locator("section", {
      has: page.getByRole("heading", { name: "Session tally" }),
    });
    await expect(tally).toBeVisible();
    await expect(tally.getByRole("button", { name: "End event" })).toBeVisible();
    await expect(
      tally.getByRole("button", { name: "Copy for WhatsApp" })
    ).toBeVisible();
    await expect(tally.getByText("Taken out")).toBeVisible();

    // Wait for mock stream (~0.5 evt/s) to produce zone rows
    await expect(tally.locator(".bry-tally-table tbody tr").first()).toBeVisible(
      { timeout: 15_000 }
    );
    await expect(tally.getByText(/session tally/i).first()).toBeVisible();
  });

  test("tally zone row toggles selection on repeat click", async ({ page }) => {
    await page.goto("/");
    const row = page.locator(".bry-tally-table tbody tr").first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.click();
    await expect(row).toHaveAttribute("aria-selected", "true");
    await row.click();
    await expect(row).toHaveAttribute("aria-selected", "false");
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
    await expect(count).toBeVisible();
    const before = Number(
      ((await count.textContent()) ?? "0").replace(/,/g, "")
    );
    await expect
      .poll(
        async () =>
          Number(((await count.textContent()) ?? "0").replace(/,/g, "")),
        { timeout: 12_000 }
      )
      .toBeGreaterThan(before);
  });

  test("worker echo hook exposes sr-only marker", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.locator('[data-worker-echo="live-event-radar"]')
    ).toBeAttached();
  });

  test("stock event rows populate after mock runs", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator(".bry-event-row").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText("Spike").or(page.getByText("Consumed")).first()
    ).toBeVisible();
  });

  test("stock event click selects only that row", async ({ page }) => {
    await page.goto("/dashboard");
    const rows = page.locator(".bry-event-row");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    // Need two events for exclusive selection — tick is 2s
    await expect.poll(async () => rows.count(), { timeout: 12_000 }).toBeGreaterThan(1);
    await rows.nth(0).click();
    await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "true");
    await rows.nth(1).click();
    await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "false");
  });
});
