"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, PackagePlus, TrendingDown } from "lucide-react";
import type { StockEvent } from "@/features/live-radar/types";
import type { StreamFilters } from "./event-stream-filters";

const VISIBLE_CAP = 24;

type EventStreamListProps = {
  events: StockEvent[];
  filters: StreamFilters;
  onFocusZone?: (zone: string | null) => void;
};

export function eventKey(event: StockEvent): string {
  return `${event.zone}|${event.timestamp}|${event.item}|${event.quantity}`;
}

export function matchesFilters(
  event: StockEvent,
  filters: StreamFilters
): boolean {
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

function latestEventLabel(events: StockEvent[]): string {
  if (events.length === 0) return "";
  const latest = events[events.length - 1];
  return `${latest.zone}, ${latest.item}, quantity ${latest.quantity}`;
}

function formatAge(ts: number): string {
  const seconds = Math.floor(Math.max(0, Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
}

function eventKind(quantity: number): "spike" | "consumed" | "restock" {
  if (quantity <= -2) return "spike";
  if (quantity < 0) return "consumed";
  return "restock";
}

function kindLabel(kind: ReturnType<typeof eventKind>): string {
  if (kind === "spike") return "Spike";
  if (kind === "consumed") return "Consumed";
  return "Restock";
}

function qtyClass(quantity: number): string {
  if (quantity <= -2) return "text-(--semantic-coral)";
  if (quantity < 0) return "text-(--semantic-amber)";
  return "text-(--semantic-teal)";
}

function EventIcon({ kind }: { kind: ReturnType<typeof eventKind> }) {
  const size = 14;
  if (kind === "spike") {
    return (
      <span className="bry-event-icon bry-event-icon--spike" aria-hidden>
        <AlertTriangle size={size} />
      </span>
    );
  }
  if (kind === "consumed") {
    return (
      <span className="bry-event-icon bry-event-icon--consumed" aria-hidden>
        <TrendingDown size={size} />
      </span>
    );
  }
  return (
    <span className="bry-event-icon bry-event-icon--restock" aria-hidden>
      <PackagePlus size={size} />
    </span>
  );
}

export function EventStreamList({
  events,
  filters,
  onFocusZone,
}: EventStreamListProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      [...events]
        .reverse()
        .filter((event) => matchesFilters(event, filters)),
    [events, filters]
  );

  const rows = useMemo(() => filtered.slice(0, VISIBLE_CAP), [filtered]);

  const summary = useMemo(() => {
    let spikes = 0;
    let restocks = 0;
    for (const event of filtered) {
      if (event.quantity <= -2) spikes += 1;
      else if (event.quantity > 0) restocks += 1;
    }
    return {
      matching: filtered.length,
      visible: rows.length,
      spikes,
      restocks,
    };
  }, [filtered, rows.length]);

  const liveLabel = latestEventLabel(events);

  function handleSelect(event: StockEvent) {
    const key = eventKey(event);
    if (selectedKey === key) {
      setSelectedKey(null);
      onFocusZone?.(null);
      return;
    }
    setSelectedKey(key);
    onFocusZone?.(event.zone);
  }

  if (rows.length === 0) {
    return (
      <div className="bry-stream-feed">
        <StreamSummary summary={summary} />
        <div
          className="bry-inner px-3 py-10 text-center text-sm text-(--text-muted)"
          role="status"
        >
          {events.length === 0
            ? "Events will show up here as stock moves."
            : "Nothing matches these filters — try clearing search or filters."}
        </div>
      </div>
    );
  }

  return (
    <div className="bry-stream-feed">
      <StreamSummary summary={summary} />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveLabel ? `Latest event: ${liveLabel}` : ""}
      </p>
      <div
        className="bry-stream-feed-list"
        data-stream-feed-list
        style={{ height: "20rem", maxHeight: "20rem", overflowY: "scroll" }}
      >
        {rows.map((event) => {
          const key = eventKey(event);
          const isSelected = selectedKey === key;
          const kind = eventKind(event.quantity);
          return (
            <article
              key={key}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${event.item}, ${event.zone}, quantity ${event.quantity}`}
              onClick={() => handleSelect(event)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(event);
                }
              }}
              className={`bry-event-row bry-event-row--dense bry-row-enter w-full cursor-pointer ${
                isSelected ? "bry-event-row-focused" : ""
              }`}
            >
              <EventIcon kind={kind} />

              <div className="min-w-0 flex-1">
                <p
                  className={`bry-event-meta ${
                    kind === "spike"
                      ? "text-(--semantic-coral)"
                      : kind === "consumed"
                        ? "text-(--semantic-amber)"
                        : "text-(--semantic-teal)"
                  }`}
                >
                  {event.zone}
                  <span aria-hidden="true"> · </span>
                  {kindLabel(kind)}
                </p>
                <p className="bry-card-title truncate text-[13px] leading-tight">
                  {event.item}
                  {event.quantity < 0 ? " consumption" : " restock"}
                </p>
                <p className="mt-0.5 text-[11px] text-(--text-muted)">
                  {formatAge(event.timestamp)}
                </p>
              </div>

              <p
                className={`bry-metric shrink-0 text-base tabular-nums ${qtyClass(event.quantity)}`}
              >
                {event.quantity > 0 ? `+${event.quantity}` : event.quantity}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function StreamSummary({
  summary,
}: {
  summary: {
    matching: number;
    visible: number;
    spikes: number;
    restocks: number;
  };
}) {
  const shown =
    summary.matching > summary.visible
      ? `${summary.visible} of ${summary.matching} shown`
      : `${summary.visible} shown`;

  return (
    <p
      className="bry-stream-summary"
      role="status"
      aria-label="Filtered stream summary"
      data-stream-summary
    >
      {shown}
      <span aria-hidden="true"> · </span>
      {summary.spikes} spike{summary.spikes === 1 ? "" : "s"}
      <span aria-hidden="true"> · </span>
      {summary.restocks} restock{summary.restocks === 1 ? "" : "s"}
    </p>
  );
}
