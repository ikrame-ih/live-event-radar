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
import { STOCK_HEAT_COLORS } from "@/features/live-radar/lib/stock-heat-colors";
import { useSessionStore } from "@/features/live-radar/state/session-store";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

const VB_WIDTH = 960;
const VB_HEIGHT = 510;
const AVENUE_Y = 255;

type ZonePolygon = {
  id: string;
  label: string;
  points: string;
  cx: number;
  cy: number;
};

type HighlightLevel = "selected" | "hover" | "none";

const ZONE_LABEL_LAYOUT: Record<
  string,
  { cx: number; cy: number; title: string; width: number }
> = {
  "South Gate": { cx: 168, cy: 318, title: "South Gate", width: 132 },
  "Sampling Court": { cx: 470, cy: 248, title: "Sampling Court", width: 152 },
  "Main Stage Walkway": { cx: 772, cy: 261, title: "Main Stage", width: 132 },
};

const LEGEND_ROWS: { heat: StockHeat; short: string }[] = [
  { heat: "cool", short: `${STOCK_TIER_HEALTHY_MIN}%+` },
  {
    heat: "mid",
    short: `${STOCK_TIER_WATCH_MIN}–${STOCK_TIER_HEALTHY_MIN - 1}`,
  },
  { heat: "hot", short: `<${STOCK_TIER_WATCH_MIN}` },
];

const ZONE_STYLE = STOCK_HEAT_COLORS;

function zonePalette(heat: StockHeat) {
  return {
    ...ZONE_STYLE[heat],
    fillUrl: `url(#zone-grad-${heat === "cool" ? "cool" : heat === "mid" ? "mid" : "hot"})`,
  };
}

function VerticalGradient({
  id,
  top,
  bottom,
}: {
  id: string;
  top: string;
  bottom: string;
}) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={top} />
      <stop offset="100%" stopColor={bottom} />
    </linearGradient>
  );
}

function MapDefs() {
  return (
    <defs>
      {/* Atmosphere: warm coral wash → cool lavender */}
      <linearGradient id="map-bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbf3f0" />
        <stop offset="48%" stopColor="#f4f0f7" />
        <stop offset="100%" stopColor="#ebe6f2" />
      </linearGradient>
      <radialGradient id="map-orb-coral" cx="18%" cy="22%" r="45%">
        <stop offset="0%" stopColor="rgb(229 77 58 / 0.14)" />
        <stop offset="100%" stopColor="rgb(229 77 58 / 0)" />
      </radialGradient>
      <radialGradient id="map-orb-lavender" cx="82%" cy="78%" r="50%">
        <stop offset="0%" stopColor="rgb(120 100 180 / 0.12)" />
        <stop offset="100%" stopColor="rgb(120 100 180 / 0)" />
      </radialGradient>

      {/* Soft glass zone fills — heat tint under white plate */}
      <VerticalGradient id="zone-grad-cool" top="#e8f5ee" bottom="#cfe8db" />
      <VerticalGradient id="zone-grad-mid" top="#fff4e6" bottom="#fde0bd" />
      <VerticalGradient id="zone-grad-hot" top="#fdecea" bottom="#f5c4bc" />

      <filter id="zone-card-shadow" x="-12%" y="-12%" width="124%" height="124%">
        <feDropShadow
          dx="0"
          dy="6"
          stdDeviation="10"
          floodColor="#504678"
          floodOpacity="0.14"
        />
      </filter>
      <filter id="zone-lift-shadow" x="-16%" y="-16%" width="132%" height="132%">
        <feDropShadow
          dx="0"
          dy="10"
          stdDeviation="14"
          floodColor="#504678"
          floodOpacity="0.18"
        />
      </filter>
      <filter id="glass-plate-shadow" x="-4%" y="-4%" width="108%" height="108%">
        <feDropShadow
          dx="0"
          dy="8"
          stdDeviation="16"
          floodColor="#504678"
          floodOpacity="0.08"
        />
      </filter>
      <filter id="legend-shadow" x="-20%" y="-40%" width="140%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.07" />
      </filter>
    </defs>
  );
}

function MapAtmosphere() {
  return (
    <g aria-hidden="true">
      <rect width={VB_WIDTH} height={VB_HEIGHT} fill="url(#map-bg-grad)" />
      <rect width={VB_WIDTH} height={VB_HEIGHT} fill="url(#map-orb-coral)" />
      <rect width={VB_WIDTH} height={VB_HEIGHT} fill="url(#map-orb-lavender)" />
      {/* Glass plate — height tracks floor plan + ENTRY, not empty footer */}
      <rect
        x={28}
        y={24}
        width={VB_WIDTH - 56}
        height={454}
        rx={28}
        fill="rgb(255 255 255 / 0.42)"
        stroke="rgb(255 255 255 / 0.72)"
        strokeWidth={1}
        filter="url(#glass-plate-shadow)"
      />
      <rect
        x={28}
        y={24}
        width={VB_WIDTH - 56}
        height={454}
        rx={28}
        fill="none"
        stroke="rgb(80 70 120 / 0.06)"
        strokeWidth={1}
      />
    </g>
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
    cx: zone.cx,
    cy: zone.cy,
    title: zone.label,
    width: 128,
  };
  const chipH = 46;
  const chipY = layout.cy - chipH / 2;
  const selected = highlight === "selected";

  return (
    <g pointerEvents="none">
      <rect
        x={layout.cx - layout.width / 2}
        y={chipY}
        width={layout.width}
        height={chipH}
        rx={16}
        fill="rgb(255 255 255 / 0.9)"
        stroke={selected ? "var(--accent)" : "rgb(255 255 255 / 0.95)"}
        strokeWidth={selected ? 1.5 : 1}
        filter="url(#zone-card-shadow)"
      />
      <text
        x={layout.cx}
        y={layout.cy - 8}
        fill="var(--text-primary)"
        fontSize={12}
        fontFamily="var(--font-heading), sans-serif"
        fontWeight={800}
        letterSpacing="-0.02em"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {layout.title}
      </text>
      <text
        x={layout.cx}
        y={layout.cy + 10}
        fill={palette.stockColor}
        fontSize={12}
        fontFamily="var(--font-metric), sans-serif"
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {stock}%
      </text>
    </g>
  );
}

function ZonePolygons({
  zone,
  palette,
  heat,
  isSelected,
  isHovered,
}: {
  zone: ZonePolygon;
  palette: ReturnType<typeof zonePalette>;
  heat: StockHeat;
  isSelected: boolean;
  isHovered: boolean;
}) {
  return (
    <>
      {/* Soft bloom under the stand */}
      <polygon
        points={zone.points}
        fill={palette.glow}
        opacity={heat === "hot" ? 0.45 : heat === "mid" ? 0.38 : 0.28}
        stroke="none"
        className={heat === "hot" ? "bry-map-zone-bloom--hot" : undefined}
      />
      {/* Heat body */}
      <polygon
        points={zone.points}
        fill={palette.fillUrl}
        fillOpacity={0.92}
        stroke={palette.stroke}
        strokeWidth={isSelected ? 2.75 : isHovered ? 2.25 : 1.75}
        strokeOpacity={0.95}
        filter={isSelected ? "url(#zone-lift-shadow)" : "url(#zone-card-shadow)"}
      />
      {/* Glass sheen */}
      <polygon
        points={zone.points}
        fill="rgb(255 255 255 / 0.28)"
        stroke="rgb(255 255 255 / 0.55)"
        strokeWidth={1}
        pointerEvents="none"
      />
    </>
  );
}

function ZoneLayer({
  zone,
  stock,
  highlight,
  dimmed,
  interactive,
  onSelect,
}: {
  zone: ZonePolygon;
  stock: number;
  highlight: HighlightLevel;
  dimmed: boolean;
  interactive: boolean;
  onSelect: () => void;
}) {
  const heat = stockHeat(stock);
  const palette = zonePalette(heat);
  const isSelected = highlight === "selected";
  const isHovered = highlight === "hover";

  const className = [
    "bry-map-zone",
    isSelected ? "bry-map-zone--selected" : "",
    dimmed ? "bry-map-zone--dimmed" : "",
    heat === "hot" ? "bry-map-zone--hot" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <g
      className={className}
      style={{
        cursor: interactive ? "pointer" : "default",
      }}
      onClick={interactive ? onSelect : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${zone.label}, stock ${stock}%`}
      aria-pressed={isSelected || undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
    >
      <ZonePolygons
        zone={zone}
        palette={palette}
        heat={heat}
        isSelected={isSelected}
        isHovered={isHovered}
      />
      <ZoneLabels zone={zone} stock={stock} heat={heat} highlight={highlight} />
    </g>
  );
}

/** HTML legend — flex alignment beats hand-tuned SVG chip math */
function StockLegend() {
  return (
    <ul className="bry-map-legend" aria-label="Stock legend">
      {LEGEND_ROWS.map((row) => (
        <li key={row.heat} className="bry-map-legend-chip">
          <span
            className={`bry-map-legend-swatch bry-map-legend-swatch--${row.heat}`}
            aria-hidden
          />
          <span className="bry-map-legend-label">{row.short}</span>
        </li>
      ))}
    </ul>
  );
}

function MapEntryExitLabels() {
  return (
    <g aria-hidden="true">
      <g transform={`translate(122, 444)`}>
        <rect
          width={92}
          height={26}
          rx={13}
          fill="rgb(255 255 255 / 0.82)"
          stroke="rgb(255 255 255 / 0.95)"
        />
        <text
          x={46}
          y={13}
          fill="var(--text-primary)"
          fontSize={10}
          fontFamily="var(--font-heading), sans-serif"
          fontWeight={800}
          letterSpacing="0.12em"
          textAnchor="middle"
          dominantBaseline="central"
        >
          ENTRY
        </text>
      </g>
      <g transform={`translate(862, ${AVENUE_Y - 13})`}>
        <rect
          width={70}
          height={26}
          rx={13}
          fill="rgb(255 255 255 / 0.82)"
          stroke="rgb(255 255 255 / 0.95)"
        />
        <text
          x={35}
          y={13}
          fill="var(--text-primary)"
          fontSize={10}
          fontFamily="var(--font-heading), sans-serif"
          fontWeight={800}
          letterSpacing="0.12em"
          textAnchor="middle"
          dominantBaseline="central"
        >
          EXIT
        </text>
      </g>
    </g>
  );
}

export function InteractiveMap() {
  const incidents = useEventStore((s) => s.incidents);
  const activeIncidentId = useEventStore((s) => s.activeIncidentId);
  const selectedIncidentId = useEventStore((s) => s.selectedIncidentId);
  const selectIncident = useEventStore((s) => s.selectIncident);
  const sessionZone = useSessionStore((s) => s.selectedZone);
  const selectSessionZone = useSessionStore((s) => s.selectZone);
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

  const selectedZoneFromIncident = useMemo(() => {
    if (!selectedIncidentId) return null;
    return incidents.find((i) => i.id === selectedIncidentId)?.zone ?? null;
  }, [incidents, selectedIncidentId]);

  const selectedZone = sessionZone ?? selectedZoneFromIncident;

  const hoveredZone = useMemo(() => {
    if (!activeIncidentId || activeIncidentId === selectedIncidentId)
      return null;
    const zone = incidents.find((i) => i.id === activeIncidentId)?.zone ?? null;
    if (zone && zone === selectedZone) return null;
    return zone;
  }, [activeIncidentId, incidents, selectedIncidentId, selectedZone]);

  const focusMode = Boolean(selectedZone);

  const zones: ZonePolygon[] = useMemo(
    () => [
      {
        id: "south-gate",
        label: "South Gate",
        points: "78,210 258,210 258,426 78,426",
        cx: 168,
        cy: 318,
      },
      {
        id: "sampling-court",
        label: "Sampling Court",
        points: "310,70 630,70 630,426 310,426",
        cx: 470,
        cy: 248,
      },
      {
        id: "main-stage-walkway",
        label: "Main Stage Walkway",
        points: "682,96 862,96 862,426 682,426",
        cx: 772,
        cy: 261,
      },
    ],
    []
  );

  const paths = useMemo(
    () => [
      { id: "main-avenue", d: `M 64,${AVENUE_Y} L 862,${AVENUE_Y}` },
      { id: "south-connector", d: `M 168,${AVENUE_Y} L 168,444` },
      { id: "stage-corridor", d: "M 656,96 L 656,426" },
      { id: "court-entry", d: `M 310,${AVENUE_Y} L 310,70 L 630,70` },
    ],
    []
  );

  const handleZoneSelect = useCallback(
    (zoneLabel: string) => {
      selectSessionZone(zoneLabel);
      const incident = incidentByZone.get(zoneLabel);
      if (incident) selectIncident(incident.id);
    },
    [incidentByZone, selectIncident, selectSessionZone]
  );

  function zoneHighlight(label: string): HighlightLevel {
    if (selectedZone === label) return "selected";
    if (hoveredZone === label) return "hover";
    return "none";
  }

  return (
    <div className="bry-venue-map-frame">
      <svg
        viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="bry-venue-map-svg"
        role="img"
        aria-label="Venue floor plan — tap a zone or use Session tally to highlight"
      >
        <MapDefs />
        <MapAtmosphere />

        {paths.map((p) => (
          <path
            key={p.id}
            className="bry-map-path"
            d={p.d}
            stroke="var(--map-path)"
            strokeWidth={p.id === "main-avenue" ? 3 : 2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.55}
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
              interactive
              onSelect={() => handleZoneSelect(zone.label)}
            />
          );
        })}

        <MapEntryExitLabels />
      </svg>
      <StockLegend />
    </div>
  );
}
