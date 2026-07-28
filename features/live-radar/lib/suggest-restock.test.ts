import { describe, expect, it } from "vitest";
import type { MinutesUntilEmpty } from "./estimate-minutes-until-empty";
import { suggestRestockMove } from "./suggest-restock";
import type { ZoneSnapshot } from "./zone-stock";

function snap(zone: string, stock: number, status: ZoneSnapshot["status"] = "healthy"): ZoneSnapshot {
  return {
    zone,
    stock,
    demand30s: 0,
    spikes15s: 0,
    lastItem: null,
    lastQuantity: null,
    status,
    subtitle: zone,
  };
}

function eta(zone: string, minutes: number | null): MinutesUntilEmpty {
  return {
    zone,
    stockPercent: 50,
    ratePerMin: minutes == null ? 0 : 10,
    minutes,
    confidence: "medium",
  };
}

describe("suggestRestockMove", () => {
  it("suggests moving units from a healthy donor to an urgent zone", () => {
    const suggestion = suggestRestockMove(
      [
        snap("South Gate", 80),
        snap("Sampling Court", 25, "critical"),
        snap("Main Stage Walkway", 70),
      ],
      [
        eta("South Gate", 90),
        eta("Sampling Court", 8),
        eta("Main Stage Walkway", 60),
      ]
    );

    expect(suggestion).not.toBeNull();
    expect(suggestion?.toZone).toBe("Sampling Court");
    expect(suggestion?.fromZone).toBe("South Gate");
    expect(suggestion?.units).toBeGreaterThanOrEqual(5);
  });

  it("returns null when no donor has spare stock", () => {
    const suggestion = suggestRestockMove(
      [
        snap("South Gate", 40, "watch"),
        snap("Sampling Court", 30, "critical"),
        snap("Main Stage Walkway", 35, "watch"),
      ],
      [
        eta("South Gate", 15),
        eta("Sampling Court", 5),
        eta("Main Stage Walkway", 12),
      ]
    );
    expect(suggestion).toBeNull();
  });
});
