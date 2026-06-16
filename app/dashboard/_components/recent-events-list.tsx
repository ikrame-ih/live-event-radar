"use client";

import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

const ZONE_DOT: Record<string, string> = {
  "South Gate": "bg-[var(--ops-zone-a)]",
  "Sampling Court": "bg-[var(--ops-zone-b)]",
  "Main Stage Walkway": "bg-[var(--ops-zone-c)]",
};

export function RecentEventsList() {
  const events = useTelemetryStore((s) => s.events);
  const newestFirst = [...events].reverse().slice(0, 50);

  if (newestFirst.length === 0) {
    return (
      <p className="px-5 py-12 text-center text-sm text-[var(--ops-text-subtle)]">
        Events will appear here as the stream runs.
      </p>
    );
  }

  return (
    <ul className="max-h-72 divide-y divide-[var(--ops-border)] overflow-auto lg:max-h-96">
      {newestFirst.map((e, i) => (
        <li
          key={`${e.timestamp}-${i}`}
          className="flex items-center gap-3 px-5 py-3.5"
        >
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${ZONE_DOT[e.zone] ?? "bg-[var(--ops-border-strong)]"}`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--ops-text-primary)]">
              {e.zone}
            </p>
            <p className="truncate text-sm text-[var(--ops-text-muted)]">
              {e.item}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={`font-mono text-sm tabular-nums ${
                e.quantity < 0
                  ? "font-semibold text-[var(--ops-accent)]"
                  : "text-[var(--ops-text-muted)]"
              }`}
            >
              {e.quantity}
            </p>
            <p className="font-mono text-xs tabular-nums text-[var(--ops-text-subtle)]">
              {new Date(e.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
