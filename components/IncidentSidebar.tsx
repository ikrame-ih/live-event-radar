"use client";

import { useEffect, useRef, useCallback } from "react";
import { AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { useEventStore } from "@/store/useEventStore";
import type { Incident, IncidentSeverity } from "@/store/useEventStore";

function severityAccent(severity: IncidentSeverity): string {
  switch (severity) {
    case "critical":
      return "var(--semantic-coral)";
    case "warning":
      return "var(--semantic-amber)";
    case "resolved":
      return "var(--semantic-teal)";
    default:
      return "var(--semantic-teal)";
  }
}

function SeverityIcon({ severity }: { severity: IncidentSeverity }) {
  const color = severityAccent(severity);
  const size = 16;
  switch (severity) {
    case "critical":
      return <AlertTriangle size={size} style={{ color }} />;
    case "warning":
      return <Clock size={size} style={{ color }} />;
    case "resolved":
      return <CheckCircle size={size} style={{ color }} />;
    default:
      return <CheckCircle size={size} style={{ color }} />;
  }
}

function formatAge(ts: number): string {
  const seconds = Math.floor(Math.max(0, Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
}

function Row({
  incident,
  isSelected,
  isHovered,
  cardRef,
  onHover,
  onLeave,
  onClick,
}: {
  incident: Incident;
  isSelected: boolean;
  isHovered: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const stateClass = isSelected
    ? "bry-incident-row-selected"
    : isHovered
      ? "bry-incident-row-active"
      : "";

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`${incident.title}, ${incident.zone}, ${incident.metric}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`bry-incident-row bry-row-capsule flex cursor-pointer items-center gap-3 px-4 py-5 ${stateClass}`}
      style={
        isSelected
          ? { ["--row-accent" as string]: severityAccent(incident.severity) }
          : undefined
      }
      aria-pressed={isSelected}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] ${
          isSelected ? "bry-incident-icon-selected" : "bry-incident-icon"
        }`}
      >
        <SeverityIcon severity={incident.severity} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="bry-card-title truncate">{incident.title}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">
          {incident.zone}
        </p>
      </div>
      <div className="bry-incident-metric shrink-0 text-right">
        <p className="bry-metric text-xs">
          {incident.metric}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {formatAge(incident.timestamp)}
        </p>
      </div>
      <ChevronRight
        size={16}
        className={`shrink-0 transition-transform duration-200 ${
          isSelected
            ? "translate-x-0.5 text-[var(--row-accent)]"
            : "text-[var(--text-muted)]"
        }`}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
    </div>
  );
}

export function IncidentSidebar() {
  const incidents = useEventStore((s) => s.incidents);
  const activeIncidentId = useEventStore((s) => s.activeIncidentId);
  const selectedIncidentId = useEventStore((s) => s.selectedIncidentId);
  const setActiveIncident = useEventStore((s) => s.setActiveIncident);
  const selectIncident = useEventStore((s) => s.selectIncident);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const setCardRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) cardRefs.current.set(id, el);
      else cardRefs.current.delete(id);
    },
    []
  );

  useEffect(() => {
    if (!selectedIncidentId) return undefined;
    cardRefs.current
      .get(selectedIncidentId)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return undefined;
  }, [selectedIncidentId]);

  if (incidents.length === 0) {
    return (
      <div
        className="bry-inner px-4 py-12 text-center text-sm text-[var(--text-muted)]"
        role="status"
      >
        Waiting for the first events&hellip;
      </div>
    );
  }

  return (
    <div className="bry-zone-activity-scroll max-h-[min(52vh,28rem)] overflow-y-auto pr-1">
      <ul className="flex list-none flex-col gap-5" aria-live="polite">
        {incidents.map((inc) => {
          const isSelected = selectedIncidentId === inc.id;
          const isHovered = activeIncidentId === inc.id && !isSelected;

          return (
            <li key={inc.id} className="bry-row-enter">
              <Row
                incident={inc}
                isSelected={isSelected}
                isHovered={isHovered}
                cardRef={setCardRef(inc.id)}
                onHover={() => setActiveIncident(inc.id)}
                onLeave={() => setActiveIncident(null)}
                onClick={() => selectIncident(inc.id)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
