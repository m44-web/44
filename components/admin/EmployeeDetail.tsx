"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface EmployeeData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: number;
  };
  shifts: Array<{
    id: string;
    startedAt: number;
    endedAt: number | null;
    durationMs: number;
  }>;
  stats: {
    totalShifts: number;
    completedShifts: number;
    totalWorkedMs: number;
    isOnShift: boolean;
    currentShiftId: string | null;
    totalRecordings: number;
    totalGpsPoints: number;
  };
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("ja-JP");
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ja-JP");
}

function formatDuration(ms: number) {
  if (ms < 60000) return `${Math.floor(ms / 1000)}秒`;
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}分`;
  return `${h}時間${m}分`;
}

export function EmployeeDetail({ userId }: { userId: string }) {
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/employees/${userId}`);
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "取得に失敗しました");
        return;
      }
      setData(await res.json());
    } catch {
      setError("通信エラー");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">読み込み中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p className="text-danger">{error || "データがありません"}</p>
          <Link href="/admin" className="text-primary text-sm mt-2 inline-block">
            ← ダッシュボード
          </Link>
        </Card>
      </div>
    );
  }

  const { user, shifts, stats } = data;

  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-white/10">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-text-muted hover:text-text text-sm">
              ← ダッシュボード
            </Link>
            <h1 className="font-semibold">従業員詳細</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-sm">
            ログアウト
          </Button>
        </Container>
      </header>

      <Container className="py-6 space-y-6">
        <Card>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{user.name}</h2>
                {stats.isOnShift ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    稼働中
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 text-text-muted text-xs rounded-full">
                    オフライン
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted">{user.email}</p>
              <p className="text-xs text-text-muted mt-1">
                登録日: {formatDate(user.createdAt)}
              </p>
            </div>
            {stats.isOnShift && stats.currentShiftId && (
              <Link href={`/admin/shifts/${stats.currentShiftId}`}>
                <Button variant="primary" className="text-sm">
                  現在のシフトを見る
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-text-muted text-xs mb-1">総シフト数</p>
            <p className="text-2xl font-bold">{stats.totalShifts}</p>
          </Card>
          <Card>
            <p className="text-text-muted text-xs mb-1">総勤務時間</p>
            <p className="text-2xl font-bold">
              {formatDuration(stats.totalWorkedMs)}
            </p>
          </Card>
          <Card>
            <p className="text-text-muted text-xs mb-1">録音件数</p>
            <p className="text-2xl font-bold">{stats.totalRecordings}</p>
          </Card>
          <Card>
            <p className="text-text-muted text-xs mb-1">GPS記録点</p>
            <p className="text-2xl font-bold">{stats.totalGpsPoints}</p>
          </Card>
        </div>

        {/* Shift history */}
        <Card>
          <h3 className="font-semibold mb-4">シフト履歴</h3>
          {shifts.length === 0 ? (
            <p className="text-text-muted text-sm">シフト履歴はありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-white/10">
                    <th className="pb-2 font-medium">開始</th>
                    <th className="pb-2 font-medium">終了</th>
                    <th className="pb-2 font-medium">勤務時間</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shifts.map((shift) => (
                    <tr key={shift.id} className="hover:bg-white/5">
                      <td className="py-3">{formatDateTime(shift.startedAt)}</td>
                      <td className="py-3">
                        {shift.endedAt ? (
                          formatDateTime(shift.endedAt)
                        ) : (
                          <span className="text-success">勤務中</span>
                        )}
                      </td>
                      <td className="py-3 font-mono">
                        {formatDuration(shift.durationMs)}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/admin/shifts/${shift.id}`}
                          className="text-primary hover:underline text-xs"
                        >
                          詳細 →
                        </Link>
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
