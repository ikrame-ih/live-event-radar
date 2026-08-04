"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

const INTERVAL_MS = 1000;
const listeners = new Set<Listener>();
let intervalId: number | null = null;
let snapshot = 0;

function ensureInterval() {
  if (typeof window === "undefined") return;
  if (intervalId !== null) return;
  snapshot = Date.now();
  intervalId = window.setInterval(() => {
    snapshot = Date.now();
    for (const listener of listeners) listener();
  }, INTERVAL_MS);
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  ensureInterval();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot(): number {
  ensureInterval();
  return snapshot;
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * Shared client clock — one interval for the whole app.
 * Returns 0 during SSR so markup stays stable; real ticks start after hydrate.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
