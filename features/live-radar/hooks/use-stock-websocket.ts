"use client";

import { useEffect, useState } from "react";
import { parseStockEvent } from "../parse-stock-event";
import { useTelemetryStore } from "../state/telemetry-store";

export type WsConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";

// Opens a WebSocket connection when a URL is provided and returns the current
// connection status so the UI can reflect it in the ConnectionStatusBadge.
// When url is undefined (mock-only mode), the hook stays idle and is a no-op.
export function useStockWebSocket(url: string | undefined): WsConnectionStatus {
  const appendEvent = useTelemetryStore((s) => s.appendEvent);
  const [status, setStatus] = useState<WsConnectionStatus>("idle");

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }

    // The `done` flag prevents state updates after the effect has cleaned up.
    // Without it, a late-arriving callback could update state on an unmounted component.
    let done = false;
    setStatus("connecting");
    const ws = new WebSocket(url);

    ws.onopen = () => {
      if (!done) setStatus("open");
    };

    ws.onclose = () => {
      if (!done) setStatus("closed");
    };

    ws.onerror = () => {
      if (!done) setStatus("error");
    };

    ws.onmessage = (msg) => {
      if (done) return;
      try {
        const data: unknown = JSON.parse(msg.data as string);
        const row = parseStockEvent(data);
        if (row) appendEvent(row);
      } catch {
        // Bad JSON frame — ignore silently and keep the connection open.
      }
    };

    return () => {
      done = true;
      ws.close();
      setStatus("idle");
    };
  }, [appendEvent, url]);

  return status;
}
