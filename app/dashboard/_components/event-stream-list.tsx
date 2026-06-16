"use client";

import { useMemo } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { StockEvent } from "@/features/live-radar/types";
import type { StreamFilters } from "./event-stream-filters";

type EventStreamListProps = {
  events: StockEvent[];
  filters: StreamFilters;
};

function matchesFilters(e: StockEvent, filters: StreamFilters): boolean {
  if (filters.zone !== "all" && e.zone !== filters.zone) return false;
  if (filters.status === "spike" && e.quantity > -2) return false;
  if (filters.status === "normal" && e.quantity <= -2) return false;
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    if (!e.zone.toLowerCase().includes(q) && !e.item.toLowerCase().includes(q)) return false;
  }
  return true;
}

function EventBadge({ event }: { event: StockEvent }) {
  if (event.quantity <= -2) {
    return (
      <span className="bry-status-badge bry-status-badge-alert">
        <AlertTriangle size={14} />
        Spike
      </span>
    );
  }
  if (event.quantity < 0) {
    return <span className="bry-status-badge bry-status-badge-warn">Consumed</span>;
  }
  return <span className="bry-status-badge bry-status-badge-live">Restock</span>;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function EventStreamList({ events, filters }: EventStreamListProps) {
  const rows = useMemo(() => {
    return [...events].reverse().filter((e) => matchesFilters(e, filters)).slice(0, 50);
  }, [events, filters]);

  if (rows.length === 0) {
    return (
      <div className="bry-inner bry-glass px-4 py-16 text-center text-sm text-[var(--text-muted)]">
        {events.length === 0
          ? "Events will appear here as the stream runs."
          : "No events match the current filters."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((e, i) => (
        <article
          key={`${e.timestamp}-${i}`}
          className="bry-row-capsule bry-row-enter flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5"
        >
          <EventBadge event={e} />

          <div className="min-w-0 flex-1">
            <p className="bry-caps">{e.zone}</p>
            <p className="mt-0.5 text-base font-bold">{e.item}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Event #{String(events.length - i).padStart(4, "0")}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p
              className={`font-mono text-lg font-bold tabular-nums ${
                e.quantity <= -2
                  ? "text-[var(--semantic-coral)]"
                  : e.quantity < 0
                    ? "text-[var(--semantic-amber)]"
                    : "text-[var(--semantic-teal)]"
              }`}
            >
              {e.quantity}
            </p>
            <p className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
              {formatTime(e.timestamp)}
            </p>
          </div>

          <button type="button" className="bry-btn-secondary shrink-0">
            View details
            <ChevronRight size={14} />
          </button>
        </article>
      ))}
    </div>
  );
}
