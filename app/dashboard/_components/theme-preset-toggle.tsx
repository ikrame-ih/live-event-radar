"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import type { OpsPreset } from "@/features/live-radar/hooks/use-ops-preset";

type ThemePresetToggleProps = {
  preset: OpsPreset;
  onChange: (preset: OpsPreset) => void;
};

export function ThemePresetToggle({ preset, onChange }: ThemePresetToggleProps) {
  return (
    <div
      className="inline-flex rounded-full border border-[var(--ops-border)] bg-[var(--ops-surface-muted)] p-1 transition-colors duration-250"
      role="group"
      aria-label="Display preset"
    >
      <button
        type="button"
        onClick={() => onChange("day")}
        aria-pressed={preset === "day"}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-250 ${
          preset === "day"
            ? "ops-card text-[var(--ops-text-primary)]"
            : "text-[var(--ops-text-subtle)] hover:text-[var(--ops-text-muted)]"
        }`}
      >
        <IconSun className="h-4 w-4" stroke={1.75} aria-hidden />
        Day
      </button>
      <button
        type="button"
        onClick={() => onChange("night")}
        aria-pressed={preset === "night"}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-250 ${
          preset === "night"
            ? "ops-card text-[var(--ops-text-primary)]"
            : "text-[var(--ops-text-subtle)] hover:text-[var(--ops-text-muted)]"
        }`}
      >
        <IconMoon className="h-4 w-4" stroke={1.75} aria-hidden />
        Night
      </button>
    </div>
  );
}
