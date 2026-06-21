import { expect, test } from "@playwright/test";

test.describe("LiveEvent Radar — Command Center (root)", () => {
  test("root page renders command center with incidents", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Live operations" })
    ).toBeVisible();
    await expect(page.getByText("Simulator")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Venue map" })
    ).toBeVisible();
  });

  test("incident sidebar populates after stream runs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Waiting for stream events…")).toBeVisible();
    await page.waitForTimeout(3500);
    const zoneActivity = page.locator("section", {
      has: page.getByRole("heading", { name: "Zone activity" }),
    });
    await expect(zoneActivity.getByText(/evt\/30s/).first()).toBeVisible();
  });

  test("zone activity row toggles selection on repeat click", async ({ page }) => {
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

test.describe("LiveEvent Radar — /dashboard (event stream)", () => {
  test("shows title and event stream section", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "LiveEvent Radar", level: 1 })
    ).toBeVisible();
    await expect(page.getByRole("status")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Venue map", level: 2 })
    ).toBeVisible();
    await expect(page.locator("[data-venue-leaflet-map]")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Event stream", level: 2 })
    ).toBeVisible();
    await expect(page.getByText("Buffered rows")).toBeVisible();
    await expect(page.getByPlaceholder("Search zone or item…")).toBeVisible();
  });

  test("mock stream grows KPI count without reload", async ({ page }) => {
    await page.goto("/dashboard");
    const count = page.locator("[data-kpi-buffer-count]");
    const before = Number((await count.textContent()) ?? "0");
    await page.waitForTimeout(2500);
    const after = Number((await count.textContent()) ?? "0");
    expect(after).toBeGreaterThan(before);
  });

  test("worker echo returns from background thread", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.locator('[data-worker-echo="live-event-radar"]')
    ).toBeAttached();
  });

  test("event stream rows populate after mock runs", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(3500);
    await expect(page.getByText("View details").first()).toBeVisible();
    await expect(
      page.getByText("Spike").or(page.getByText("Consumed")).first()
    ).toBeVisible();
  });
});
