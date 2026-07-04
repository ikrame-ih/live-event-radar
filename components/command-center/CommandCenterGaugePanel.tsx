import { StreamGauge } from "@/components/StreamGauge";

type CommandCenterGaugePanelProps = {
  activeZones: number;
  streamRateLabel: string;
  criticalCount: number;
};

export function CommandCenterGaugePanel({
  activeZones,
  streamRateLabel,
  criticalCount,
}: CommandCenterGaugePanelProps) {
  return (
    <div className="bry-kpi-gauge bry-box bry-row-enter p-6 sm:p-7">
      <p className="bry-caps mb-4 text-center">30 second window</p>
      <StreamGauge value={activeZones} max={3} />
      <ul className="mt-5 space-y-2 text-sm">
        <li className="flex justify-between border-b border-white/45 pb-2">
          <span className="text-[var(--text-muted)]">Active zones</span>
          <span className="font-bold tabular-nums">{activeZones}/3</span>
        </li>
        <li className="flex justify-between border-b border-white/45 pb-2">
          <span className="text-[var(--text-muted)]">Stream rate</span>
          <span className="font-bold tabular-nums">{streamRateLabel}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-[var(--text-muted)]">Critical</span>
          <span className="font-bold tabular-nums">{criticalCount}</span>
        </li>
      </ul>
    </div>
  );
}
