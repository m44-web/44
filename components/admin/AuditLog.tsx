"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface LogEntry {
  id: number;
  actorId: string | null;
  actorName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  createdAt: number;
}

const actionLabels: Record<string, string> = {
  login: "ログイン",
  deactivate_employee: "従業員を無効化",
  force_end_shift: "シフトを強制終了",
};

export function AuditLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((data) => setLogs(data.logs))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-white/10">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-text-muted hover:text-text text-sm">
              ← ダッシュボード
            </Link>
            <h1 className="font-semibold">監査ログ</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout} className="text-sm">
              ログアウト
            </Button>
          </div>
        </Container>
      </header>

      <Container className="py-6">
        <Card>
          <p className="text-sm text-text-muted mb-4">
            ログイン、従業員の無効化、シフトの強制終了などの重要操作を記録しています（最新200件）。
          </p>
          {loading ? (
            <p className="text-text-muted text-sm">読み込み中...</p>
          ) : logs.length === 0 ? (
            <p className="text-text-muted text-sm">ログはまだありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-white/10">
                    <th className="pb-2 font-medium">日時</th>
                    <th className="pb-2 font-medium">操作者</th>
                    <th className="pb-2 font-medium">アクション</th>
                    <th className="pb-2 font-medium">詳細</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 text-text-muted whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("ja-JP")}
                      </td>
                      <td className="py-3">{log.actorName ?? "-"}</td>
                      <td className="py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {actionLabels[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="py-3 text-text-muted">
                        {log.detail ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
