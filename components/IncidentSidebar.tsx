"use client";

import { useEffect, useRef, useCallback } from "react";
import { AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { useEventStore } from "@/store/useEventStore";
import type { Incident, IncidentSeverity } from "@/store/useEventStore";

function severityAccent(severity: IncidentSeverity): string {
  switch (severity) {
    case "critical":
      return "var(--map-zone-stroke-low)";
    case "warning":
      return "var(--map-zone-stroke-mid)";
    case "resolved":
      return "var(--map-zone-stroke-cool)";
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
  }
}

function formatAge(ts: number): string {
  const s = Math.floor(Math.max(0, Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
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
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={`bry-incident-row bry-row-capsule bry-row-enter mb-4 flex cursor-pointer items-center gap-3 p-4 last:mb-0 ${stateClass}`}
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
        <p
          className={`truncate text-sm ${isSelected ? "font-extrabold" : "font-bold"}`}
        >
          {incident.title}
        </p>
        <p className="truncate text-xs text-[var(--text-muted)]">
          {incident.zone}
        </p>
      </div>
      <div className="bry-incident-metric shrink-0 text-right">
        <p className="font-mono text-xs font-semibold tabular-nums">
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
    if (!selectedIncidentId) return;
    cardRefs.current
      .get(selectedIncidentId)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedIncidentId]);

  if (incidents.length === 0) {
    return (
      <div className="bry-inner bry-glass px-4 py-12 text-center text-sm text-[var(--text-muted)]">
        Waiting for stream events&hellip;
      </div>
    );
  }

  return (
    <div>
      {incidents.map((inc) => {
        const isSelected = selectedIncidentId === inc.id;
        const isHovered = activeIncidentId === inc.id && !isSelected;

        return (
          <Row
            key={inc.id}
            incident={inc}
            isSelected={isSelected}
            isHovered={isHovered}
            cardRef={setCardRef(inc.id)}
            onHover={() => setActiveIncident(inc.id)}
            onLeave={() => setActiveIncident(null)}
            onClick={() => selectIncident(inc.id)}
          />
        );
      })}
    </div>
  );
}
