"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deriveSessionTally } from "@/features/live-radar/lib/derive-session-tally";
import { formatSessionTallyShare } from "@/features/live-radar/lib/format-session-tally-share";
import { ZONE_META } from "@/features/live-radar/lib/zone-stock";
import type { ZoneSnapshot } from "@/features/live-radar/lib/zone-stock";
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

function formatNet(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
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

  const elapsedRef = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);
  /** Stable until mount — avoids hydration text mismatch from live clock. */
  const [shareAt, setShareAt] = useState<Date | null>(null);
  const frozen = endedAt !== null;

  useEffect(() => {
    const write = () => {
      if (!elapsedRef.current) return;
      const end = endedAt ?? Date.now();
      elapsedRef.current.textContent = ` · ${formatElapsed(end - startedAt)}`;
    };
    write();
    if (frozen) return undefined;
    const id = window.setInterval(write, 1000);
    return () => window.clearInterval(id);
  }, [startedAt, endedAt, frozen]);

  useEffect(() => {
    setShareAt(new Date());
    if (frozen) return undefined;
    const id = window.setInterval(() => setShareAt(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, [frozen]);

  const tally = useMemo(
    () =>
      deriveSessionTally(events, {
        startedAt,
        endedAt,
      }),
    [events, startedAt, endedAt]
  );

  const stockByZone = useMemo(
    () => new Map(snapshots.map((s) => [s.zone, s.stock])),
    [snapshots]
  );

  const rows = useMemo(
    () =>
      [...tally.zones].sort(
        (a, b) => b.consumed - a.consumed || b.restocked - a.restocked
      ),
    [tally.zones]
  );

  const shareText = useMemo(
    () =>
      formatSessionTallyShare(tally, stockByZone, {
        frozen,
        // null until client mount — keeps SSR HTML identical to first paint
        at: shareAt,
      }),
    [tally, stockByZone, frozen, shareAt]
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mt-0 text-xs text-(--text-muted)">
            {frozen ? "Event ended" : "Running"}
            <span ref={elapsedRef} />
            {frozen ? " — totals frozen for handoff" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="bry-btn-secondary"
            onClick={() => void handleCopy()}
          >
            {copied ? "Copied" : "Copy"}
          </button>
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

      <div className="bry-tally-hero" aria-label="Session totals">
        <div className="bry-tally-hero-cell">
          <p className="bry-tally-hero-label">Taken out</p>
          <p className="bry-tally-hero-value bry-tally-hero-value--out">
            {tally.totals.consumed}
          </p>
        </div>
        <div className="bry-tally-hero-cell">
          <p className="bry-tally-hero-label">Put back</p>
          <p className="bry-tally-hero-value bry-tally-hero-value--in">
            {tally.totals.restocked}
          </p>
        </div>
        <div className="bry-tally-hero-cell">
          <p className="bry-tally-hero-label">Net change</p>
          <p className="bry-tally-hero-value bry-tally-hero-value--net">
            {formatNet(tally.totals.net)}
          </p>
        </div>
      </div>

      <p className="bry-tally-share" role="status">
        {shareText}
      </p>

      {tally.totals.eventCount === 0 ? (
        <div
          className="bry-inner px-4 py-10 text-center text-sm text-(--text-muted)"
          role="status"
        >
          Totals build as stock moves — End event freezes them for the
          coordinator handoff.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="bry-tally-table">
            <thead>
              <tr>
                <th scope="col">Zone</th>
                <th scope="col">Out</th>
                <th scope="col">In</th>
                <th scope="col">Net</th>
                <th scope="col">Now</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = selectedZone === row.zone;
                const stock = stockByZone.get(row.zone);
                const short =
                  ZONE_META[row.zone]?.short ?? row.zone.split(" ")[0];
                const shareOfOut =
                  tally.totals.consumed > 0
                    ? Math.round(
                        (row.consumed / tally.totals.consumed) * 100
                      )
                    : 0;
                return (
                  <tr
                    key={row.zone}
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => selectZone(row.zone)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectZone(row.zone);
                      }
                    }}
                  >
                    <td>
                      <p className="bry-card-title m-0 truncate">{row.zone}</p>
                      <p className="m-0 mt-0.5 text-xs text-(--text-muted)">
                        {short}
                        {shareOfOut > 0 ? (
                          <span className="bry-tally-share-of">
                            {shareOfOut}% of session out
                          </span>
                        ) : null}
                      </p>
                    </td>
                    <td className="bry-tally-num">−{row.consumed}</td>
                    <td className="bry-tally-num bry-tally-num--muted">
                      +{row.restocked}
                    </td>
                    <td className="bry-tally-num">{formatNet(row.net)}</td>
                    <td className="bry-tally-num bry-tally-num--muted">
                      {stock != null ? `${stock}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
