import { DashboardLive } from "./dashboard-live";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="mb-4 text-xl font-semibold tracking-tight">
        LiveEvent Radar
      </h1>
      <DashboardLive />
    </main>
  );
}
