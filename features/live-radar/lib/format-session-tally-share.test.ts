import { describe, expect, it } from "vitest";
import { deriveSessionTally } from "./derive-session-tally";
import { formatSessionTallyShare } from "./format-session-tally-share";
import type { StockEvent } from "../types";

function evt(
  zone: string,
  quantity: number,
  timestamp: number
): StockEvent {
  return { zone, item: "Soda", quantity, timestamp };
}

describe("formatSessionTallyShare", () => {
  it("formats WhatsApp-ready out/in/net lines", () => {
    const events = [
      evt("South Gate", -4, 100),
      evt("South Gate", 2, 150),
      evt("Sampling Court", -6, 200),
    ];
    const tally = deriveSessionTally(events, {
      startedAt: 0,
      endedAt: 300,
    });
    const stock = new Map([
      ["South Gate", 88],
      ["Sampling Court", 70],
      ["Main Stage Walkway", 100],
    ]);
    const text = formatSessionTallyShare(tally, stock, {
      frozen: true,
      at: new Date("2026-07-23T15:00:00"),
    });

    expect(text).toContain("ENDED");
    expect(text).toContain("Total: 10 out · 2 in · net -8");
    expect(text).toContain("SG:");
    expect(text).toContain("60% of out");
    expect(text).toContain("now 88%");
  });
});
