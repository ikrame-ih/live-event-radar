/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SIMULATOR_TICK_MS } from "../constants";
import { useTelemetryStore } from "../state/telemetry-store";
import { useSimulatorStream } from "./use-simulator-stream";

beforeEach(() => {
  useTelemetryStore.setState({ events: [] });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useSimulatorStream", () => {
  it("appends mock events on the tick interval when mock mode is active", () => {
    renderHook(() =>
      useSimulatorStream({ wsUrl: undefined, simulatorOnly: true })
    );

    expect(useTelemetryStore.getState().events).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(SIMULATOR_TICK_MS);
    });

    expect(useTelemetryStore.getState().events.length).toBeGreaterThan(0);
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

    act(() => {
      vi.advanceTimersByTime(SIMULATOR_TICK_MS);
    });

    expect(useTelemetryStore.getState().events.length).toBeGreaterThan(0);
  });
});
