"use client";

import { MAX_EVENTS } from "@/features/live-radar/constants";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

const maxEventsReadable = Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
}).format(MAX_EVENTS);

type KpiStripProps = {
  layout?: "grid" | "sidebar";
};

export function KpiStrip({ layout = "grid" }: KpiStripProps) {
  const events = useTelemetryStore((s) => s.events);
  const latest = events.at(-1);

  const containerClass =
    layout === "sidebar"
      ? "flex h-full flex-col gap-4"
      : "grid gap-4 sm:grid-cols-2";

  return (
    <div className={containerClass}>
      <div className="ops-card flex-1 rounded-2xl p-5">
        <p className="text-sm font-medium text-[var(--ops-text-subtle)]">
          Buffered rows
        </p>
        <p
          className="mt-1 text-4xl font-bold tabular-nums text-[var(--ops-text-primary)] lg:text-5xl"
          data-kpi-buffer-count
        >
          {events.length}
        </p>
        <p className="mt-1 text-xs text-[var(--ops-text-subtle)]">
          cap {maxEventsReadable} · FIFO trim
        </p>
      </div>

      <div className="ops-card flex-1 rounded-2xl p-5">
        <p className="text-sm font-medium text-[var(--ops-text-subtle)]">
          Latest event
        </p>
        {latest ? (
          <>
            <p className="mt-1 text-lg font-semibold text-[var(--ops-text-primary)]">
              {latest.zone}
            </p>
            <p className="mt-0.5 text-sm text-[var(--ops-text-muted)]">
              {latest.item}{" "}
              <span className="font-mono font-semibold tabular-nums text-[var(--ops-accent)]">
                {latest.quantity}
              </span>
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--ops-text-subtle)]">
            Waiting for first event…
          </p>
        )}
      </div>
    </div>
  );
}
