"use client";

import { useCallback, useEffect, useState } from "react";

export type OpsPreset = "day" | "night";

const STORAGE_KEY = "live-event-radar-ops-preset";

function readPreset(): OpsPreset {
  if (typeof window === "undefined") return "day";
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "night" ? "night" : "day";
}

function applyPreset(preset: OpsPreset) {
  document.documentElement.dataset.opsPreset = preset;
}

export function useOpsPreset() {
  const [preset, setPresetState] = useState<OpsPreset>("day");

  useEffect(() => {
    const initial = readPreset();
    applyPreset(initial);
    setPresetState(initial);
  }, []);

  const setPreset = useCallback((next: OpsPreset) => {
    applyPreset(next);
    localStorage.setItem(STORAGE_KEY, next);
    setPresetState(next);
  }, []);

  return { preset, setPreset };
}
