import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bry-page-shell px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      {children}
    </div>
  );
}
