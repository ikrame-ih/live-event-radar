/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetTelemetryStore, useTelemetryStore } from "../state/telemetry-store";
import { useStockWebSocket } from "./use-stock-websocket";

type MockWebSocket = {
  url: string;
  onopen: (() => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  close: ReturnType<typeof vi.fn>;
};

let lastSocket: MockWebSocket | null = null;

beforeEach(() => {
  resetTelemetryStore();
  lastSocket = null;

  vi.stubGlobal(
    "WebSocket",
    vi.fn().mockImplementation(function WebSocketMock(url: string) {
      const socket: MockWebSocket = {
        url,
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null,
        close: vi.fn(),
      };
      lastSocket = socket;
      return socket;
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useStockWebSocket", () => {
  it("returns error for invalid protocols without opening a socket", () => {
    const { result } = renderHook(() =>
      useStockWebSocket("https://example.com/not-ws")
    );

    expect(result.current).toBe("error");
    expect(WebSocket).not.toHaveBeenCalled();
  });

  it("returns connecting then open when the socket connects", () => {
    const { result } = renderHook(() =>
      useStockWebSocket("wss://example.com/stream")
    );

    expect(result.current).toBe("connecting");

    act(() => {
      lastSocket?.onopen?.();
    });

    expect(result.current).toBe("open");
  });

  it("appends parsed events from valid message frames", () => {
    renderHook(() => useStockWebSocket("wss://example.com/stream"));

    act(() => {
      lastSocket?.onopen?.();
      lastSocket?.onmessage?.({
        data: JSON.stringify({
          zone: "South Gate",
          item: "Soda",
          quantity: -1,
          timestamp: 1,
        }),
      });
    });

    expect(useTelemetryStore.getState().events).toHaveLength(1);
    expect(useTelemetryStore.getState().events[0]?.zone).toBe("South Gate");
  });

  it("drops malformed JSON and invalid event shapes without closing", () => {
    renderHook(() => useStockWebSocket("wss://example.com/stream"));

    act(() => {
      lastSocket?.onopen?.();
      lastSocket?.onmessage?.({ data: "not-json{" });
      lastSocket?.onmessage?.({
        data: JSON.stringify({ zone: "South Gate" }),
      });
      lastSocket?.onmessage?.({
        data: JSON.stringify({
          zone: "South Gate",
          item: "Soda",
          quantity: -1,
          timestamp: 2,
        }),
      });
    });

    expect(useTelemetryStore.getState().events).toHaveLength(1);
    expect(lastSocket?.close).not.toHaveBeenCalled();
  });

  it("closes the socket on unmount without throwing", () => {
    const { unmount } = renderHook(() =>
      useStockWebSocket("wss://example.com/stream")
    );

    act(() => {
      lastSocket?.onopen?.();
    });

    expect(() => unmount()).not.toThrow();
    expect(lastSocket?.close).toHaveBeenCalled();
  });
});
