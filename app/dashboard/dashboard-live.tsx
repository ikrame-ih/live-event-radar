"use client";

// Client-only: hooks, Zustand store, and browser timers must not run on the server.

//I import the useState and useEffect hooks from React, also mockStockEvent from the mock-event-generator.ts file
//(A hook is a function that allows me to use state and side effects in a functional component)
//useState is used to hold the list of events (array of StockEvent objects) and useEffect is used to set up the timer interval
import { useEffect } from "react";
import { mockStockEvent } from "@/features/live-radar/mock/mock-event-generator";
import { useTelemetryStore } from "@/features/live-radar/state/telemetry-store";

export function DashboardLive() {
  const events = useTelemetryStore((s) => s.events);
  const appendEvent = useTelemetryStore((s) => s.appendEvent);
  const latest = events.at(-1);
  const recentFirst = [...events].reverse();

  useEffect(() => {
    const id = window.setInterval(() => appendEvent(mockStockEvent()), 1000);
    return () => window.clearInterval(id);
  }, [appendEvent]);

  //Return the JSX for the dashboard
  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 lg:col-span-1">
        <h2 className="text-sm font-medium text-slate-300">Alerts</h2>
        <p className="mt-2 text-xs text-slate-500">
          Stage 5 will add alerts here.
        </p>
      </section>
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 lg:col-span-2">
        <h2 className="text-sm font-medium text-slate-300">Venue view</h2>
        <p className="mt-2 text-xs text-amber-200/90">
          {events.length === 0
            ? "Waiting…"
            : `Last: ${latest?.zone} · ${latest?.item}`}
        </p>
      </section>
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 lg:col-span-1">
        <h2 className="text-sm font-medium text-slate-300">KPIs</h2>
        <p className="mt-4 text-2xl font-semibold tabular-nums">
          {events.length}
        </p>
        <p className="text-xs text-slate-500">
          rows (history length capped in appendEvent)
        </p>
      </section>
      <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 lg:col-span-4">
        <h2 className="text-sm font-medium text-slate-300">Recent events</h2>
        <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs text-slate-300">
          {recentFirst.slice(0, 50).map((e, i) => (
            <li key={`${e.timestamp}-${i}`}>
              <span className="text-slate-500">
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>{" "}
              {e.zone} — {e.item}{" "}
              <span className={e.quantity < 0 ? "text-rose-400" : ""}>
                {e.quantity}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
