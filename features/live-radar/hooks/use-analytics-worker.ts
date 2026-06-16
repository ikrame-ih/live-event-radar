"use client";

import { useEffect, useState } from "react";
import type { InMsg, OutMsg } from "../workers/analytics.worker";

// Spawns the analytics worker, sends one echo job, returns the echoed text.
export function useAnalyticsWorker(text: string) {
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/analytics.worker.ts", import.meta.url)
    );

    worker.onmessage = (ev: MessageEvent<OutMsg>) => {
      if (ev.data.type === "ECHO") {
        setResponse(ev.data.text);
      }
    };

    const msg: InMsg = { type: "ECHO", text };
    worker.postMessage(msg);

    return () => {
      worker.terminate();
    };
  }, [text]);

  return response;
}
