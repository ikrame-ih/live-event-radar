"use client";

import { useEffect, useState } from "react";
import { parseStockEvent } from "../parse-stock-event";
import { useTelemetryStore } from "../state/telemetry-store";

export type WsConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";

// Opens a WebSocket when url is set; returns connection status for the feed badge.
export function useStockWebSocket(url: string | undefined): WsConnectionStatus {
  const appendEvent = useTelemetryStore((s) => s.appendEvent);
  const [status, setStatus] = useState<WsConnectionStatus>("idle");

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }

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
        // Bad JSON frame — ignore and keep the connection open.
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
