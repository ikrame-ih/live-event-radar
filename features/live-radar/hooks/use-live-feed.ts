"use client";

import { SIMULATOR_TICK_MS } from "../constants";
import { useSimulatorStream } from "./use-simulator-stream";
import { useStockWebSocket } from "./use-stock-websocket";

export function useLiveFeed() {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();
  const simulatorOnly = process.env.NEXT_PUBLIC_SIMULATOR_ONLY === "true";
  const streamRateLabel =
    !simulatorOnly && wsUrl
      ? "~live"
      : `~${(1000 / SIMULATOR_TICK_MS).toFixed(1)}/s`;

  const wsStatus = useStockWebSocket(
    simulatorOnly || !wsUrl ? undefined : wsUrl
  );
  useSimulatorStream({ wsUrl, simulatorOnly });

  return { wsUrl, simulatorOnly, wsStatus, streamRateLabel };
}
