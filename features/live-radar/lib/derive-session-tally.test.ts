import { describe, expect, it } from "vitest";
import { deriveSessionTally } from "./derive-session-tally";
import type { StockEvent } from "../types";

function evt(
  zone: string,
  quantity: number,
  timestamp: number,
  item = "Soda"
): StockEvent {
  return { zone, item, quantity, timestamp };
}

describe("deriveSessionTally", () => {
  it("sums consumed and restocked per zone inside the window", () => {
    const startedAt = 1_000;
    const events = [
      evt("South Gate", -3, 1_100),
      evt("South Gate", -2, 1_200),
      evt("South Gate", 10, 1_300),
      evt("Sampling Court", -5, 1_400),
      evt("Main Stage Walkway", -1, 900), // before start — ignored
    ];

    const tally = deriveSessionTally(events, {
      startedAt,
      endedAt: 2_000,
    });

    const south = tally.zones.find((z) => z.zone === "South Gate");
    expect(south).toMatchObject({
      consumed: 5,
      restocked: 10,
      net: 5,
      eventCount: 3,
    });

    const sampling = tally.zones.find((z) => z.zone === "Sampling Court");
    expect(sampling).toMatchObject({
      consumed: 5,
      restocked: 0,
      net: -5,
      eventCount: 1,
    });

    expect(tally.totals).toMatchObject({
      consumed: 10,
      restocked: 10,
      net: 0,
      eventCount: 4,
    });
  });

  it("freezes at endedAt so later events are ignored", () => {
    const events = [
      evt("South Gate", -4, 100),
      evt("South Gate", -8, 300),
    ];
    const tally = deriveSessionTally(events, {
      startedAt: 0,
      endedAt: 200,
    });
    expect(tally.totals.consumed).toBe(4);
    expect(tally.totals.eventCount).toBe(1);
  });

  it("returns zero rows for empty input", () => {
    const tally = deriveSessionTally([], { startedAt: 0, endedAt: 100 });
    expect(tally.zones).toHaveLength(3);
    expect(tally.totals.eventCount).toBe(0);
    expect(tally.totals.net).toBe(0);
  });
});
