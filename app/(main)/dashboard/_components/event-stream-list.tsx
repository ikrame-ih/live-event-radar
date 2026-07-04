"use client";

import { useMemo } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { StockEvent } from "@/features/live-radar/types";
import type { StreamFilters } from "./event-stream-filters";

type EventStreamListProps = {
  events: StockEvent[];
  filters: StreamFilters;
};

function latestEventLabel(events: StockEvent[]): string {
  if (events.length === 0) return "";
  const latest = events[events.length - 1];
  return `${latest.zone}, ${latest.item}, quantity ${latest.quantity}`;
}

function matchesFilters(event: StockEvent, filters: StreamFilters): boolean {
  if (filters.zone !== "all" && event.zone !== filters.zone) return false;
  if (filters.status === "spike" && event.quantity > -2) return false;
  if (filters.status === "normal" && event.quantity <= -2) return false;
  if (filters.search.trim()) {
    const query = filters.search.toLowerCase();
    if (
      !event.zone.toLowerCase().includes(query) &&
      !event.item.toLowerCase().includes(query)
    ) {
      return false;
    }
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
    return (
      <span className="bry-status-badge bry-status-badge-warn">Consumed</span>
    );
  }
  return (
    <span className="bry-status-badge bry-status-badge-live">Restock</span>
  );
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
    return [...events]
      .reverse()
      .filter((event) => matchesFilters(event, filters))
      .slice(0, 50);
  }, [events, filters]);

  const liveLabel = latestEventLabel(events);

  if (rows.length === 0) {
    return (
      <div className="bry-inner bry-glass px-4 py-16 text-center text-sm text-(--text-muted)">
        {events.length === 0
          ? "Events will appear here as the stream runs."
          : "No events match the current filters."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveLabel ? `Latest event: ${liveLabel}` : ""}
      </p>
      {rows.map((event, index) => (
        <article
          key={`${event.zone}-${event.item}-${event.timestamp}-${event.quantity}`}
          className="bry-event-row bry-row-capsule bry-row-enter p-4 sm:p-5"
        >
          <EventBadge event={event} />

          <div className="min-w-0 flex-1">
            <p className="bry-caps">{event.zone}</p>
            <p className="mt-0.5 text-base font-bold">{event.item}</p>
            <p className="mt-0.5 text-xs text-(--text-muted)">
              Event #{String(events.length - index).padStart(4, "0")}
            </p>
          </div>

          <div className="bry-event-quantity text-left sm:text-right">
            <p
              className={`font-mono text-lg font-bold tabular-nums ${
                event.quantity <= -2
                  ? "text-(--semantic-coral)"
                  : event.quantity < 0
                    ? "text-(--semantic-amber)"
                    : "text-(--semantic-teal)"
              }`}
            >
              {event.quantity}
            </p>
            <p className="font-mono text-xs tabular-nums text-(--text-muted)">
              {formatTime(event.timestamp)}
            </p>
          </div>

          <button type="button" className="bry-btn-secondary w-full sm:w-auto">
            View details
            <ChevronRight size={14} />
          </button>
        </article>
      ))}
    </div>
  );
}
