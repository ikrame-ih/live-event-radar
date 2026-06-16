import { describe, expect, it } from "vitest";
import { formatRestockCountdown, msUntilNextRestock } from "./restock-countdown";
import { REPLENISH_INTERVAL_MS } from "./zone-stock";

describe("msUntilNextRestock", () => {
  it("returns full interval when no restock events exist", () => {
    expect(msUntilNextRestock([], 100_000)).toBe(REPLENISH_INTERVAL_MS);
  });

  it("counts down from the last restock pulse", () => {
    const now = 100_000;
    const events = [
      { zone: "South Gate", item: "Crew restock", quantity: 30, timestamp: now - 10_000 },
    ];
    expect(msUntilNextRestock(events, now)).toBe(50_000);
  });
});

describe("formatRestockCountdown", () => {
  it("formats seconds and minutes", () => {
    expect(formatRestockCountdown(12_000)).toBe("12s");
    expect(formatRestockCountdown(90_000)).toBe("1m 30s");
  });
});
