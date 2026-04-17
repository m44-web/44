"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface Shift {
  id: string;
  userId: string;
  userName: string;
  startedAt: number;
  endedAt: number | null;
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("ja-JP");
}

function formatDuration(ms: number) {
  if (ms < 60000) return `${Math.floor(ms / 1000)}秒`;
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}分`;
  return `${h}時間${m}分`;
}

export function ShiftHistory() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    fetch("/api/shifts")
      .then((r) => r.json())
      .then((data) => setShifts(data.shifts))
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = shifts.filter((s) => {
    const matchQ = q === "" || s.userName.toLowerCase().includes(q);
    const matchS =
      status === "all" ||
      (status === "active" ? !s.endedAt : !!s.endedAt);
    return matchQ && matchS;
  });

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
            <h1 className="font-semibold">シフト履歴</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/export?type=shifts&days=30"
              className="text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted"
            >
              30日分CSV
            </a>
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout} className="text-sm">
              ログアウト
            </Button>
          </div>
        </Container>
      </header>

      <Container className="py-6">
        <Card>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="従業員名で検索"
              className="px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm min-w-[220px]"
            />
            <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs">
              {(["all", "active", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 ${
                    status === s
                      ? "bg-primary text-white"
                      : "text-text-muted hover:bg-white/5"
                  }`}
                >
                  {s === "all" ? "全て" : s === "active" ? "勤務中" : "完了"}
                </button>
              ))}
            </div>
            <span className="text-xs text-text-muted">
              {filtered.length}件
            </span>
          </div>
          {loading ? (
            <p className="text-text-muted text-sm">読み込み中...</p>
          ) : filtered.length === 0 ? (
            <p className="text-text-muted text-sm">該当するシフトがありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-white/10">
                    <th className="pb-2 font-medium">従業員</th>
                    <th className="pb-2 font-medium">開始</th>
                    <th className="pb-2 font-medium">終了</th>
                    <th className="pb-2 font-medium">勤務時間</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((shift) => {
                    const end = shift.endedAt ?? Date.now();
                    return (
                      <tr key={shift.id} className="hover:bg-white/5">
                        <td className="py-3">
                          <Link
                            href={`/admin/employees/${shift.userId}`}
                            className="hover:text-primary"
                          >
                            {shift.userName}
                          </Link>
                        </td>
                        <td className="py-3">{formatDateTime(shift.startedAt)}</td>
                        <td className="py-3">
                          {shift.endedAt ? (
                            formatDateTime(shift.endedAt)
                          ) : (
                            <span className="text-success">勤務中</span>
                          )}
                        </td>
                        <td className="py-3 font-mono">
                          {formatDuration(end - shift.startedAt)}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/shifts/${shift.id}`}
                            className="text-primary hover:underline text-xs"
                          >
                            詳細 →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
