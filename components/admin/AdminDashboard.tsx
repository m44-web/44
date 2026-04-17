"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { RealtimeProvider, useRealtime } from "./RealtimeProvider";
import { EmployeeMap } from "./EmployeeMap";
import { EmployeeList } from "./EmployeeList";
import { AudioPanel } from "./AudioPanel";
import { StatsBar } from "./StatsBar";
import { Toasts } from "./Toasts";
import { AlertWatcher } from "./AlertWatcher";
import Link from "next/link";

function ConnectionBadge() {
  const { connected } = useRealtime();
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
        connected
          ? "bg-success/20 text-success"
          : "bg-warning/20 text-warning"
      }`}
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
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-white/10 sticky top-0 z-50">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-semibold">営業監視システム</h1>
            <ConnectionBadge />
            <AlertWatcher />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted hidden sm:inline">
              {userName}
            </span>
            <Link href="/admin/employees">
              <Button variant="ghost" className="text-sm">
                従業員管理
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="text-sm">
                設定
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-sm">
              ログアウト
            </Button>
          </div>
        </Container>
      </header>

      <Container className="py-6 space-y-6">
        <StatsBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmployeeMap />
          </div>
          <div className="space-y-6">
            <EmployeeList />
            <AudioPanel />
          </div>
        </div>
      </Container>
      <Toasts />
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
