import { describe, expect, it } from "vitest";
import type { StockEvent } from "../types";
import { deriveZoneSnapshots, stockHeat, zoneStatusCaption } from "./zone-stock";

describe("deriveZoneSnapshots", () => {
  const now = 1_700_000_000_000;

  it("starts at full stock with no events", () => {
    const snaps = deriveZoneSnapshots([], now);
    expect(snaps.every((s) => s.stock === 100)).toBe(true);
    expect(snaps.every((s) => s.status === "healthy")).toBe(true);
  });

  it("drops stock on consumption and recovers after idle time", () => {
    const events: StockEvent[] = [
      { zone: "South Gate", item: "Soda", quantity: -2, timestamp: now - 5000 },
      { zone: "South Gate", item: "Cap", quantity: -2, timestamp: now - 4000 },
    ];
    const drained = deriveZoneSnapshots(events, now);
    const sg = drained.find((s) => s.zone === "South Gate")!;
    expect(sg.stock).toBeLessThan(100);

    const recovered = deriveZoneSnapshots(events, now + 20_000);
    expect(recovered.find((s) => s.zone === "South Gate")!.stock).toBeGreaterThan(sg.stock);
  });

  it("restock events raise stock level", () => {
    const events: StockEvent[] = [
      { zone: "Sampling Court", item: "Soda", quantity: -2, timestamp: now - 3000 },
      { zone: "Sampling Court", item: "Crew restock", quantity: 30, timestamp: now - 1000 },
    ];
    const snap = deriveZoneSnapshots(events, now).find((s) => s.zone === "Sampling Court")!;
    expect(snap.stock).toBeGreaterThan(90);
  });
});

describe("zoneStatusCaption", () => {
  it("shows demand label when stock is full but spikes are high", () => {
    const snap = {
      zone: "Sampling Court",
      stock: 100,
      demand30s: 12,
      spikes15s: 3,
      lastItem: "Soda",
      lastQuantity: -2,
      status: "critical" as const,
      subtitle: "Activation · 6 stands",
    };
    expect(zoneStatusCaption(snap)).toBe("High demand");
  });
});

describe("stockHeat", () => {
  it("maps stock bands to heat levels", () => {
    expect(stockHeat(80)).toBe("cool");
    expect(stockHeat(50)).toBe("mid");
    expect(stockHeat(20)).toBe("hot");
  });
});
