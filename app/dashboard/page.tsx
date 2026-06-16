import { DashboardShell } from "./_components/dashboard-shell";
import { DashboardLive } from "./dashboard-live";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardLive />
    </DashboardShell>
  );
}
