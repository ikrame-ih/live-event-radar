import { describe, expect, it } from "vitest";
import type { StockEvent } from "../types";
import {
  estimateMinutesUntilEmpty,
  formatEtaLabel,
} from "./estimate-minutes-until-empty";

function evt(quantity: number, timestamp: number): StockEvent {
  return {
    zone: "South Gate",
    item: "Soda",
    quantity,
    timestamp,
  };
}

describe("estimateMinutesUntilEmpty", () => {
  it("returns null when consumption is below the projection floor", () => {
    const now = 60_000;
    // One tiny sip in 60s ⇒ 0.2 units/min < ETA_MIN_RATE_PER_MIN (0.8).
    const eta = estimateMinutesUntilEmpty(
      "South Gate",
      80,
      [evt(-0.2, now - 1_000)],
      now
    );
    expect(eta.minutes).toBeNull();
    expect(formatEtaLabel(eta)).toBe("Stable pace");
  });

  it("projects minutes from recent consumption rate", () => {
    const now = 60_000;
    // 30 units over 60s ⇒ 30/min; stock 60 units ⇒ ~2 minutes.
    const events = Array.from({ length: 30 }, (_, i) => evt(-1, now - 59_000 + i * 1_000));
    const eta = estimateMinutesUntilEmpty("South Gate", 60, events, now);
    expect(eta.minutes).toBe(2);
    expect(formatEtaLabel(eta)).toMatch(/2 min/);
  });

  it("reports 0 minutes when stock is already empty", () => {
    const eta = estimateMinutesUntilEmpty("South Gate", 0, [], 1_000);
    expect(eta.minutes).toBe(0);
  });
});
