"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useEventStore } from "@/store/useEventStore";
import type { Incident } from "@/store/useEventStore";
import { ZONE_SHORT } from "@/features/live-radar/lib/derive-incidents";
import {
  deriveZoneSnapshots,
  stockHeat,
  ZONE_META,
  zoneStatusCaption,
  type ZoneSnapshot,
} from "@/features/live-radar/lib/zone-stock";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

const VB_WIDTH = 960;
const VB_HEIGHT = 580;
const AVENUE_Y = 280;
const LINE = 15;

type ZonePolygon = {
  id: string;
  label: string;
  points: string;
};

type PathSegment = {
  id: string;
  d: string;
};

type Bounds = {
  cx: number;
  cy: number;
  maxX: number;
  maxY: number;
};

function polygonBounds(points: string): Bounds {
  const coords = points.split(" ").map((p) => p.split(",").map(Number));
  const xs = coords.map(([x]) => x);
  const ys = coords.map(([, y]) => y);
  return {
    cx: xs.reduce((a, b) => a + b, 0) / xs.length,
    cy: ys.reduce((a, b) => a + b, 0) / ys.length,
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

function zoneFill(heat: ReturnType<typeof stockHeat>): string {
  switch (heat) {
    case "hot":
      return "var(--map-heat-high)";
    case "mid":
      return "var(--map-heat-mid)";
    default:
      return "var(--map-zone-fill)";
  }
}

function zoneStroke(heat: ReturnType<typeof stockHeat>): string {
  switch (heat) {
    case "hot":
      return "var(--semantic-coral)";
    case "mid":
      return "var(--semantic-amber)";
    default:
      return "var(--box-inset)";
  }
}

function statusColor(status: ZoneSnapshot["status"]): string {
  switch (status) {
    case "critical":
      return "var(--semantic-coral)";
    case "watch":
      return "var(--semantic-amber)";
    default:
      return "var(--semantic-teal)";
  }
}

function StockBar({ x, y, width, stock }: { x: number; y: number; width: number; stock: number }) {
  const fillW = (stock / 100) * width;
  const heat = stockHeat(stock);
  const fill =
    heat === "hot"
      ? "var(--semantic-coral)"
      : heat === "mid"
        ? "var(--semantic-amber)"
        : "var(--semantic-teal)";

  return (
    <g>
      <rect x={x} y={y} width={width} height={8} rx={4} fill="var(--box-inset)" opacity={0.9} />
      <rect x={x} y={y} width={fillW} height={8} rx={4} fill={fill} />
    </g>
  );
}

function ZoneLabels({
  cx,
  cy,
  zone,
  snap,
  stock,
  barW,
}: {
  cx: number;
  cy: number;
  zone: ZonePolygon;
  snap: ZoneSnapshot | undefined;
  stock: number;
  barW: number;
}) {
  const meta = ZONE_META[zone.label];
  const y0 = cy - 48;

  return (
    <g>
      <text
        x={cx}
        y={y0}
        fill="var(--text-primary)"
        fontSize={13}
        fontFamily="var(--font-jakarta), system-ui, sans-serif"
        fontWeight={700}
        textAnchor="middle"
      >
        {zone.label}
      </text>
      {meta && (
        <text
          x={cx}
          y={y0 + LINE}
          fill="var(--text-muted)"
          fontSize={10}
          fontFamily="var(--font-jakarta), system-ui, sans-serif"
          fontWeight={500}
          textAnchor="middle"
        >
          {meta.subtitle}
        </text>
      )}
      <StockBar x={cx - barW / 2} y={y0 + LINE * 2 + 2} width={barW} stock={stock} />
      <text
        x={cx}
        y={y0 + LINE * 3 + 10}
        fill="var(--text-secondary)"
        fontSize={11}
        fontFamily="var(--font-plex-mono), monospace"
        fontWeight={600}
        textAnchor="middle"
      >
        Stock {stock}%
      </text>
      {snap && (
        <>
          <text
            x={cx}
            y={y0 + LINE * 4 + 10}
            fill="var(--text-muted)"
            fontSize={10}
            fontFamily="var(--font-plex-mono), monospace"
            textAnchor="middle"
          >
            {snap.demand30s} evt/30s
            {snap.spikes15s > 0
              ? ` · ${snap.spikes15s} spike${snap.spikes15s > 1 ? "s" : ""}`
              : ""}
          </text>
          {snap.lastItem && (
            <text
              x={cx}
              y={y0 + LINE * 5 + 10}
              fill="var(--text-secondary)"
              fontSize={10}
              fontFamily="var(--font-jakarta), system-ui, sans-serif"
              textAnchor="middle"
            >
              Last: {snap.lastItem}{" "}
              {snap.lastQuantity != null && (
                <tspan
                  fill={
                    snap.lastQuantity > 0
                      ? "var(--semantic-teal)"
                      : snap.lastQuantity <= -2
                        ? "var(--semantic-coral)"
                        : "var(--semantic-amber)"
                  }
                >
                  ({snap.lastQuantity > 0 ? "+" : ""}
                  {snap.lastQuantity})
                </tspan>
              )}
            </text>
          )}
          <text
            x={cx}
            y={y0 + LINE * 6 + 10}
            fill={statusColor(snap.status)}
            fontSize={10}
            fontFamily="var(--font-jakarta), system-ui, sans-serif"
            fontWeight={700}
            textAnchor="middle"
          >
            {zoneStatusCaption(snap)}
          </text>
        </>
      )}
    </g>
  );
}

function StockLegend() {
  const rows = [
    { fill: "var(--map-zone-fill)", stroke: "var(--box-inset)", label: "Healthy 65%+" },
    { fill: "var(--map-heat-mid)", stroke: "var(--semantic-amber)", label: "Watch 35–64%" },
    { fill: "var(--map-heat-high)", stroke: "var(--semantic-coral)", label: "Low <35%" },
  ];

  return (
    <g transform="translate(16, 16)">
      <rect
        x={0}
        y={0}
        width={132}
        height={98}
        rx={12}
        fill="var(--shell-bg)"
        opacity={0.95}
      />
      <text
        x={12}
        y={18}
        fill="var(--text-muted)"
        fontSize={9}
        fontWeight={700}
        fontFamily="var(--font-jakarta), system-ui, sans-serif"
      >
        STOCK LEGEND
      </text>
      {rows.map((row, i) => {
        const cy = 36 + i * 22;
        return (
          <g key={row.label}>
            <circle cx={22} cy={cy} r={5} fill={row.fill} stroke={row.stroke} strokeWidth={1} />
            <text
              x={36}
              y={cy + 4}
              fill="var(--text-secondary)"
              fontSize={9}
              fontFamily="var(--font-jakarta), system-ui, sans-serif"
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
    const id = window.setInterval(() => setNow(Date.now()), 2000);
    return () => window.clearInterval(id);
  }, []);

  const snapshots = useMemo(() => deriveZoneSnapshots(events, now), [events, now]);
  const snapshotByZone = useMemo(
    () => new Map(snapshots.map((s) => [s.zone, s])),
    [snapshots],
  );

  const zones: ZonePolygon[] = useMemo(
    () => [
      { id: "south-gate", label: "South Gate", points: "40,300 260,300 260,530 40,530" },
      { id: "sampling-court", label: "Sampling Court", points: "290,80 650,80 650,480 290,480" },
      {
        id: "main-stage-walkway",
        label: "Main Stage Walkway",
        points: "680,120 920,120 920,480 680,480",
      },
    ],
    [],
  );

  const paths: PathSegment[] = useMemo(
    () => [
      { id: "main-avenue", d: `M 30,${AVENUE_Y} L 930,${AVENUE_Y}` },
      { id: "south-connector", d: `M 150,${AVENUE_Y} L 150,540` },
      { id: "stage-corridor", d: "M 670,120 L 670,490" },
      { id: "court-entry", d: `M 290,${AVENUE_Y} L 290,80 L 650,80` },
    ],
    [],
  );

  const handleNodeClick = useCallback(
    (id: string) => {
      selectIncident(id);
    },
    [selectIncident],
  );

  const severityColor = (severity: Incident["severity"]): string => {
    switch (severity) {
      case "critical":
        return "var(--semantic-coral)";
      case "warning":
        return "var(--semantic-amber)";
      case "resolved":
        return "var(--semantic-teal)";
    }
  };

  const severityGlow = (severity: Incident["severity"]): string => {
    switch (severity) {
      case "critical":
        return "var(--glow-coral)";
      case "warning":
        return "var(--glow-amber)";
      case "resolved":
        return "var(--glow-teal)";
    }
  };

  const dotGrid = useMemo(() => {
    const dots: React.ReactNode[] = [];
    for (let gx = 20; gx < VB_WIDTH; gx += 30) {
      for (let gy = 20; gy < VB_HEIGHT; gy += 30) {
        dots.push(
          <circle key={`dot-${gx}-${gy}`} cx={gx} cy={gy} r={1.2} fill="var(--map-grid)" />,
        );
      }
    }
    return dots;
  }, []);

  return (
    <svg
      viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      style={{ background: "var(--map-bg)" }}
      role="img"
      aria-label="Venue schematic with live stock levels by zone"
    >
      {dotGrid}

      {paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          stroke="var(--map-path)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.8}
        />
      ))}

      {zones.map((zone) => {
        const snap = snapshotByZone.get(zone.label);
        const stock = snap?.stock ?? 100;
        const heat = stockHeat(stock);
        const { cx, cy } = polygonBounds(zone.points);
        const barW = zone.id === "sampling-court" ? 200 : 158;

        return (
          <g key={zone.id}>
            <polygon
              points={zone.points}
              fill={zoneFill(heat)}
              fillOpacity={heat === "cool" ? 1 : 0.72 + (100 - stock) / 200}
              stroke={zoneStroke(heat)}
              strokeWidth={heat === "hot" ? 2 : 1.5}
            />
            <ZoneLabels cx={cx} cy={cy} zone={zone} snap={snap} stock={stock} barW={barW} />
          </g>
        );
      })}

      <StockLegend />

      <text
        x={150}
        y={548}
        fill="var(--text-muted)"
        fontSize={10}
        fontFamily="var(--font-plex-mono), monospace"
        fontWeight={700}
        textAnchor="middle"
      >
        ▼ ENTRY
      </text>

      <text
        x={924}
        y={AVENUE_Y}
        fill="var(--text-muted)"
        fontSize={10}
        fontFamily="var(--font-plex-mono), monospace"
        fontWeight={700}
        textAnchor="end"
        dominantBaseline="middle"
      >
        EXIT ▶
      </text>

      {incidents.map((inc) => {
        const isActive = activeIncidentId === inc.id || selectedIncidentId === inc.id;
        const color = severityColor(inc.severity);
        const snap = snapshotByZone.get(inc.zone);
        const stock = snap?.stock ?? 100;
        const baseRadius = 11 + ((100 - stock) / 100) * 8;
        const activeRadius = baseRadius + 3;
        const r = isActive ? activeRadius : baseRadius;
        const label = ZONE_SHORT[inc.zone] ?? inc.zone.slice(0, 2);

        return (
          <g
            key={inc.id}
            onClick={() => handleNodeClick(inc.id)}
            style={{ cursor: "pointer" }}
          >
            {isActive && (
              <circle
                cx={inc.x}
                cy={inc.y}
                r={activeRadius + 8}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.35}
                style={{ filter: `drop-shadow(${severityGlow(inc.severity)})` }}
              />
            )}
            {inc.severity === "critical" && (
              <circle cx={inc.x} cy={inc.y} r={baseRadius + 6} fill={color} opacity={0.15}>
                <animate
                  attributeName="r"
                  values={`${baseRadius + 4};${baseRadius + 12};${baseRadius + 4}`}
                  dur="2.4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.15;0;0.15"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={inc.x}
              cy={inc.y}
              r={r}
              fill={color}
              opacity={isActive ? 1 : 0.92}
              stroke="var(--shell-bg)"
              strokeWidth={isActive ? 3 : 2}
            />
            <text
              x={inc.x}
              y={inc.y + 4}
              fill="#ffffff"
              fontSize={10}
              fontFamily="var(--font-plex-mono), monospace"
              fontWeight={700}
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
