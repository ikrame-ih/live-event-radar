"use client";

import { ChevronRight, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useEventStore } from "@/store/useEventStore";
import type { Incident, IncidentSeverity } from "@/store/useEventStore";

function severityIcon(severity: IncidentSeverity) {
  const size = 20;
  const color =
    severity === "critical"
      ? "var(--semantic-coral)"
      : severity === "warning"
        ? "var(--semantic-amber)"
        : "var(--semantic-teal)";
  switch (severity) {
    case "critical":
      return <AlertTriangle size={size} style={{ color }} />;
    case "warning":
      return <Clock size={size} style={{ color }} />;
    case "resolved":
      return <CheckCircle size={size} style={{ color }} />;
  }
}

function statusBadge(severity: IncidentSeverity) {
  switch (severity) {
    case "critical":
      return (
        <span className="bry-status-badge bry-status-badge-alert">
          <AlertTriangle size={14} />
          Alert
        </span>
      );
    case "warning":
      return <span className="bry-status-badge bry-status-badge-warn">Warning</span>;
    case "resolved":
      return <span className="bry-status-badge bry-status-badge-live">Active</span>;
  }
}

function formatAge(ts: number): string {
  const s = Math.floor(Math.max(0, Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
}

type Props = {
  onSelect: (id: string) => void;
  selectedId: string | null;
};

export function ZoneActionCards({ onSelect, selectedId }: Props) {
  const incidents = useEventStore((s) => s.incidents);

  return (
    <div className="flex flex-col gap-3">
      {incidents.map((inc) => {
        const selected = selectedId === inc.id;

        return (
          <article
            key={inc.id}
            className={`bry-box flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 ${
              selected ? "ring-2 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--shell-bg)]" : ""
            }`}
          >
            {statusBadge(inc.severity)}

            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]"
              style={{ background: "var(--box-inner)", boxShadow: "var(--shadow-inset)" }}
            >
              {severityIcon(inc.severity)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="bry-caps">{inc.zone}</p>
              <p className="mt-0.5 truncate text-base font-bold">{inc.title}</p>
              <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-[var(--text-secondary)]">
                {inc.metric}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <span className="text-xs text-[var(--text-muted)]">{formatAge(inc.timestamp)}</span>
              <button type="button" className="bry-btn-secondary" onClick={() => onSelect(inc.id)}>
                View details
                <ChevronRight size={14} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
