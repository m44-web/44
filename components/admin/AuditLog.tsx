"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "./AdminNav";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/audit?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs);
        setNextCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadMore = () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    fetch(`/api/audit?limit=50&cursor=${nextCursor}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs((prev) => [...prev, ...data.logs]);
        setNextCursor(data.nextCursor);
      })
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="min-h-screen">
      <AdminNav />

      <Container className="py-6">
        <h1 className="font-semibold text-lg mb-4">監査ログ</h1>
        <Card>
          <p className="text-sm text-text-muted mb-4">
            ログイン、従業員の無効化、シフトの強制終了などの重要操作を記録しています。
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
              {nextCursor && (
                <div className="mt-4 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-text-muted disabled:opacity-50"
                  >
                    {loadingMore ? "読み込み中..." : "さらに読み込む"}
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
