import type { ZoneThroughputSummary } from "@/features/live-radar/lib/zone-throughput";
import type { AnalyticsWorkerStatus } from "@/features/live-radar/hooks/use-analytics-worker";

type Props = {
  summary: ZoneThroughputSummary | null;
  status: AnalyticsWorkerStatus;
};

/** Zone rates from the analytics worker on a short sample window. */
export function WorkerThroughputPanel({ summary, status }: Props) {
  return (
    <section
      className="bry-box mt-5 p-4 sm:p-5"
      aria-label="Worker throughput"
      data-worker-throughput
      data-worker-status={status}
    >
      <div className="bry-section-head mb-3">
        <div>
          <h2 className="bry-section-title">Zone throughput</h2>
          <p className="bry-section-subtitle">
            Last 60s rates from a Web Worker (short sample window)
          </p>
        </div>
        <span className="pill-zone font-semibold tabular-nums">
          Worker: {statusLabel(status)}
        </span>
      </div>

      {!summary ? (
        <p className="m-0 text-sm text-(--text-muted)" role="status">
          Waiting for the first analytics sample…
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-(--text-muted)">
            Sampled {summary.sampleSize} events
            {summary.hotspotZones.length > 0
              ? ` · Hotspot: ${summary.hotspotZones.join(", ")}`
              : " · No hotspot vs venue mean"}
          </p>
          <div className="overflow-x-auto">
            <table className="bry-tally-table">
              <thead>
                <tr>
                  <th scope="col">Zone</th>
                  <th scope="col">Events</th>
                  <th scope="col">Out</th>
                  <th scope="col">Rate/min</th>
                  <th scope="col">Flag</th>
                </tr>
              </thead>
              <tbody>
                {summary.zones.map((row) => (
                  <tr key={row.zone}>
                    <td>
                      <p className="bry-card-title m-0 truncate">{row.zone}</p>
                    </td>
                    <td className="bry-tally-num">{row.eventCount}</td>
                    <td className="bry-tally-num">−{row.consumedUnits}</td>
                    <td className="bry-tally-num">{row.ratePerMin}</td>
                    <td className="bry-tally-num bry-tally-num--muted">
                      {row.isHotspot ? "Hotspot" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function statusLabel(status: AnalyticsWorkerStatus): string {
  switch (status) {
    case "booting":
      return "starting";
    case "ready":
      return "live";
    case "error":
      return "error";
    case "unsupported":
      return "unavailable";
    default:
      return status;
  }
}
