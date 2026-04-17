"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "./AdminNav";
import Link from "next/link";

type TabView = "daily" | "weekly";

interface EmployeeSummary {
  userId: string;
  userName: string;
  userEmail: string;
  shifts: number;
  totalMs: number;
  gpsPoints: number;
  recordings: number;
  firstStart: number;
  lastEnd: number | null;
}

interface DailyData {
  date: string;
  summary: {
    totalShifts: number;
    completedShifts: number;
    uniqueWorkers: number;
    totalEmployees: number;
    totalWorkedMs: number;
    absentees: Array<{ id: string; name: string }>;
  };
  employees: EmployeeSummary[];
}

function formatHours(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h === 0) return `${m}分`;
  return `${h}時間${m}分`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface WeekData {
  weekStart: string;
  weekEnd: string;
  employees: Array<{
    userId: string;
    userName: string;
    shifts: number;
    totalMs: number;
    daysWorked: number;
  }>;
  totalShifts: number;
  totalMs: number;
  uniqueWorkers: number;
}

interface WeeklyResponse {
  weeks: WeekData[];
  totalEmployees: number;
}

export function DailyReport() {
  const [tab, setTab] = useState<TabView>("daily");
  const [data, setData] = useState<DailyData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyResponse | null>(null);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/daily?date=${date}`);
      if (res.ok) setData(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [date]);

  const fetchWeeklyReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/weekly?weeks=4");
      if (res.ok) setWeeklyData(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "daily") fetchReport();
    else fetchWeeklyReport();
  }, [tab, fetchReport, fetchWeeklyReport]);

  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    const today = new Date().toISOString().slice(0, 10);
    const next = d.toISOString().slice(0, 10);
    if (next <= today) setDate(next);
  };

  const attendanceRate = data
    ? data.summary.totalEmployees > 0
      ? Math.round((data.summary.uniqueWorkers / data.summary.totalEmployees) * 100)
      : 0
    : 0;

  return (
    <div className="min-h-screen">
      <AdminNav />
      <Container className="py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg">レポート</h1>
            <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs" role="group" aria-label="レポート種別">
              <button
                onClick={() => setTab("daily")}
                aria-pressed={tab === "daily"}
                className={`px-3 py-1.5 ${tab === "daily" ? "bg-primary text-white" : "text-text-muted hover:bg-white/5"}`}
              >
                日次
              </button>
              <button
                onClick={() => setTab("weekly")}
                aria-pressed={tab === "weekly"}
                className={`px-3 py-1.5 ${tab === "weekly" ? "bg-primary text-white" : "text-text-muted hover:bg-white/5"}`}
              >
                週次
              </button>
            </div>
          </div>
          {tab === "daily" && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevDay}
                className="px-2 py-1 text-sm rounded bg-white/5 hover:bg-white/10 text-text-muted"
                aria-label="前日"
              >
                ←
              </button>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="px-3 py-1.5 bg-surface-light border border-white/10 rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={nextDay}
                disabled={date >= new Date().toISOString().slice(0, 10)}
                className="px-2 py-1 text-sm rounded bg-white/5 hover:bg-white/10 text-text-muted disabled:opacity-30"
                aria-label="翌日"
              >
                →
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {tab === "weekly" && !loading && weeklyData && (
          <>
            {weeklyData.weeks.map((week) => {
              const rate = weeklyData.totalEmployees > 0
                ? Math.round((week.uniqueWorkers / weeklyData.totalEmployees) * 100)
                : 0;
              return (
                <Card key={week.weekStart}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">
                      {week.weekStart} 〜 {week.weekEnd}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>出勤率 <span className={rate >= 80 ? "text-success" : rate >= 50 ? "text-warning" : "text-danger"}>{rate}%</span></span>
                      <span>{week.totalShifts}シフト</span>
                      <span>{formatHours(week.totalMs)}</span>
                    </div>
                  </div>
                  {week.employees.length > 0 ? (
                    <div className="space-y-1.5">
                      {week.employees.map((emp) => {
                        const maxMs = Math.max(...week.employees.map((e) => e.totalMs), 1);
                        const barWidth = Math.round((emp.totalMs / maxMs) * 100);
                        return (
                          <div key={emp.userId} className="flex items-center gap-3 text-sm">
                            <Link
                              href={`/admin/employees/${emp.userId}`}
                              className="w-24 truncate hover:text-primary flex-shrink-0"
                            >
                              {emp.userName}
                            </Link>
                            <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/40 rounded-full"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-muted w-20 text-right flex-shrink-0 font-mono">
                              {formatHours(emp.totalMs)}
                            </span>
                            <span className="text-xs text-text-muted w-12 text-right flex-shrink-0">
                              {emp.daysWorked}日
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-text-muted text-sm">データなし</p>
                  )}
                </Card>
              );
            })}
          </>
        )}

        {tab === "daily" && data && !loading && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="!p-4">
                <p className="text-xs text-text-muted">出勤率</p>
                <p className={`text-2xl font-bold ${attendanceRate >= 80 ? "text-success" : attendanceRate >= 50 ? "text-warning" : "text-danger"}`}>
                  {attendanceRate}%
                </p>
                <p className="text-[10px] text-text-muted">
                  {data.summary.uniqueWorkers}/{data.summary.totalEmployees}名
                </p>
              </Card>
              <Card className="!p-4">
                <p className="text-xs text-text-muted">シフト数</p>
                <p className="text-2xl font-bold">{data.summary.totalShifts}</p>
                <p className="text-[10px] text-text-muted">
                  完了: {data.summary.completedShifts}
                </p>
              </Card>
              <Card className="!p-4">
                <p className="text-xs text-text-muted">合計勤務時間</p>
                <p className="text-2xl font-bold">{formatHours(data.summary.totalWorkedMs)}</p>
                <p className="text-[10px] text-text-muted">
                  平均: {data.summary.uniqueWorkers > 0
                    ? formatHours(data.summary.totalWorkedMs / data.summary.uniqueWorkers)
                    : "—"}
                </p>
              </Card>
              <Card className="!p-4">
                <p className="text-xs text-text-muted">欠勤者</p>
                <p className={`text-2xl font-bold ${data.summary.absentees.length > 0 ? "text-warning" : "text-success"}`}>
                  {data.summary.absentees.length}名
                </p>
              </Card>
            </div>

            {/* Employee Details */}
            {data.employees.length > 0 && (
              <Card>
                <h2 className="font-semibold mb-3">従業員別実績</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-text-muted border-b border-white/10">
                        <th className="pb-2 font-medium">名前</th>
                        <th className="pb-2 font-medium">シフト</th>
                        <th className="pb-2 font-medium">勤務時間</th>
                        <th className="pb-2 font-medium">出勤</th>
                        <th className="pb-2 font-medium">退勤</th>
                        <th className="pb-2 font-medium">GPS</th>
                        <th className="pb-2 font-medium">録音</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.employees.map((emp) => (
                        <tr key={emp.userId}>
                          <td className="py-2.5">
                            <Link
                              href={`/admin/employees/${emp.userId}`}
                              className="hover:text-primary"
                            >
                              {emp.userName}
                            </Link>
                          </td>
                          <td className="py-2.5 text-text-muted">{emp.shifts}回</td>
                          <td className="py-2.5 font-mono">{formatHours(emp.totalMs)}</td>
                          <td className="py-2.5 text-text-muted font-mono">
                            {formatTime(emp.firstStart)}
                          </td>
                          <td className="py-2.5 text-text-muted font-mono">
                            {emp.lastEnd ? formatTime(emp.lastEnd) : "—"}
                          </td>
                          <td className="py-2.5 text-text-muted">{emp.gpsPoints}</td>
                          <td className="py-2.5 text-text-muted">{emp.recordings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Absentees */}
            {data.summary.absentees.length > 0 && (
              <Card>
                <h2 className="font-semibold mb-3 text-warning">欠勤者一覧</h2>
                <div className="flex flex-wrap gap-2">
                  {data.summary.absentees.map((a) => (
                    <Link
                      key={a.id}
                      href={`/admin/employees/${a.id}`}
                      className="px-3 py-1.5 text-sm bg-warning/10 text-warning rounded-lg hover:bg-warning/20"
                    >
                      {a.name}
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {data.employees.length === 0 && (
              <Card>
                <p className="text-text-muted text-sm text-center py-8">
                  この日のシフトデータはありません
                </p>
              </Card>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
