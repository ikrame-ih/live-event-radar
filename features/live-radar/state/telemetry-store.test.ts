import { beforeEach, describe, expect, it } from "vitest";
import { MAX_EVENTS } from "../constants";
import type { StockEvent } from "../types";
import { useTelemetryStore } from "./telemetry-store";

function fakeEvent(i: number): StockEvent {
  return { zone: "South Gate", item: "Soda", quantity: -1, timestamp: i };
}

beforeEach(() => {
  useTelemetryStore.setState({ events: [] });
});

describe("useTelemetryStore", () => {
  it("appends events", () => {
    useTelemetryStore.getState().appendEvent(fakeEvent(1));
    expect(useTelemetryStore.getState().events).toHaveLength(1);
  });

  it(`never keeps more than MAX_EVENTS (${MAX_EVENTS})`, () => {
    const { appendEvent } = useTelemetryStore.getState();
    for (let i = 0; i < MAX_EVENTS + 50; i++) {
      appendEvent(fakeEvent(i));
    }
    expect(useTelemetryStore.getState().events.length).toBe(MAX_EVENTS);
  });
});
