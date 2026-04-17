"use client";

import { Container } from "@/components/ui/Container";
import { RealtimeProvider, useRealtime } from "./RealtimeProvider";
import { EmployeeMap } from "./EmployeeMap";
import { EmployeeList } from "./EmployeeList";
import { AudioPanel } from "./AudioPanel";
import { StatsBar } from "./StatsBar";
import { ShiftTimeline } from "./ShiftTimeline";
import { Toasts } from "./Toasts";
import { AlertWatcher } from "./AlertWatcher";
import { CommandPalette } from "./CommandPalette";
import { ActivityFeed } from "./ActivityFeed";
import { AdminNav } from "./AdminNav";

function ConnectionBadge() {
  const { connected, reconnectCount } = useRealtime();
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
        connected
          ? "bg-success/20 text-success"
          : "bg-warning/20 text-warning"
      }`}
      title={reconnectCount > 0 ? `再接続回数: ${reconnectCount}` : undefined}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          connected ? "bg-success" : "bg-warning animate-pulse"
        }`}
      />
      {connected ? "接続中" : "再接続中..."}
    </span>
  );
}

function DashboardContent({ userName }: { userName: string }) {
  return (
    <div className="min-h-screen">
      <AdminNav userName={userName} />
      <Container className="py-2 flex items-center gap-3 flex-wrap">
        <ConnectionBadge />
        <AlertWatcher />
      </Container>

      <Container className="py-4 space-y-6">
        <StatsBar />
        <ShiftTimeline />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmployeeMap />
          </div>
          <div className="space-y-6">
            <EmployeeList />
            <ActivityFeed />
            <AudioPanel />
          </div>
        </div>
      </Container>
      <Toasts />
      <CommandPalette />
    </div>
  );
}

export function AdminDashboard({ userName }: { userName: string }) {
  return (
    <RealtimeProvider>
      <DashboardContent userName={userName} />
    </RealtimeProvider>
  );
}
