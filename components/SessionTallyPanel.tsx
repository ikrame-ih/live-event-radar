"use client";

import { useEffect, useMemo, useState } from "react";
import { deriveSessionTally } from "@/features/live-radar/lib/derive-session-tally";
import { ZONE_META, type ZoneSnapshot } from "@/features/live-radar/lib/zone-stock";
import { useSessionStore } from "@/features/live-radar/state/session-store";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

type SessionTallyPanelProps = {
  snapshots: ZoneSnapshot[];
};

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes < 60) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours}h ${remMin}m`;
}

export function SessionTallyPanel({ snapshots }: SessionTallyPanelProps) {
  const events = useTelemetryStore((s) => s.events);
  const startedAt = useSessionStore((s) => s.startedAt);
  const endedAt = useSessionStore((s) => s.endedAt);
  const selectedZone = useSessionStore((s) => s.selectedZone);
  const endSession = useSessionStore((s) => s.endSession);
  const resumeSession = useSessionStore((s) => s.resumeSession);
  const newSession = useSessionStore((s) => s.newSession);
  const selectZone = useSessionStore((s) => s.selectZone);

  const [now, setNow] = useState<number | null>(null);
  const frozen = endedAt !== null;
  const mounted = now !== null;

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (frozen || !mounted) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [frozen, mounted]);

  const clock = now ?? startedAt;

  const tally = useMemo(
    () =>
      deriveSessionTally(events, {
        startedAt,
        endedAt,
        now: clock,
      }),
    [events, startedAt, endedAt, clock]
  );

  const stockByZone = useMemo(
    () => new Map(snapshots.map((s) => [s.zone, s.stock])),
    [snapshots]
  );

  const elapsedMs = (endedAt ?? clock) - startedAt;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="bry-stream-summary">
            {tally.totals.consumed} out
            <span aria-hidden="true"> · </span>
            {tally.totals.restocked} in
            <span aria-hidden="true"> · </span>
            net {tally.totals.net > 0 ? "+" : ""}
            {tally.totals.net}
          </p>
          <p className="mt-1 text-xs text-(--text-muted)">
            {frozen ? "Event ended" : "Running"}
            {mounted ? ` · ${formatElapsed(elapsedMs)}` : ""}
            {frozen ? " frozen" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {frozen ? (
            <>
              <button
                type="button"
                className="bry-btn-secondary"
                onClick={() => resumeSession()}
              >
                Resume
              </button>
              <button
                type="button"
                className="bry-btn-primary"
                onClick={() => newSession()}
              >
                New session
              </button>
            </>
          ) : (
            <button
              type="button"
              className="bry-btn-primary"
              onClick={() => endSession()}
            >
              End event
            </button>
          )}
        </div>
      </div>

      {tally.totals.eventCount === 0 ? (
        <div
          className="bry-inner px-4 py-10 text-center text-sm text-(--text-muted)"
          role="status"
        >
          Totals will appear as stock moves during the event.
        </div>
      ) : (
        <ul className="flex list-none flex-col gap-3" aria-live="polite">
          {tally.zones
            .filter((row) => row.eventCount > 0)
            .sort(
              (a, b) =>
                b.consumed - a.consumed || b.restocked - a.restocked
            )
            .map((row) => {
              const isSelected = selectedZone === row.zone;
              const stock = stockByZone.get(row.zone);
              const short =
                ZONE_META[row.zone]?.short ?? row.zone.split(" ")[0];
              return (
                <li key={row.zone}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectZone(row.zone)}
                    className={`bry-incident-row bry-row-capsule bry-row-enter flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left ${
                      isSelected ? "bry-incident-row-selected" : ""
                    }`}
                    style={
                      isSelected
                        ? {
                            ["--row-accent" as string]:
                              "var(--semantic-coral)",
                          }
                        : undefined
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="bry-card-title truncate">{row.zone}</p>
                      <p className="mt-0.5 text-xs text-(--text-muted)">
                        {short}
                        {stock != null ? ` · stock now ${stock}%` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="bry-metric text-sm text-(--semantic-coral)">
                        −{row.consumed}
                      </p>
                      <p className="bry-metric text-xs text-(--semantic-teal)">
                        +{row.restocked}
                      </p>
                      <p className="mt-0.5 text-[11px] text-(--text-muted)">
                        net {row.net > 0 ? "+" : ""}
                        {row.net}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
