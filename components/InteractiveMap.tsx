"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useEventStore } from "@/store/useEventStore";
import {
  deriveZoneSnapshots,
  stockHeat,
  STOCK_TIER_HEALTHY_MIN,
  STOCK_TIER_WATCH_MIN,
  type StockHeat,
} from "@/features/live-radar/lib/zone-stock";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

const VB_WIDTH = 960;
const VB_HEIGHT = 580;
const AVENUE_Y = 280;

type ZonePolygon = {
  id: string;
  label: string;
  points: string;
};

type HighlightLevel = "selected" | "hover" | "none";

const ZONE_LABEL_LAYOUT: Record<
  string,
  { cx: number; cy: number; title: string; width: number }
> = {
  "South Gate": { cx: 150, cy: 415, title: "South Gate", width: 128 },
  "Sampling Court": { cx: 470, cy: 285, title: "Sampling Court", width: 148 },
  "Main Stage Walkway": { cx: 800, cy: 360, title: "Main Stage", width: 128 },
};

const LEGEND_ROWS: { heat: StockHeat; label: string }[] = [
  { heat: "cool", label: `Healthy ${STOCK_TIER_HEALTHY_MIN}%+` },
  {
    heat: "mid",
    label: `Watch ${STOCK_TIER_WATCH_MIN}–${STOCK_TIER_HEALTHY_MIN - 1}%`,
  },
  { heat: "hot", label: `Low <${STOCK_TIER_WATCH_MIN}%` },
];

/** Solid fills — must read clearly against map bg (#eceaf2) and match legend swatches */
const ZONE_STYLE: Record<
  StockHeat,
  { fill: string; glow: string; stroke: string; stockColor: string }
> = {
  cool: {
    fill: "#dcdae4",
    glow: "#c8c4d4",
    stroke: "#b8b4c4",
    stockColor: "#5a5568",
  },
  mid: {
    fill: "#fde4c8",
    glow: "#f5d4a8",
    stroke: "#d4a06a",
    stockColor: "#8a5c28",
  },
  hot: {
    fill: "#f5b8a8",
    glow: "#f09888",
    stroke: "#d9786a",
    stockColor: "#9a4038",
  },
};

function zonePalette(heat: StockHeat) {
  return {
    ...ZONE_STYLE[heat],
    fillUrl: `url(#zone-grad-${heat === "cool" ? "cool" : heat === "mid" ? "mid" : "hot"})`,
  };
}

function MapDefs() {
  return (
    <defs>
      <linearGradient id="map-bg-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6f5f9" />
        <stop offset="100%" stopColor="#eceaf2" />
      </linearGradient>

      {/* Zone card tints — aligned with stock legend */}
      <linearGradient id="zone-grad-cool" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#eeecf2" />
        <stop offset="100%" stopColor="#dcdae4" />
      </linearGradient>
      <linearGradient id="zone-grad-mid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff0e0" />
        <stop offset="100%" stopColor="#fde4c8" />
      </linearGradient>
      <linearGradient id="zone-grad-hot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fdd5cc" />
        <stop offset="100%" stopColor="#f5b8a8" />
      </linearGradient>
      <filter id="zone-card-shadow" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow
          dx="0"
          dy="4"
          stdDeviation="8"
          floodColor="#504678"
          floodOpacity="0.1"
        />
      </filter>
      <filter id="legend-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.08" />
      </filter>
    </defs>
  );
}

function ZoneLabels({
  zone,
  stock,
  heat,
  highlight,
}: {
  zone: ZonePolygon;
  stock: number;
  heat: StockHeat;
  highlight: HighlightLevel;
}) {
  const palette = zonePalette(heat);
  const layout = ZONE_LABEL_LAYOUT[zone.label] ?? {
    cx: 0,
    cy: 0,
    title: zone.label,
    width: 128,
  };
  const y0 = layout.cy - 14;

  return (
    <g pointerEvents="none">
      <rect
        x={layout.cx - layout.width / 2}
        y={y0 - 20}
        width={layout.width}
        height={42}
        rx={14}
        fill="rgb(255 255 255 / 0.92)"
        stroke={
          highlight === "selected" ? palette.stroke : "rgb(255 255 255 / 0.85)"
        }
        strokeWidth={highlight === "selected" ? 2 : 1}
        filter="url(#zone-card-shadow)"
      />
      <text
        x={layout.cx}
        y={y0}
        fill="var(--text-primary)"
        fontSize={12}
        fontFamily="var(--font-heading), sans-serif"
        fontWeight={800}
        letterSpacing="-0.01em"
        textAnchor="middle"
      >
        {layout.title}
      </text>
      <text
        x={layout.cx}
        y={y0 + 18}
        fill={palette.stockColor}
        fontSize={11}
        fontFamily="var(--font-metric), sans-serif"
        fontWeight={600}
        textAnchor="middle"
      >
        {stock}%
      </text>
    </g>
  );
}

function ZoneLayer({
  zone,
  stock,
  highlight,
  dimmed,
  onSelect,
}: {
  zone: ZonePolygon;
  stock: number;
  highlight: HighlightLevel;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const heat = stockHeat(stock);
  const palette = zonePalette(heat);
  const isSelected = highlight === "selected";
  const isHovered = highlight === "hover";

  return (
    <g
      className="bry-map-zone"
      opacity={dimmed ? 0.5 : 1}
      style={{
        transition: "opacity var(--dur-med) var(--ease-premium)",
        cursor: "pointer",
      }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`${zone.label}, stock ${stock}%, ${heat}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
    >
      <polygon
        points={zone.points}
        fill={palette.glow}
        opacity={heat === "hot" ? 0.55 : heat === "mid" ? 0.5 : 0.35}
        stroke="none"
      />
      <polygon
        points={zone.points}
        fill={palette.fillUrl}
        stroke={palette.stroke}
        strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
        strokeOpacity={1}
        className={isSelected ? "bry-map-zone-stroke-selected" : undefined}
      />
      {isSelected && (
        <polygon
          points={zone.points}
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth={1.5}
          strokeOpacity={0.25}
        />
      )}
      <ZoneLabels zone={zone} stock={stock} heat={heat} highlight={highlight} />
    </g>
  );
}

function StockLegend() {
  return (
    <g transform="translate(16, 16)" filter="url(#legend-shadow)">
      <rect
        x={0}
        y={0}
        width={148}
        height={102}
        rx={16}
        fill="rgb(255 255 255 / 0.94)"
      />
      <rect
        x={0}
        y={0}
        width={148}
        height={102}
        rx={16}
        fill="none"
        stroke="rgb(255 255 255 / 0.85)"
        strokeWidth={1}
      />
      <text
        x={14}
        y={20}
        fill="var(--text-muted)"
        fontSize={9}
        fontWeight={800}
        letterSpacing="0.1em"
        fontFamily="var(--font-label), sans-serif"
      >
        STOCK LEGEND
      </text>
      {LEGEND_ROWS.map((row, i) => {
        const cy = 38 + i * 22;
        return (
          <g key={row.label}>
            <rect
              x={14}
              y={cy - 8}
              width={16}
              height={16}
              rx={5}
              fill={`url(#zone-grad-${row.heat === "cool" ? "cool" : row.heat === "mid" ? "mid" : "hot"})`}
              stroke={ZONE_STYLE[row.heat].stroke}
              strokeWidth={1.5}
            />
            <text
              x={38}
              y={cy + 4}
              fill="var(--text-secondary)"
              fontSize={9}
              fontWeight={500}
              fontFamily="var(--font-ui), sans-serif"
            >
              {row.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function InteractiveMap() {
  const incidents = useEventStore((s) => s.incidents);
  const activeIncidentId = useEventStore((s) => s.activeIncidentId);
  const selectedIncidentId = useEventStore((s) => s.selectedIncidentId);
  const selectIncident = useEventStore((s) => s.selectIncident);
  const events = useTelemetryStore((s) => s.events);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const snapshots = useMemo(
    () => deriveZoneSnapshots(events, now),
    [events, now]
  );
  const snapshotByZone = useMemo(
    () => new Map(snapshots.map((s) => [s.zone, s])),
    [snapshots]
  );

  const incidentByZone = useMemo(
    () => new Map(incidents.map((i) => [i.zone, i])),
    [incidents]
  );

  const selectedZone = useMemo(() => {
    if (!selectedIncidentId) return null;
    return incidents.find((i) => i.id === selectedIncidentId)?.zone ?? null;
  }, [incidents, selectedIncidentId]);

  const hoveredZone = useMemo(() => {
    if (!activeIncidentId || activeIncidentId === selectedIncidentId)
      return null;
    return incidents.find((i) => i.id === activeIncidentId)?.zone ?? null;
  }, [activeIncidentId, incidents, selectedIncidentId]);

  const focusMode = Boolean(selectedZone);

  const zones: ZonePolygon[] = useMemo(
    () => [
      {
        id: "south-gate",
        label: "South Gate",
        points: "40,300 260,300 260,530 40,530",
      },
      {
        id: "sampling-court",
        label: "Sampling Court",
        points: "290,80 650,80 650,480 290,480",
      },
      {
        id: "main-stage-walkway",
        label: "Main Stage Walkway",
        points: "680,120 920,120 920,480 680,480",
      },
    ],
    []
  );

  const paths = useMemo(
    () => [
      { id: "main-avenue", d: `M 30,${AVENUE_Y} L 930,${AVENUE_Y}` },
      { id: "south-connector", d: `M 150,${AVENUE_Y} L 150,540` },
      { id: "stage-corridor", d: "M 670,120 L 670,490" },
      { id: "court-entry", d: `M 290,${AVENUE_Y} L 290,80 L 650,80` },
    ],
    []
  );

  const handleZoneSelect = useCallback(
    (zoneLabel: string) => {
      const incident = incidentByZone.get(zoneLabel);
      if (incident) selectIncident(incident.id);
    },
    [incidentByZone, selectIncident]
  );

  function zoneHighlight(label: string): HighlightLevel {
    if (selectedZone === label) return "selected";
    if (hoveredZone === label) return "hover";
    return "none";
  }

  return (
    <svg
      viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="bry-venue-map-svg h-full w-full"
      role="img"
      aria-label="Venue schematic — tap a zone or use Zone activity to highlight"
    >
      <MapDefs />

      <rect width={VB_WIDTH} height={VB_HEIGHT} fill="url(#map-bg-grad)" />

      {paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          stroke="var(--map-path)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.85}
        />
      ))}

      {zones.map((zone) => {
        const snap = snapshotByZone.get(zone.label);
        const stock = snap?.stock ?? 100;
        const highlight = zoneHighlight(zone.label);
        const dimmed = focusMode && highlight === "none";

        return (
          <ZoneLayer
            key={zone.id}
            zone={zone}
            stock={stock}
            highlight={highlight}
            dimmed={dimmed}
            onSelect={() => handleZoneSelect(zone.label)}
          />
        );
      })}

      <StockLegend />

      <g>
        <rect
          x={108}
          y={518}
          width={88}
          height={26}
          rx={10}
          fill="rgb(255 255 255 / 0.92)"
        />
        <text
          x={152}
          y={535}
          fill="var(--text-muted)"
          fontSize={9}
          fontFamily="var(--font-label), sans-serif"
          fontWeight={800}
          letterSpacing="0.08em"
          textAnchor="middle"
        >
          ▲ ENTRY
        </text>
      </g>

      <g>
        <rect
          x={868}
          y={268}
          width={76}
          height={26}
          rx={10}
          fill="rgb(255 255 255 / 0.92)"
        />
        <text
          x={906}
          y={285}
          fill="var(--text-muted)"
          fontSize={9}
          fontFamily="var(--font-label), sans-serif"
          fontWeight={800}
          letterSpacing="0.08em"
          textAnchor="middle"
        >
          EXIT ▶
        </text>
      </g>
    </svg>
  );
}
