"use client";

import { SIMULATOR_TICK_MS } from "@/features/live-radar/constants";
import type { WsConnectionStatus } from "@/features/live-radar/hooks/use-stock-websocket";

type ConnectionStatusBadgeProps = {
  simulatorOnly: boolean;
  wsUrl?: string;
  wsStatus: WsConnectionStatus;
};

function resolveFeedLabel(
  simulatorOnly: boolean,
  wsUrl: string | undefined,
  wsStatus: WsConnectionStatus
): { title: string; detail: string; tone: "sim" | "live" | "warn" } {
  const mockRate = `${(1000 / SIMULATOR_TICK_MS).toFixed(1)}/s`;

  if (!wsUrl || simulatorOnly) {
    return { title: "Simulator", detail: `Mock · ${mockRate}`, tone: "sim" };
  }

  switch (wsStatus) {
    case "connecting":
      return { title: "Connecting", detail: "WebSocket", tone: "warn" };
    case "open":
      return { title: "Live", detail: "WebSocket", tone: "live" };
    case "error":
      return { title: "Connection error", detail: "Check feed URL", tone: "warn" };
    case "closed":
      return { title: "Offline", detail: "Socket closed", tone: "warn" };
    default:
      return { title: "Simulator", detail: `Mock · ${mockRate}`, tone: "sim" };
  }
}

const toneColor = {
  sim: "var(--gradient-start)",
  live: "var(--semantic-teal)",
  warn: "var(--semantic-amber)",
} as const;

export function ConnectionStatusBadge({
  simulatorOnly,
  wsUrl,
  wsStatus,
}: ConnectionStatusBadgeProps) {
  const { title, detail, tone } = resolveFeedLabel(simulatorOnly, wsUrl, wsStatus);

  return (
    <div
      role="status"
      aria-live="polite"
      className="bry-inset bry-glass inline-flex items-center gap-2.5 px-4 py-2 text-sm"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-25"
          style={{ background: toneColor[tone] }}
        />
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: toneColor[tone] }}
        />
      </span>
      <span className="font-semibold">{title}</span>
      <span className="text-[var(--text-muted)]">· {detail}</span>
    </div>
  );
}
