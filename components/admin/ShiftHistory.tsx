"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "./AdminNav";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "completed">("all");

  const fetchShifts = (cursor?: string | null, statusVal?: string) => {
    const s = statusVal ?? (status === "all" ? "" : status);
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (s) params.set("status", s);
    params.set("limit", "50");
    return fetch(`/api/shifts?${params}`).then((r) => r.json());
  };

  useEffect(() => {
    setLoading(true);
    setShifts([]);
    const s = status === "all" ? undefined : status;
    fetchShifts(null, s)
      .then((data) => {
        setShifts(data.shifts);
        setNextCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const loadMore = () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const s = status === "all" ? undefined : status;
    fetchShifts(nextCursor, s)
      .then((data) => {
        setShifts((prev) => [...prev, ...data.shifts]);
        setNextCursor(data.nextCursor);
      })
      .finally(() => setLoadingMore(false));
  };

  const q = search.trim().toLowerCase();
  const filtered = shifts.filter((s) => {
    const matchQ = q === "" || s.userName.toLowerCase().includes(q);
    const matchS =
      status === "all" ||
      (status === "active" ? !s.endedAt : !!s.endedAt);
    return matchQ && matchS;
  });

  return (
    <div className="min-h-screen">
      <AdminNav />

      <Container className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-semibold text-lg">シフト履歴</h1>
          <a
            href="/api/export?type=shifts&days=30"
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted"
          >
            30日分CSV
          </a>
        </div>
        <Card>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="従業員名で検索"
              className="px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm min-w-[220px]"
            />
            <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs" role="group" aria-label="ステータスフィルター">
              {(["all", "active", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  aria-pressed={status === s}
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
            <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
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

            {/* Mobile card list */}
            <div className="sm:hidden space-y-2">
              {filtered.map((shift) => {
                const end = shift.endedAt ?? Date.now();
                return (
                  <Link
                    key={shift.id}
                    href={`/admin/shifts/${shift.id}`}
                    className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{shift.userName}</span>
                      {shift.endedAt ? (
                        <span className="text-xs font-mono text-text-muted">
                          {formatDuration(end - shift.startedAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-success">勤務中</span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      {formatDateTime(shift.startedAt)}
                      {shift.endedAt ? ` 〜 ${formatDateTime(shift.endedAt)}` : ""}
                    </p>
                  </Link>
                );
              })}
            </div>

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
            </>
          )}
        </Card>
      </Container>
    </div>
  );
}
