"use client";

import { useEffect, useRef } from "react";
import { useTelemetryStore } from "../state/telemetry-store";

const WINDOW_MS = 30_000;
const LOGICAL_WIDTH = 960;
const LOGICAL_HEIGHT = 560;

/*
  Simplified fairground venue layout for demo operations.
  Three distinct zones with realistic spatial distribution:
  - South Gate: entry plaza area (bottom-left)
  - Sampling Court: large central courtyard
  - Main Stage Walkway: elongated walkway (right side)
*/

const ZONE_AREAS = [
  { zone: "South Gate", label: "South Gate", x: 40, y: 300, w: 220, h: 220 },
  { zone: "Sampling Court", label: "Sampling Court", x: 290, y: 100, w: 360, h: 380 },
  { zone: "Main Stage Walkway", label: "Main Stage Walkway", x: 680, y: 140, w: 240, h: 340 },
] as const;

const STANDS = [
  // South Gate stands (entry booths)
  { zone: "South Gate", label: "G1", x: 60, y: 340, w: 68, h: 38 },
  { zone: "South Gate", label: "G2", x: 148, y: 340, w: 68, h: 38 },
  { zone: "South Gate", label: "G3", x: 60, y: 400, w: 68, h: 38 },
  { zone: "South Gate", label: "G4", x: 148, y: 400, w: 68, h: 38 },
  { zone: "South Gate", label: "G5", x: 104, y: 460, w: 68, h: 38 },
  // Sampling Court stands (central area)
  { zone: "Sampling Court", label: "C1", x: 310, y: 150, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C2", x: 400, y: 150, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C3", x: 490, y: 150, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C4", x: 310, y: 224, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C5", x: 400, y: 224, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C6", x: 490, y: 224, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C7", x: 355, y: 310, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C8", x: 455, y: 310, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C9", x: 355, y: 390, w: 72, h: 42 },
  { zone: "Sampling Court", label: "C10", x: 455, y: 390, w: 72, h: 42 },
  // Main Stage Walkway stands (long corridor)
  { zone: "Main Stage Walkway", label: "M1", x: 700, y: 180, w: 70, h: 40 },
  { zone: "Main Stage Walkway", label: "M2", x: 790, y: 180, w: 70, h: 40 },
  { zone: "Main Stage Walkway", label: "M3", x: 700, y: 260, w: 70, h: 40 },
  { zone: "Main Stage Walkway", label: "M4", x: 790, y: 260, w: 70, h: 40 },
  { zone: "Main Stage Walkway", label: "M5", x: 745, y: 340, w: 70, h: 40 },
  { zone: "Main Stage Walkway", label: "M6", x: 745, y: 410, w: 70, h: 40 },
] as const;

type Rgb = { r: number; g: number; b: number };

type CanvasTheme = {
  bg: string;
  grid: string;
  path: string;
  title: string;
  subtitle: string;
  heatEmpty: string;
  heatLow: Rgb;
  heatMid: Rgb;
  heatHigh: Rgb;
  textOnHeat: string;
  textOnCool: string;
  standFillHot: string;
  standFillCool: string;
  standStroke: string;
  accentHot: string;
  zoneColors: Record<string, string>;
};

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function hexToRgb(hex: string): Rgb {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return { r: 128, g: 128, b: 128 };
  return {
    r: Number.parseInt(cleaned.slice(0, 2), 16),
    g: Number.parseInt(cleaned.slice(2, 4), 16),
    b: Number.parseInt(cleaned.slice(4, 6), 16),
  };
}

function readCanvasTheme(): CanvasTheme {
  return {
    bg: cssVar("--ops-canvas-bg"),
    grid: cssVar("--ops-canvas-grid"),
    path: cssVar("--ops-canvas-path"),
    title: cssVar("--ops-canvas-title"),
    subtitle: cssVar("--ops-canvas-subtitle"),
    heatEmpty: cssVar("--ops-heat-empty"),
    heatLow: hexToRgb(cssVar("--ops-heat-low")),
    heatMid: hexToRgb(cssVar("--ops-heat-mid")),
    heatHigh: hexToRgb(cssVar("--ops-heat-high")),
    textOnHeat: cssVar("--ops-canvas-text-on-heat"),
    textOnCool: cssVar("--ops-canvas-text-on-cool"),
    standFillHot: cssVar("--ops-canvas-stand-fill-hot"),
    standFillCool: cssVar("--ops-canvas-stand-fill-cool"),
    standStroke: cssVar("--ops-canvas-stand-stroke"),
    accentHot: cssVar("--ops-heat-high"),
    zoneColors: {
      "South Gate": cssVar("--ops-zone-a"),
      "Sampling Court": cssVar("--ops-zone-b"),
      "Main Stage Walkway": cssVar("--ops-zone-c"),
    },
  };
}

function countByZone(
  events: { zone: string; timestamp: number }[],
  cutoff: number
) {
  const counts = new Map<string, number>();
  for (const area of ZONE_AREAS) counts.set(area.zone, 0);
  for (const e of events) {
    if (e.timestamp < cutoff) continue;
    if (counts.has(e.zone)) counts.set(e.zone, (counts.get(e.zone) ?? 0) + 1);
  }
  return counts;
}

function heatColor(count: number, max: number, theme: CanvasTheme): string {
  if (max === 0) return theme.heatEmpty;
  const t = Math.min(count / max, 1);
  const { heatLow: low, heatMid: mid, heatHigh: high } = theme;
  if (t < 0.5) {
    const u = t / 0.5;
    const r = Math.round(low.r + u * (mid.r - low.r));
    const g = Math.round(low.g + u * (mid.g - low.g));
    const b = Math.round(low.b + u * (mid.b - low.b));
    return `rgb(${r}, ${g}, ${b})`;
  }
  const u = (t - 0.5) / 0.5;
  const r = Math.round(mid.r + u * (high.r - mid.r));
  const g = Math.round(mid.g + u * (high.g - mid.g));
  const b = Math.round(mid.b + u * (high.b - mid.b));
  return `rgb(${r}, ${g}, ${b})`;
}

function textColorForHeat(t: number, theme: CanvasTheme): string {
  return t > 0.45 ? theme.textOnHeat : theme.textOnCool;
}

export function VenueHeatmapCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssWidth = canvas.clientWidth || LOGICAL_WIDTH;
      const cssHeight = (cssWidth * LOGICAL_HEIGHT) / LOGICAL_WIDTH;
      canvas.style.height = `${cssHeight}px`;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
    };

    const draw = () => {
      const theme = readCanvasTheme();
      const events = useTelemetryStore.getState().events;
      const cutoff = Date.now() - WINDOW_MS;
      const counts = countByZone(events, cutoff);
      const max = Math.max(1, ...counts.values());
      const cssWidth = canvas.clientWidth || LOGICAL_WIDTH;
      const cssHeight = (cssWidth * LOGICAL_HEIGHT) / LOGICAL_WIDTH;
      const scaleX = cssWidth / LOGICAL_WIDTH;
      const scaleY = cssHeight / LOGICAL_HEIGHT;
      const scaleMin = Math.min(scaleX, scaleY);

      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // Dot-grid pattern
      ctx.fillStyle = theme.grid;
      for (let gx = 20; gx < LOGICAL_WIDTH; gx += 28) {
        for (let gy = 20; gy < LOGICAL_HEIGHT; gy += 28) {
          ctx.beginPath();
          ctx.arc(gx * scaleX, gy * scaleY, 1.2 * scaleMin, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Venue title
      ctx.fillStyle = theme.title;
      ctx.font = `600 ${14 * scaleMin}px var(--font-plex-sans), system-ui, sans-serif`;
      ctx.fillText("Venue plan · stand clusters by zone", 24 * scaleX, 32 * scaleY);
      ctx.fillStyle = theme.subtitle;
      ctx.font = `500 ${11 * scaleMin}px var(--font-plex-sans), system-ui, sans-serif`;
      ctx.fillText("Stand clusters · heat by 30 s window", 24 * scaleX, 50 * scaleY);

      // Main pedestrian paths
      ctx.strokeStyle = theme.path;
      ctx.lineWidth = 10 * scaleMin;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Horizontal main avenue
      ctx.beginPath();
      ctx.moveTo(40 * scaleX, 280 * scaleY);
      ctx.lineTo(920 * scaleX, 280 * scaleY);
      ctx.stroke();

      // Vertical connector from South Gate up
      ctx.lineWidth = 8 * scaleMin;
      ctx.beginPath();
      ctx.moveTo(150 * scaleX, 290 * scaleY);
      ctx.lineTo(150 * scaleX, 540 * scaleY);
      ctx.stroke();

      // Vertical path alongside Main Stage
      ctx.beginPath();
      ctx.moveTo(670 * scaleX, 140 * scaleY);
      ctx.lineTo(670 * scaleX, 490 * scaleY);
      ctx.stroke();

      // Gate markers
      ctx.fillStyle = theme.path;
      ctx.font = `700 ${10 * scaleMin}px var(--font-plex-mono), monospace`;
      ctx.fillText("\u25BC ENTRY", 110 * scaleX, 548 * scaleY);
      ctx.fillText("EXIT \u25B6", 880 * scaleX, 274 * scaleY);

      // Zone areas
      for (const area of ZONE_AREAS) {
        const count = counts.get(area.zone) ?? 0;
        const t = max > 0 ? Math.min(count / max, 1) : 0;
        const zoneColor = theme.zoneColors[area.zone] ?? theme.accentHot;

        ctx.fillStyle = heatColor(count, max, theme);
        ctx.beginPath();
        ctx.roundRect(
          area.x * scaleX,
          area.y * scaleY,
          area.w * scaleX,
          area.h * scaleY,
          12 * scaleMin,
        );
        ctx.fill();

        ctx.strokeStyle = t > 0.55 ? theme.accentHot : zoneColor;
        ctx.lineWidth = (t > 0.55 ? 2.5 : 1.5) * scaleMin;
        ctx.beginPath();
        ctx.roundRect(
          area.x * scaleX,
          area.y * scaleY,
          area.w * scaleX,
          area.h * scaleY,
          12 * scaleMin,
        );
        ctx.stroke();

        const labelColor = textColorForHeat(t, theme);
        ctx.fillStyle = labelColor;
        ctx.font = `700 ${13 * scaleMin}px var(--font-plex-sans), system-ui, sans-serif`;
        ctx.fillText(area.label, (area.x + 12) * scaleX, (area.y + 24) * scaleY);
        ctx.font = `500 ${11 * scaleMin}px var(--font-plex-mono), monospace`;
        ctx.fillText(`${count} evt/30s`, (area.x + 12) * scaleX, (area.y + 42) * scaleY);
      }

      // Individual stands
      for (const stand of STANDS) {
        const zoneCount = counts.get(stand.zone) ?? 0;
        const t = max > 0 ? Math.min(zoneCount / max, 1) : 0;
        ctx.fillStyle = t > 0.5 ? theme.standFillHot : theme.standFillCool;
        ctx.beginPath();
        ctx.roundRect(
          stand.x * scaleX,
          stand.y * scaleY,
          stand.w * scaleX,
          stand.h * scaleY,
          6 * scaleMin,
        );
        ctx.fill();
        ctx.strokeStyle = theme.standStroke;
        ctx.lineWidth = 1 * scaleMin;
        ctx.beginPath();
        ctx.roundRect(
          stand.x * scaleX,
          stand.y * scaleY,
          stand.w * scaleX,
          stand.h * scaleY,
          6 * scaleMin,
        );
        ctx.stroke();
        ctx.fillStyle = textColorForHeat(t, theme);
        ctx.font = `600 ${10 * scaleMin}px var(--font-plex-mono), monospace`;
        ctx.fillText(stand.label, (stand.x + 6) * scaleX, (stand.y + 24) * scaleY);
      }

      frameId = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={LOGICAL_WIDTH}
      height={LOGICAL_HEIGHT}
      className="w-full rounded-xl"
      data-venue-heatmap
      aria-label="Venue heatmap — stand demand by zone"
    />
  );
}
