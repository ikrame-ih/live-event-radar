/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SIMULATOR_TICK_MS } from "../constants";
import { REPLENISH_INTERVAL_MS } from "../lib/zone-stock";
import { resetTelemetryStore, useTelemetryStore } from "../state/telemetry-store";
import { useSimulatorStream } from "./use-simulator-stream";

beforeEach(() => {
  resetTelemetryStore();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useSimulatorStream", () => {
  it("seeds mid-event history on mount so the UI is not empty", () => {
    renderHook(() =>
      useSimulatorStream({ wsUrl: undefined, simulatorOnly: true })
    );

    expect(useTelemetryStore.getState().events.length).toBeGreaterThan(10);
  });

  it("appends another mock event on each tick after the seed", () => {
    renderHook(() =>
      useSimulatorStream({ wsUrl: undefined, simulatorOnly: true })
    );

    const afterSeed = useTelemetryStore.getState().events.length;

    act(() => {
      vi.advanceTimersByTime(SIMULATOR_TICK_MS);
    });

    expect(useTelemetryStore.getState().events.length).toBe(afterSeed + 1);
  });

  it("fires a restock pulse on the replenish interval", () => {
    renderHook(() =>
      useSimulatorStream({ wsUrl: undefined, simulatorOnly: true })
    );

    const before = useTelemetryStore.getState().events.length;

    act(() => {
      vi.advanceTimersByTime(REPLENISH_INTERVAL_MS);
    });

    const after = useTelemetryStore.getState().events;
    expect(after.length).toBeGreaterThan(before);
    expect(after.some((e) => e.item === "Crew restock")).toBe(true);
  });

  it("does not append events when a live WebSocket URL is configured", () => {
    renderHook(() =>
      useSimulatorStream({
        wsUrl: "wss://example.com/stream",
        simulatorOnly: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(SIMULATOR_TICK_MS * 3);
    });

    expect(useTelemetryStore.getState().events).toHaveLength(0);
  });

  it("keeps the mock stream when simulatorOnly is true even with a ws URL", () => {
    renderHook(() =>
      useSimulatorStream({
        wsUrl: "wss://example.com/stream",
        simulatorOnly: true,
      })
    );

    expect(useTelemetryStore.getState().events.length).toBeGreaterThan(0);
  });
});
