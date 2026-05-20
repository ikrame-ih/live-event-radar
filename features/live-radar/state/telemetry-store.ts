import { create } from "zustand";
import type { StockEvent } from "../types";
import { MAX_EVENTS } from "../constants";

export type TelemetryState = {
  events: StockEvent[];
  appendEvent: (event: StockEvent) => void;
};

function trimEvents(events: StockEvent[], next: StockEvent): StockEvent[] {
  const merged = [...events, next];
  if (merged.length <= MAX_EVENTS) return merged;
  return merged.slice(merged.length - MAX_EVENTS);
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  events: [],
  appendEvent: (event: StockEvent) => set((state) => ({ events: trimEvents(state.events, event) })),
}));
