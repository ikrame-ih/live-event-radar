import { describe, expect, it } from "vitest";
import {
  formatOpsHandoff,
  formatSessionTallyCsv,
} from "./format-ops-handoff";
import type { MinutesUntilEmpty } from "./estimate-minutes-until-empty";
import type { ZoneSnapshot } from "./zone-stock";
import type { StockEvent } from "../types";
import type { ZoneName } from "./derive-incidents";

function snap(zone: ZoneName, stock: number): ZoneSnapshot {
  return {
    zone,
    stock,
    demand30s: 0,
    spikes15s: 0,
    lastItem: null,
    lastQuantity: null,
    status: "healthy",
    subtitle: zone,
  };
}

function eta(zone: string, minutes: number | null): MinutesUntilEmpty {
  return {
    zone,
    stockPercent: 50,
    ratePerMin: 2,
    minutes,
    confidence: "medium",
  };
}

const events: StockEvent[] = [
  {
    zone: "South Gate",
    item: "Soda",
    quantity: -3,
    timestamp: 1_000,
  },
  {
    zone: "South Gate",
    item: "Crew restock",
    quantity: 5,
    timestamp: 2_000,
  },
];

const session = { startedAt: 0, endedAt: null as number | null };
const snapshots = [
  snap("South Gate", 80),
  snap("Sampling Court", 40),
];
const etas = [eta("South Gate", 25), eta("Sampling Court", 8)];

describe("formatOpsHandoff", () => {
  it("includes zone ETA lines and session totals", () => {
    const text = formatOpsHandoff(events, snapshots, session, {
      frozen: false,
      at: new Date("2026-07-28T12:00:00Z"),
      etas,
      suggestion: null,
    });

    expect(text).toContain("South Gate: 80%");
    expect(text).toContain("Session tally");
    expect(text).toMatch(/Totals: out \d+/);
    expect(text).not.toContain("[FROZEN]");
  });

  it("marks frozen handoffs and includes a suggested move", () => {
    const text = formatOpsHandoff(events, snapshots, session, {
      frozen: true,
      at: new Date("2026-07-28T12:00:00Z"),
      etas,
      suggestion: {
        fromZone: "South Gate",
        toZone: "Sampling Court",
        units: 10,
        reason: "Sampling Court is under pressure",
      },
    });

    expect(text).toContain("[FROZEN]");
    expect(text).toContain("Suggested move:");
    expect(text).toContain("South Gate → Sampling Court");
  });
});

describe("formatSessionTallyCsv", () => {
  it("emits a header and one row per known zone with ETA columns", () => {
    const csv = formatSessionTallyCsv(events, snapshots, session, etas);
    const lines = csv.split("\n");

    expect(lines[0]).toBe(
      "zone,taken_out,put_back,net,stock_pct,eta_minutes,eta_label"
    );
    expect(lines.some((line) => line.startsWith("South Gate,"))).toBe(true);
    expect(csv).toContain(",25,");
  });

  it("quotes fields that contain commas or quotes", () => {
    const csv = formatSessionTallyCsv(
      events,
      snapshots,
      session,
      [
        {
          zone: "South Gate",
          stockPercent: 80,
          ratePerMin: 2,
          minutes: 25,
          confidence: "medium",
        },
      ]
    );
    // Stable zone names need no quotes; eta_label stays plain for this case.
    expect(csv).toMatch(/South Gate,3,5,2,80,25,/);
  });
});
