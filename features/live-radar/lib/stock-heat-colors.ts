import type { StockHeat } from "./zone-stock";

/**
 * Single stock-tier palette for SVG map, Leaflet markers, bars, and pills.
 * cool = healthy · mid = watch · hot = low/critical
 */
export const STOCK_HEAT_COLORS: Record<
  StockHeat,
  {
    fill: string;
    glow: string;
    stroke: string;
    marker: string;
    stockColor: string;
  }
> = {
  cool: {
    fill: "#d5ebe0",
    glow: "#b8dcc8",
    stroke: "#0d9b5c",
    marker: "#0d9b5c",
    stockColor: "#0a7a49",
  },
  mid: {
    fill: "#fef3e0",
    glow: "#f5d4a8",
    stroke: "#d97706",
    marker: "#d97706",
    stockColor: "#9a6217",
  },
  hot: {
    fill: "#fdecea",
    glow: "#f5c4bc",
    stroke: "#e54d3a",
    marker: "#e54d3a",
    stockColor: "#b83a2c",
  },
};

export function stockHeatMarkerColor(heat: StockHeat): string {
  return STOCK_HEAT_COLORS[heat].marker;
}
