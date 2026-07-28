import { create } from "zustand";
import type { StockEvent } from "../types";
import { MAX_EVENTS } from "../constants";
import { RingBuffer } from "../lib/ring-buffer";

export type TelemetryState = {
  events: StockEvent[];
  /** Monotonic publish counter — useful for benches without depending on array identity. */
  revision: number;
  appendEvent: (event: StockEvent) => void;
  /** Single snapshot for N events — used by load benches to avoid N React publishes. */
  appendEvents: (batch: readonly StockEvent[]) => void;
  clearEvents: () => void;
};

/**
 * Module-level ring owns the mutable slots; Zustand only stores the immutable
 * snapshot React subscribes to. That split keeps append O(1) while preserving
 * the familiar `events` selector API used across both routes.
 */
const ring = new RingBuffer<StockEvent>(MAX_EVENTS);

function publish(revision: number): Pick<TelemetryState, "events" | "revision"> {
  return { events: ring.toArray(), revision };
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  events: [],
  revision: 0,
  appendEvent: (event) => {
    ring.push(event);
    set(publish(get().revision + 1));
  },
  appendEvents: (batch) => {
    if (batch.length === 0) return;
    ring.pushMany(batch);
    set(publish(get().revision + 1));
  },
  clearEvents: () => {
    ring.clear();
    set({ events: [], revision: get().revision + 1 });
  },
}));

/** Test/bench helper — resets both the ring and the store mirror. */
export function resetTelemetryStore(): void {
  ring.clear();
  useTelemetryStore.setState({ events: [], revision: 0 });
}
