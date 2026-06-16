"use client";

import { useEffect } from "react";
import { parseStockEvent } from "../parse-stock-event";
import { useTelemetryStore } from "../state/telemetry-store";

// Opens a WebSocket when url is set; otherwise does nothing (simulator keeps the mock timer).
export function useStockWebSocket(url: string | undefined) {
  const appendEvent = useTelemetryStore((s) => s.appendEvent);

  useEffect(() => {
    if (!url) return;

    let done = false;
    const ws = new WebSocket(url);

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
    };
  }, [appendEvent, url]);
}
