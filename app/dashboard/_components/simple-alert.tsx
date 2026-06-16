"use client";

import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { useMemo } from "react";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

type SimpleAlertProps = {
  className?: string;
};

export function SimpleAlert({ className = "" }: SimpleAlertProps) {
  const events = useTelemetryStore((s) => s.events);

  const spike = useMemo(() => {
    const windowMs = 15_000;
    const cutoff = new Date().getTime() - windowMs;
    return events
      .filter((e) => e.timestamp >= cutoff)
      .some((e) => e.quantity <= -2);
  }, [events]);

  if (!spike) {
    return (
      <div
        className={`ops-card flex items-start gap-4 rounded-2xl px-5 py-4 ${className}`}
        role="status"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ops-surface-muted)]">
          <IconCircleCheck
            className="h-5 w-5 text-[var(--ops-text-subtle)]"
            stroke={1.75}
            aria-hidden
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ops-text-primary)]">
            All clear
          </p>
          <p className="mt-0.5 text-xs text-[var(--ops-text-muted)]">
            No spike flagged — consumption within thresholds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-4 rounded-2xl border-2 border-[var(--ops-accent)] bg-[var(--ops-accent-soft)] px-5 py-4 shadow-[var(--ops-shadow)] transition-colors duration-250 ${className}`}
      role="alert"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ops-accent-muted)]">
        <IconAlertTriangle
          className="h-5 w-5 text-[var(--ops-accent)]"
          stroke={1.75}
          aria-hidden
        />
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--ops-accent)]">
          High consumption · Sampling Court
        </p>
        <p className="mt-0.5 text-xs text-[var(--ops-text-muted)]">
          Heavy draw in the last ~15 s. Check venue map.
        </p>
      </div>
    </div>
  );
}
