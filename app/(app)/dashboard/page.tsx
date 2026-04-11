"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getGuards, getSites, getShifts, getAttendance, getShiftsByGuard, getAttendanceByGuard,
  getEquipment, getLending, getReports, getShiftRequests, getLatestLocations,
} from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { Guard, Site, Shift, AttendanceRecord, EquipmentLending, DailyReport, ShiftRequest, LocationLog } from "@/lib/types";
import { ATTENDANCE_STATUS_LABELS, SHIFT_STATUS_LABELS } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<{
    guards: Guard[]; sites: Site[]; shifts: Shift[]; todayShifts: Shift[];
    todayAttendance: AttendanceRecord[]; allAttendance: AttendanceRecord[];
    lending: EquipmentLending[]; reports: DailyReport[]; shiftRequests: ShiftRequest[];
    locations: LocationLog[];
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const today = todayStr();
    const allShifts = getShifts();
    setData({
      guards: getGuards(),
      sites: getSites(),
      shifts: allShifts,
      todayShifts: allShifts.filter((s) => s.date === today && s.status !== "cancelled"),
      todayAttendance: getAttendance().filter((a) => a.date === today),
      allAttendance: getAttendance(),
      lending: getLending().filter((l) => !l.returnDate),
      reports: getReports(),
      shiftRequests: getShiftRequests(),
      locations: getLatestLocations(),
    });
  }, [user]);

  if (!mounted || !data) return null;

  if (user?.role === "admin") {
    return <AdminDashboard data={data} />;
  }
  return <GuardDashboard guardId={user?.guardId ?? ""} data={data} />;
}

function AdminDashboard({ data }: { data: {
  guards: Guard[]; sites: Site[]; shifts: Shift[]; todayShifts: Shift[];
  todayAttendance: AttendanceRecord[]; allAttendance: AttendanceRecord[];
  lending: EquipmentLending[]; reports: DailyReport[]; shiftRequests: ShiftRequest[];
  locations: LocationLog[];
}}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const { guards, sites, shifts, todayShifts, todayAttendance, lending, reports, shiftRequests, locations } = data;
  const today = todayStr();
  const thisMonth = today.slice(0, 7);

  const activeGuards = guards.filter((g) => g.status === "active");
  const activeSites = sites.filter((s) => s.status === "active");
  const onDuty = todayAttendance.filter((a) => a.status === "on_duty").length;
  const completedToday = todayAttendance.filter((a) => a.status === "completed").length;
  const pendingRequests = shiftRequests.filter((r) => r.status === "pending").length;
  const todayReports = reports.filter((r) => r.date === today).length;

  // This month stats
  const thisMonthShifts = shifts.filter((s) => s.date.startsWith(thisMonth) && s.status !== "cancelled");
  const completedMonthShifts = thisMonthShifts.filter((s) => s.status === "completed");

  // Week shifts with navigation
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + weekOffset * 7);
    weekDates.push(d.toISOString().split("T")[0]);
  }
  const weekShifts = shifts.filter((s) => weekDates.includes(s.date) && s.status !== "cancelled");
  const weekLabel = weekOffset === 0 ? "今週" : weekOffset === 1 ? "来週" : weekOffset === -1 ? "先週" : `${weekOffset > 0 ? "+" : ""}${weekOffset}週`;

  // Guards without location
  const guardsWithTodayShift = new Set(todayShifts.map((s) => s.guardId));
  const guardsWithLocation = new Set(locations.filter((l) => {
    const hoursAgo = (Date.now() - new Date(l.timestamp).getTime()) / (1000 * 60 * 60);
    return hoursAgo < 12;
  }).map((l) => l.guardId));
  const missingLocationCount = [...guardsWithTodayShift].filter((id) => !guardsWithLocation.has(id)).length;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {/* Alert banners */}
      {pendingRequests > 0 && (
        <Link href="/shift-requests">
          <Card className="!border-warning/30 !bg-warning/5 !py-3 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning shrink-0"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            <p className="text-sm text-warning">未処理のシフト希望が <span className="font-bold">{pendingRequests}件</span> あります</p>
          </Card>
        </Link>
      )}
      {missingLocationCount > 0 && (
        <Link href="/locations">
          <Card className="!border-danger/30 !bg-danger/5 !py-3 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            <p className="text-sm text-danger">位置未送信の警備員が <span className="font-bold">{missingLocationCount}名</span> います</p>
          </Card>
        </Link>
      )}

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/guards">
          <Card className="text-center hover:border-accent/30">
            <p className="text-3xl font-bold text-accent">{activeGuards.length}<span className="text-lg ml-0.5">名</span></p>
            <p className="text-text-secondary text-xs mt-1">稼働警備員</p>
            <p className="text-[10px] text-text-secondary/60 mt-0.5">全{guards.length}名中</p>
          </Card>
        </Link>
        <Link href="/sites">
          <Card className="text-center hover:border-accent/30">
            <p className="text-3xl font-bold text-success">{activeSites.length}<span className="text-lg ml-0.5">件</span></p>
            <p className="text-text-secondary text-xs mt-1">稼働現場</p>
            <p className="text-[10px] text-text-secondary/60 mt-0.5">全{sites.length}件中</p>
          </Card>
        </Link>
        <Link href="/shifts">
          <Card className="text-center hover:border-accent/30">
            <p className="text-3xl font-bold text-warning">{todayShifts.length}<span className="text-lg ml-0.5">件</span></p>
            <p className="text-text-secondary text-xs mt-1">本日のシフト</p>
            <p className="text-[10px] text-text-secondary/60 mt-0.5">今月 {thisMonthShifts.length}件</p>
          </Card>
        </Link>
        <Link href="/attendance">
          <Card className="text-center hover:border-accent/30">
            <p className="text-3xl font-bold text-accent">{onDuty}<span className="text-lg ml-0.5">名</span></p>
            <p className="text-text-secondary text-xs mt-1">勤務中</p>
            <p className="text-[10px] text-text-secondary/60 mt-0.5">完了 {completedToday}名</p>
          </Card>
        </Link>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/reports">
          <Card className="text-center !py-2.5 hover:border-accent/30">
            <p className="text-lg font-bold text-text-primary">{todayReports}</p>
            <p className="text-[10px] text-text-secondary">本日の日報</p>
          </Card>
        </Link>
        <Link href="/equipment">
          <Card className="text-center !py-2.5 hover:border-accent/30">
            <p className="text-lg font-bold text-text-primary">{lending.length}</p>
            <p className="text-[10px] text-text-secondary">貸出中装備</p>
          </Card>
        </Link>
        <Link href="/shift-requests">
          <Card className="text-center !py-2.5 hover:border-accent/30">
            <p className="text-lg font-bold text-warning">{pendingRequests}</p>
            <p className="text-[10px] text-text-secondary">未処理希望</p>
          </Card>
        </Link>
      </div>

      {/* Week overview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-text-secondary">{weekLabel}のシフト概要</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 rounded-lg hover:bg-sub-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="px-2 py-1 text-xs rounded-lg hover:bg-sub-bg text-accent cursor-pointer">今週</button>
            )}
            <button onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 rounded-lg hover:bg-sub-bg text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
        <Card>
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date) => {
              const d = new Date(date + "T00:00:00");
              const dayIdx = d.getDay();
              const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
              const count = weekShifts.filter((s) => s.date === date).length;
              const isToday = date === today;
              return (
                <div key={date} className={`text-center py-2 rounded-lg ${isToday ? "bg-accent/10" : ""}`}>
                  <p className={`text-[10px] ${dayIdx === 0 ? "text-danger" : dayIdx === 6 ? "text-accent" : "text-text-secondary"}`}>
                    {dayLabels[dayIdx]}
                  </p>
                  <p className={`text-xs ${isToday ? "font-bold text-accent" : "text-text-primary"}`}>{d.getDate()}</p>
                  <p className={`text-sm font-bold mt-0.5 ${count > 0 ? "text-text-primary" : "text-text-secondary/30"}`}>{count}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Today's shifts detail */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-text-secondary">本日のシフト詳細</h2>
          <Link href="/shifts" className="text-xs text-accent hover:underline">すべて見る</Link>
        </div>
        {todayShifts.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">本日のシフトはありません</p></Card>
        ) : (
          <div className="space-y-1.5">
            {todayShifts.map((shift) => {
              const guard = guards.find((g) => g.id === shift.guardId);
              const site = sites.find((s) => s.id === shift.siteId);
              const att = todayAttendance.find((a) => a.shiftId === shift.id);
              const loc = data.locations.find((l) => l.guardId === shift.guardId);
              const hasRecentLoc = loc && (Date.now() - new Date(loc.timestamp).getTime()) < 12 * 60 * 60 * 1000;
              return (
                <Card key={shift.id} className="!py-3">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        att?.status === "on_duty" ? "bg-success animate-pulse" :
                        att?.status === "completed" ? "bg-accent" :
                        "bg-warning"
                      }`} />
                      <p className="font-medium text-text-primary truncate">{guard?.name ?? "—"}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        att?.status === "on_duty" ? "bg-success/10 text-success" :
                        att?.status === "completed" ? "bg-accent/10 text-accent" :
                        "bg-sub-bg text-text-secondary"
                      }`}>
                        {att ? ATTENDANCE_STATUS_LABELS[att.status] : SHIFT_STATUS_LABELS[shift.status]}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-text-secondary shrink-0">{shift.startTime}〜{shift.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
                    <span>{site?.name ?? "—"}</span>
                    <div className="flex items-center gap-2">
                      {att?.clockIn && <span>出勤 {att.clockIn}</span>}
                      {att?.clockOut && <span>退勤 {att.clockOut}</span>}
                      <span className={`flex items-center gap-0.5 ${hasRecentLoc ? "text-success" : "text-danger"}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {hasRecentLoc ? "GPS" : "未送信"}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function GuardDashboard({ guardId, data }: { guardId: string; data: {
  guards: Guard[]; sites: Site[]; shifts: Shift[]; todayShifts: Shift[];
  todayAttendance: AttendanceRecord[]; allAttendance: AttendanceRecord[];
  reports: DailyReport[]; shiftRequests: ShiftRequest[];
}}) {
  const { sites, todayAttendance, shiftRequests } = data;
  const today = todayStr();
  const thisMonth = today.slice(0, 7);
  const guard = data.guards.find((g) => g.id === guardId);

  const myTodayShifts = data.todayShifts.filter((s) => s.guardId === guardId);
  const myShifts = data.shifts.filter((s) => s.guardId === guardId);
  const myThisMonthShifts = myShifts.filter((s) => s.date.startsWith(thisMonth) && s.status !== "cancelled");
  const myUpcoming = myShifts.filter((s) => s.date > today && s.status !== "cancelled").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  function calcHours(s: Shift): number {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    let hours = eh - sh + (em - sm) / 60;
    if (hours < 0) hours += 24;
    return hours;
  }

  const monthlyHours = myThisMonthShifts.reduce((sum, s) => sum + calcHours(s), 0);
  const monthlyPay = Math.round(monthlyHours * (guard?.hourlyRate ?? 1000));

  // Next week shift request check
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  const nextWeekStart = nextMonday.toISOString().split("T")[0];
  const hasNextWeekRequest = shiftRequests.some(
    (r) => r.guardId === guardId && r.date >= nextWeekStart
  );

  const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="space-y-5">
      {/* Big greeting with encouraging message */}
      <div className="text-center py-2">
        <p className="text-lg text-text-secondary">お疲れ様です</p>
        <h1 className="text-3xl font-bold mt-1">{guard?.name ?? ""}さん</h1>
        <p className="text-sm text-accent mt-2">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 6) return "深夜の勤務、本当にありがとうございます！";
            if (hour < 10) return "今日も一日、安全第一で頑張りましょう！";
            if (hour < 14) return "午前中の勤務お疲れ様です。この調子で！";
            if (hour < 18) return "午後も引き続き、頼りにしています！";
            return "夜間の警備、いつもありがとうございます！";
          })()}
        </p>
      </div>

      {/* Alert - big and obvious */}
      {!hasNextWeekRequest && (
        <Link href="/shift-requests">
          <div className="bg-warning/10 border-2 border-warning/40 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </div>
            <div>
              <p className="text-base font-bold text-warning">来週のシフト希望</p>
              <p className="text-sm text-text-secondary">まだ提出されていません。タップして提出！</p>
            </div>
          </div>
        </Link>
      )}

      {/* Today's shift - BIG and clear */}
      <div>
        <h2 className="text-xl font-bold mb-3">本日の勤務</h2>
        {myTodayShifts.length === 0 ? (
          <div className="bg-card-bg border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-sub-bg flex items-center justify-center mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <p className="text-lg text-text-secondary">本日は休日です</p>
            <p className="text-sm text-text-secondary/60 mt-1">しっかり休んで、次の勤務に備えましょう！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTodayShifts.map((shift) => {
              const site = sites.find((s) => s.id === shift.siteId);
              const att = todayAttendance.find((a) => a.shiftId === shift.id);
              const isNight = shift.shiftType === "night";
              return (
                <div key={shift.id} className={`bg-card-bg border-2 rounded-2xl p-5 ${
                  att?.status === "on_duty" ? "border-success/40" :
                  att?.status === "completed" ? "border-accent/40" :
                  "border-border"
                }`}>
                  {/* Status indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      att?.status === "on_duty" ? "bg-success/10 text-success" :
                      att?.status === "completed" ? "bg-accent/10 text-accent" :
                      "bg-warning/10 text-warning"
                    }`}>
                      {att?.status === "on_duty" ? "勤務中" :
                       att?.status === "completed" ? "勤務完了！お疲れ様です" :
                       "未出勤"}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isNight ? "bg-purple-500/10 text-purple-400" : "bg-warning/10 text-warning"
                    }`}>
                      {isNight ? "夜勤" : "日勤"}
                    </span>
                  </div>

                  {/* Site name - BIG */}
                  <p className="text-xl font-bold text-text-primary">{site?.name ?? "—"}</p>
                  <p className="text-sm text-text-secondary mt-1">{site?.address}</p>

                  {/* Time - BIG */}
                  <div className="mt-3 bg-sub-bg rounded-xl p-3 text-center">
                    <p className="text-3xl font-bold font-mono text-text-primary">
                      {shift.startTime} 〜 {shift.endTime}
                    </p>
                    {att?.clockIn && (
                      <p className="text-sm text-success mt-1">出勤 {att.clockIn} {att.clockOut && `→ 退勤 ${att.clockOut}`}</p>
                    )}
                  </div>

                  {/* Action button - HUGE */}
                  {att?.status !== "completed" && (
                    <Link
                      href="/attendance"
                      className={`mt-4 block text-center text-white rounded-xl py-5 text-xl font-bold active:scale-[0.97] transition-transform ${
                        att?.status === "on_duty" ? "bg-danger" : "bg-accent"
                      }`}
                    >
                      {att?.status === "on_duty" ? "退勤する" : "出勤する"}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly summary - simple */}
      <Link href="/salary">
        <div className="bg-card-bg border border-border rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
          <div>
            <p className="text-sm text-text-secondary">今月の見込み給与</p>
            <p className="text-2xl font-bold text-success">¥{monthlyPay.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">{myThisMonthShifts.length}件 / {monthlyHours.toFixed(1)}h</p>
            <p className="text-xs text-accent mt-0.5">くわしく見る →</p>
          </div>
        </div>
      </Link>

      {/* Previous day confirmation */}
      {(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split("T")[0];
        const yShifts = myShifts.filter((s) => s.date === yStr && s.status !== "cancelled");
        const yAtt = data.allAttendance.filter((a) => a.guardId === guardId && a.date === yStr);
        if (yShifts.length === 0) return null;
        const allCompleted = yShifts.every((s) => yAtt.some((a) => a.shiftId === s.id && a.status === "completed"));
        if (allCompleted) {
          return (
            <div className="bg-success/5 border border-success/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-success">昨日の勤務完了</p>
                  <p className="text-xs text-text-secondary">{yStr} — {yShifts.length}件のシフトすべて完了しました</p>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-warning">昨日の勤務確認</p>
                <p className="text-xs text-text-secondary">{yStr} — 未完了のシフトがあります。管制に連絡してください</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Upcoming shifts */}
      {myUpcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">次のシフト</h2>
          <div className="space-y-2">
            {myUpcoming.map((shift) => {
              const site = sites.find((s) => s.id === shift.siteId);
              const d = new Date(shift.date + "T00:00:00");
              const isNight = shift.shiftType === "night";
              return (
                <div key={shift.id} className="bg-card-bg border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="text-center shrink-0 w-12">
                    <p className={`text-xs ${d.getDay() === 0 ? "text-danger" : d.getDay() === 6 ? "text-accent" : "text-text-secondary"}`}>
                      {dayLabels[d.getDay()]}
                    </p>
                    <p className="text-2xl font-bold text-text-primary">{d.getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary truncate">{site?.name ?? "—"}</p>
                    <p className="text-sm text-text-secondary">{shift.startTime}〜{shift.endTime}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    isNight ? "bg-purple-500/10 text-purple-400" : "bg-warning/10 text-warning"
                  }`}>
                    {isNight ? "夜勤" : "日勤"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Big action buttons */}
      <div className="space-y-2">
        <Link href="/reports" className="block bg-card-bg border border-border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
          <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary">日報を書く</p>
            <p className="text-xs text-text-secondary">本日の報告を提出</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>

        <Link href="/shift-requests" className="block bg-card-bg border border-border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
          <div className="w-11 h-11 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M9 16l2 2 4-4" /></svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary">シフト希望</p>
            <p className="text-xs text-text-secondary">来週の希望を出す</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>

        <Link href="/locations" className="block bg-card-bg border border-border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
          <div className="w-11 h-11 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary">現在地を送信</p>
            <p className="text-xs text-text-secondary">GPS位置情報を管制に送信</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>
      </div>
    </div>
  );
}
