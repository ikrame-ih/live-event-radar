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

function wsUrlError(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
      return "invalid protocol";
    }
    return null;
  } catch {
    return "invalid url";
  }
}

// Optional live feed. Returns connection status for the badge; no-op when url is undefined.
export function useStockWebSocket(url: string | undefined): WsConnectionStatus {
  const appendEvent = useTelemetryStore((s) => s.appendEvent);
  const [status, setStatus] = useState<"open" | "closed" | "error" | null>(
    null
  );
  const urlError = url ? wsUrlError(url) : null;

  useEffect(() => {
    if (!url || urlError) return;

    let done = false;
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
      setStatus(null);
    };
  }, [appendEvent, url, urlError]);

  if (!url) return "idle";
  if (urlError) return "error";
  if (status === null) return "connecting";
  return status;
}
