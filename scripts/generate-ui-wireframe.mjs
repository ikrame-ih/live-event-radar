/**
 * One-off generator for docs/ui-wireframe-early-stage.excalidraw
 * Run: node scripts/generate-ui-wireframe.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs", "ui-wireframe-early-stage.excalidraw");

let seedCounter = 1000;
let nonceCounter = 2000;

function id(label) {
  return `wf-${label}`;
}

function base(type, props) {
  seedCounter += 17;
  nonceCounter += 23;
  return {
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "hachure",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    roundness: type === "rectangle" ? { type: 3 } : null,
    seed: seedCounter,
    version: 1,
    versionNonce: nonceCounter,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    index: `a${seedCounter}`,
    ...props,
    type,
  };
}

function rect(label, x, y, w, h, opts = {}) {
  return base("rectangle", {
    id: id(label),
    x,
    y,
    width: w,
    height: h,
    backgroundColor: opts.bg ?? "transparent",
    fillStyle: opts.fill ?? "hachure",
    strokeStyle: opts.dashed ? "dashed" : "solid",
    frameId: opts.frameId ?? null,
    groupIds: opts.groupIds ?? [],
  });
}

function txt(label, x, y, w, h, content, opts = {}) {
  return base("text", {
    id: id(label),
    x,
    y,
    width: w,
    height: h,
    strokeColor: opts.muted ? "#868e96" : "#1e1e1e",
    fillStyle: "solid",
    strokeWidth: 1,
    roughness: 0,
    roundness: null,
    frameId: opts.frameId ?? null,
    text: content,
    fontSize: opts.size ?? 16,
    fontFamily: 1,
    textAlign: opts.align ?? "left",
    verticalAlign: "top",
    containerId: null,
    originalText: content,
    autoResize: true,
    lineHeight: 1.25,
  });
}

function arrow(label, x, y, dx, dy, opts = {}) {
  return base("arrow", {
    id: id(label),
    x,
    y,
    width: Math.abs(dx),
    height: Math.abs(dy),
    fillStyle: "solid",
    roundness: { type: 2 },
    strokeStyle: opts.dashed ? "dashed" : "solid",
    frameId: opts.frameId ?? null,
    points: [
      [0, 0],
      [dx, dy],
    ],
    lastCommittedPoint: null,
    startBinding: opts.startBinding ?? null,
    endBinding: opts.endBinding ?? null,
    startArrowhead: null,
    endArrowhead: "arrow",
    elbowed: false,
  });
}

function frame(label, x, y, w, h, name, children) {
  return base("frame", {
    id: id(label),
    x,
    y,
    width: w,
    height: h,
    roughness: 0,
    strokeColor: "#adb5bd",
    fillStyle: "solid",
    name,
    children,
  });
}

// --- layout constants ---
const F1 = { x: 60, y: 140, w: 500, h: 780 };
const F2 = { x: 640, y: 140, w: 500, h: 780 };

const elements = [];

// Title block (canvas level)
elements.push(
  txt("title", 60, 40, 900, 40, "LiveEvent Radar — early UI sketch", { size: 28 }),
  txt("subtitle", 60, 78, 700, 30, "rough layout before glass polish · routes / and /dashboard", {
    size: 18,
    muted: true,
  }),
);

// Frame definitions
const frameCmd = frame("frame-cmd", F1.x, F1.y, F1.w, F1.h, "/ Command Center", []);
const frameDash = frame("frame-dash", F2.x, F2.y, F2.w, F2.h, "/dashboard Telemetry", []);

// --- COMMAND CENTER ---
const cx = F1.x + 24;
const cy = F1.y + 48;
const cw = F1.w - 48;

const shellHeader = rect("cmd-header", cx, cy, cw, 52, {
  bg: "#e9ecef",
  frameId: frameCmd.id,
});
const search = rect("cmd-search", cx, cy + 64, 180, 32, {
  frameId: frameCmd.id,
  dashed: true,
});
const kpi = rect("cmd-kpi", cx, cy + 108, cw * 0.58, 110, {
  bg: "#fff3bf",
  frameId: frameCmd.id,
});
const gauge = rect("cmd-gauge", cx + cw * 0.62, cy + 108, cw * 0.38 - 8, 110, {
  bg: "#d0ebff",
  frameId: frameCmd.id,
});
const zoneRow = rect("cmd-zones", cx, cy + 232, cw, 88, {
  frameId: frameCmd.id,
});
const zone1 = rect("cmd-z1", cx + 8, cy + 240, (cw - 32) / 3, 72, {
  frameId: frameCmd.id,
});
const zone2 = rect("cmd-z2", cx + 16 + (cw - 32) / 3, cy + 240, (cw - 32) / 3, 72, {
  frameId: frameCmd.id,
});
const zone3 = rect("cmd-z3", cx + 24 + (2 * (cw - 32)) / 3, cy + 240, (cw - 32) / 3, 72, {
  frameId: frameCmd.id,
});
const map = rect("cmd-map", cx, cy + 332, cw, 220, {
  bg: "#ffe8cc",
  frameId: frameCmd.id,
});
const activity = rect("cmd-activity", cx, cy + 564, cw, 168, {
  frameId: frameCmd.id,
});
const actRow1 = rect("cmd-act1", cx + 12, cy + 580, cw - 24, 36, {
  frameId: frameCmd.id,
  dashed: true,
});
const actRow2 = rect("cmd-act2", cx + 12, cy + 624, cw - 24, 36, {
  frameId: frameCmd.id,
  dashed: true,
});
const actRow3 = rect("cmd-act3", cx + 12, cy + 668, cw - 24, 36, {
  frameId: frameCmd.id,
  dashed: true,
});

elements.push(
  frameCmd,
  shellHeader,
  search,
  kpi,
  gauge,
  zoneRow,
  zone1,
  zone2,
  zone3,
  map,
  activity,
  actRow1,
  actRow2,
  actRow3,
  txt("cmd-h-lbl", cx + 8, cy + 6, 200, 24, "AppShell header", {
    frameId: frameCmd.id,
    size: 14,
    muted: true,
  }),
  txt("cmd-h-logo", cx + 12, cy + 14, 140, 24, "logo + title", { frameId: frameCmd.id, size: 14 }),
  txt("cmd-h-role", cx + 160, cy + 14, 80, 24, "Coordinator", {
    frameId: frameCmd.id,
    size: 14,
    muted: true,
  }),
  txt("cmd-h-nav", cx + cw - 130, cy + 14, 120, 24, "nav: / | /dash | map", {
    frameId: frameCmd.id,
    size: 14,
  }),
  txt("cmd-search-t", cx + 8, cy + 68, 120, 20, "search (later?)", {
    frameId: frameCmd.id,
    size: 13,
    muted: true,
  }),
  txt("cmd-kpi-t", cx + 12, cy + 118, 200, 60, "KPI hero\n· events buffered\n· feed badge\n· critical tag", {
    frameId: frameCmd.id,
    size: 15,
  }),
  txt("cmd-gauge-t", cx + cw * 0.62 + 12, cy + 118, 160, 60, "30s gauge\nactive zones\nstream rate", {
    frameId: frameCmd.id,
    size: 15,
  }),
  txt("cmd-zones-t", cx + 8, cy + 236, cw, 20, "zone inventory — 3 cards (stock %, demand)", {
    frameId: frameCmd.id,
    size: 13,
    muted: true,
  }),
  txt("cmd-z1-t", cx + 20, cy + 268, 60, 20, "SG", { frameId: frameCmd.id, size: 14 }),
  txt("cmd-z2-t", cx + 20 + (cw - 32) / 3, cy + 268, 60, 20, "SC", { frameId: frameCmd.id, size: 14 }),
  txt("cmd-z3-t", cx + 20 + (2 * (cw - 32)) / 3, cy + 268, 60, 20, "MSW", {
    frameId: frameCmd.id,
    size: 14,
  }),
  txt("cmd-map-t", cx + 12, cy + 340, 280, 40, "SVG venue map\n3 zones · stock heat fill", {
    frameId: frameCmd.id,
    size: 16,
  }),
  txt("cmd-map-note", cx + 12, cy + 490, 320, 24, "click zone ↔ highlight activity row", {
    frameId: frameCmd.id,
    size: 13,
    muted: true,
  }),
  txt("cmd-act-t", cx + 12, cy + 568, 200, 20, "zone activity feed", {
    frameId: frameCmd.id,
    size: 15,
  }),
  txt("cmd-act-note", cx + 12, cy + 710, 360, 24, "rollup incidents · 30s window", {
    frameId: frameCmd.id,
    size: 13,
    muted: true,
  }),
);

frameCmd.children = [
  shellHeader.id,
  search.id,
  kpi.id,
  gauge.id,
  zoneRow.id,
  zone1.id,
  zone2.id,
  zone3.id,
  map.id,
  activity.id,
  actRow1.id,
  actRow2.id,
  actRow3.id,
];

// --- DASHBOARD ---
const dx = F2.x + 24;
const dy = F2.y + 48;
const dw = F2.w - 48;

const dashHeader = rect("dash-header", dx, dy, dw, 52, {
  bg: "#e9ecef",
  frameId: frameDash.id,
});
const dashTitle = rect("dash-title-row", dx, dy + 64, dw * 0.65, 48, {
  frameId: frameDash.id,
});
const dashBadge = rect("dash-badge", dx + dw * 0.68, dy + 68, dw * 0.32 - 8, 40, {
  bg: "#d3f9d8",
  frameId: frameDash.id,
});
const dashFilters = rect("dash-filters", dx, dy + 124, dw, 72, {
  frameId: frameDash.id,
});
const dashMap = rect("dash-map", dx, dy + 208, dw, 200, {
  bg: "#ffe8cc",
  frameId: frameDash.id,
});
const dashStreamHead = rect("dash-stream-head", dx, dy + 420, dw * 0.55, 56, {
  frameId: frameDash.id,
});
const dashBuffer = rect("dash-buffer", dx + dw * 0.58, dy + 420, dw * 0.42 - 8, 56, {
  bg: "#fff3bf",
  frameId: frameDash.id,
});
const dashList = rect("dash-list", dx, dy + 488, dw, 220, {
  frameId: frameDash.id,
});
const dashRow1 = rect("dash-r1", dx + 12, dy + 500, dw - 24, 32, {
  frameId: frameDash.id,
  dashed: true,
});
const dashRow2 = rect("dash-r2", dx + 12, dy + 540, dw - 24, 32, {
  frameId: frameDash.id,
  dashed: true,
});
const dashRow3 = rect("dash-r3", dx + 12, dy + 580, dw - 24, 32, {
  frameId: frameDash.id,
  dashed: true,
});
const dashRow4 = rect("dash-r4", dx + 12, dy + 620, dw - 24, 32, {
  frameId: frameDash.id,
  dashed: true,
});

elements.push(
  frameDash,
  dashHeader,
  dashTitle,
  dashBadge,
  dashFilters,
  dashMap,
  dashStreamHead,
  dashBuffer,
  dashList,
  dashRow1,
  dashRow2,
  dashRow3,
  dashRow4,
  txt("dash-h-lbl", dx + 8, dy + 6, 200, 24, "same AppShell", {
    frameId: frameDash.id,
    size: 14,
    muted: true,
  }),
  txt("dash-h-nav", dx + dw - 130, dy + 14, 120, 24, "nav (grid active)", {
    frameId: frameDash.id,
    size: 14,
  }),
  txt("dash-title-t", dx + 12, dy + 72, 220, 40, "LiveEvent Radar\nsubtitle", {
    frameId: frameDash.id,
    size: 15,
  }),
  txt("dash-badge-t", dx + dw * 0.68 + 8, dy + 78, 140, 24, "connection badge", {
    frameId: frameDash.id,
    size: 14,
  }),
  txt("dash-filt-t", dx + 12, dy + 132, dw - 24, 56, "filters\n· search zone/item\n· zone pills\n· spike / normal", {
    frameId: frameDash.id,
    size: 14,
  }),
  txt("dash-map-t", dx + 12, dy + 216, 260, 40, "Leaflet map\nTeatinos · OSM tiles", {
    frameId: frameDash.id,
    size: 16,
  }),
  txt("dash-stream-t", dx + 12, dy + 428, 160, 24, "event stream", { frameId: frameDash.id, size: 15 }),
  txt("dash-buffer-t", dx + dw * 0.58 + 12, dy + 428, 160, 40, "buffer KPI\ncap 10k FIFO", {
    frameId: frameDash.id,
    size: 14,
  }),
  txt("dash-list-t", dx + 12, dy + 668, 280, 24, "aria-live rows · filterable", {
    frameId: frameDash.id,
    size: 13,
    muted: true,
  }),
);

frameDash.children = [
  dashHeader.id,
  dashTitle.id,
  dashBadge.id,
  dashFilters.id,
  dashMap.id,
  dashStreamHead.id,
  dashBuffer.id,
  dashList.id,
  dashRow1.id,
  dashRow2.id,
  dashRow3.id,
  dashRow4.id,
];

// Navigation arrows between screens
const navArrow1 = arrow("nav-to-dash", F1.x + F1.w + 8, F1.y + 90, 120, 0, {
  startBinding: { elementId: frameCmd.id, focus: 0, gap: 4 },
  endBinding: { elementId: frameDash.id, focus: 0, gap: 4 },
});
const navArrow2 = arrow("nav-to-cmd", F1.x + F1.w + 8, F1.y + 130, 120, 40, {
  dashed: true,
  startBinding: { elementId: frameDash.id, focus: 0, gap: 4 },
  endBinding: { elementId: frameCmd.id, focus: 0, gap: 4 },
});

elements.push(
  navArrow1,
  navArrow2,
  txt("nav-lbl1", F1.x + F1.w + 20, F1.y + 72, 110, 20, "header nav", { size: 14 }),
  txt("nav-lbl2", F1.x + F1.w + 20, F1.y + 168, 140, 20, "TransitionLink ~180ms", {
    size: 13,
    muted: true,
  }),
);

// Bottom: shared data sketch
const by = F1.y + F1.h + 48;
elements.push(
  rect("data-mock", 60, by, 120, 56, { bg: "#e7f5ff" }),
  rect("data-store", 220, by, 140, 56, { bg: "#fff3bf" }),
  rect("data-derive", 400, by, 140, 56, { bg: "#ffe8cc" }),
  rect("data-ui", 580, by, 200, 56, { bg: "#d3f9d8" }),
  arrow("data-a1", 180, by + 28, 36, 0),
  arrow("data-a2", 360, by + 28, 36, 0),
  arrow("data-a3", 540, by + 28, 36, 0),
  txt("data-t1", 68, by + 8, 100, 40, "mock /\nWebSocket", { size: 14 }),
  txt("data-t2", 228, by + 8, 120, 40, "telemetry-\nstore", { size: 14 }),
  txt("data-t3", 408, by + 8, 120, 40, "derive\nincidents + stock", { size: 14 }),
  txt("data-t4", 588, by + 8, 180, 40, "both routes\n(same events)", { size: 14 }),
  txt("data-note", 60, by + 72, 720, 24, "sketched after deciding: one ingestion path, two surfaces", {
    size: 14,
    muted: true,
  }),
);

// Early thinking notes (margin)
elements.push(
  txt("note1", 60, by + 110, 520, 80, "notes from first pass:\n· / = ops view first (not redirect to dashboard)\n· map + list should talk to each other\n· second route = debug/telemetry depth", {
    size: 15,
  }),
  txt("note2", 640, by + 110, 500, 80, "deferred:\n· glass / motion polish\n· real WS feed\n· worker analytics (echo only for now)", {
    size: 15,
    muted: true,
  }),
);

// Abbreviation legend (right column)
const G = { x: 1180, y: 140, w: 360, h: 780 };
const glossaryFrame = frame("frame-glossary", G.x, G.y, G.w, G.h, "Abbreviations", []);
const glossaryBox = rect("glossary-box", G.x + 16, G.y + 40, G.w - 32, G.h - 56, {
  frameId: glossaryFrame.id,
  dashed: true,
});

const glossaryText =
  "Zones\n" +
  "· SG — South Gate (entry · 3 stands)\n" +
  "· SC — Sampling Court (activation · 6 stands)\n" +
  "· MSW — Main Stage Walkway (corridor · 2 stands)\n" +
  "\n" +
  "Maps & layout\n" +
  "· SVG — schematic floor plan on /\n" +
  "· OSM — OpenStreetMap tile layer (Leaflet)\n" +
  "· /dash — nav shorthand for /dashboard\n" +
  "\n" +
  "Metrics & buffer\n" +
  "· KPI — hero metric block (buffer count, etc.)\n" +
  "· 10k — event cap (10,000 rows in store)\n" +
  "· FIFO — first in, first out (oldest row drops)\n" +
  "· 30s / 15s — rolling time windows for demand\n" +
  "\n" +
  "Feed & a11y\n" +
  "· WS — WebSocket live feed (vs mock simulator)\n" +
  "· evt — events (e.g. demand shown as evt/30s)\n" +
  "· aria-live — SR announces new stream rows";

elements.push(
  glossaryFrame,
  glossaryBox,
  txt("glossary-title", G.x + 20, G.y + 48, G.w - 40, 28, "what the shorthand means", {
    frameId: glossaryFrame.id,
    size: 16,
  }),
  txt("glossary-body", G.x + 24, G.y + 82, G.w - 48, G.h - 100, glossaryText, {
    frameId: glossaryFrame.id,
    size: 14,
  }),
);

glossaryFrame.children = [glossaryBox.id];

const doc = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements,
  appState: {
    gridSize: 20,
    viewBackgroundColor: "#ffffff",
  },
  files: {},
};

writeFileSync(OUT, JSON.stringify(doc, null, 2), "utf8");
console.log(`Wrote ${OUT} (${elements.length} elements)`);
