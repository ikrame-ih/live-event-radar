"use client";

import { useEffect, useState } from "react";
import { parseStockEvent } from "../parse-stock-event";
import { useTelemetryStore } from "../state/telemetry-store";

export type WsConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

// Optional live feed. Returns connection status for the badge; no-op when url is undefined.
export function useStockWebSocket(url: string | undefined): WsConnectionStatus {
  const appendEvent = useTelemetryStore((s) => s.appendEvent);
  const [status, setStatus] = useState<WsConnectionStatus>("idle");

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      setStatus("error");
      return;
    }
    if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
      setStatus("error");
      return;
    }

    // Guard against setState after unmount when a socket callback fires late.
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
        // malformed frame — keep socket open
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
