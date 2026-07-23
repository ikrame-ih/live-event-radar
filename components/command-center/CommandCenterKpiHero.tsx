import { Radio } from "lucide-react";
import { AnimatedBufferCount } from "@/components/AnimatedBufferCount";
import { ConnectionStatusBadge } from "@/components/ConnectionStatusBadge";
import { alertCountLabel } from "@/features/live-radar/lib/alert-label";
import type { WsConnectionStatus } from "@/features/live-radar/hooks/use-stock-websocket";

type CommandCenterKpiHeroProps = {
  eventCount: number;
  criticalCount: number;
  simulatorOnly: boolean;
  wsUrl?: string;
  wsStatus: WsConnectionStatus;
};

export function CommandCenterKpiHero({
  eventCount,
  criticalCount,
  simulatorOnly,
  wsUrl,
  wsStatus,
}: CommandCenterKpiHeroProps) {
  return (
    <div className="bry-kpi-hero bry-box bry-row-enter flex min-h-full flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
      <div
        className="bry-kpi-hero-icon flex shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24"
        style={{
          background: "var(--box-inner)",
          boxShadow: "var(--shadow-inset)",
        }}
      >
        <Radio
          size={32}
          strokeWidth={1.5}
          className="text-(--text-muted)"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="bry-caps mb-2">Live now</h1>
        <AnimatedBufferCount
          value={eventCount}
          className="bry-stat-big bry-kpi-display font-mono"
        />
        <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
          Events received
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ConnectionStatusBadge
            simulatorOnly={simulatorOnly}
            wsUrl={wsUrl}
            wsStatus={wsStatus}
          />
          {criticalCount > 0 && (
            <span className="bry-tag-neon inline-flex h-9 items-center px-4">
              {alertCountLabel(criticalCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
