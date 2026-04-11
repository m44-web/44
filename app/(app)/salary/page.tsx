"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShiftsByGuard, getAttendanceByGuard, getGuard, getSites } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { Shift, AttendanceRecord, Guard, Site } from "@/lib/types";

export default function SalaryPage() {
  const { user } = useAuth();
  const guardId = user?.guardId ?? "";
  const [guard, setGuard] = useState<Guard | undefined>();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuard(getGuard(guardId));
    setShifts(getShiftsByGuard(guardId));
    setAttendance(getAttendanceByGuard(guardId));
    setSites(getSites());
  }, [guardId]);

  if (!mounted) return null;
  if (!guard) {
    return <p className="text-text-secondary py-8 text-center">警備員情報が見つかりません</p>;
  }

  const hourlyRate = guard.hourlyRate ?? 1000;

  // Filter shifts for selected month
  const monthShifts = shifts.filter((s) => s.date.startsWith(selectedMonth) && s.status !== "cancelled");
  const completedShifts = monthShifts.filter((s) => s.status === "completed");
  const scheduledShifts = monthShifts.filter((s) => s.status !== "completed");

  function calcHours(s: Shift): number {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    let hours = eh - sh + (em - sm) / 60;
    if (hours < 0) hours += 24; // overnight
    return hours;
  }

  const completedHours = completedShifts.reduce((sum, s) => sum + calcHours(s), 0);
  const scheduledHours = scheduledShifts.reduce((sum, s) => sum + calcHours(s), 0);
  const totalHours = completedHours + scheduledHours;

  const completedPay = Math.round(completedHours * hourlyRate);
  const estimatedPay = Math.round(totalHours * hourlyRate);

  // Generate month options
  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = -3; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">給与明細</h1>

      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors appearance-none cursor-pointer"
      >
        {monthOptions.map((m) => {
          const [y, mo] = m.split("-");
          return <option key={m} value={m}>{y}年{parseInt(mo)}月</option>;
        })}
      </select>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-text-secondary">時給</p>
          <p className="text-xl font-bold text-accent">¥{hourlyRate.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs text-text-secondary">勤務日数</p>
          <p className="text-xl font-bold text-text-primary">{monthShifts.length}<span className="text-sm text-text-secondary ml-1">日</span></p>
        </Card>
        <Card>
          <p className="text-xs text-text-secondary">確定勤務時間</p>
          <p className="text-xl font-bold text-success">{completedHours.toFixed(1)}<span className="text-sm text-text-secondary ml-1">h</span></p>
        </Card>
        <Card>
          <p className="text-xs text-text-secondary">予定含む合計</p>
          <p className="text-xl font-bold text-text-primary">{totalHours.toFixed(1)}<span className="text-sm text-text-secondary ml-1">h</span></p>
        </Card>
      </div>

      {/* Pay summary */}
      <Card className="!border-accent/30">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">確定給与</span>
            <span className="text-lg font-bold text-success">¥{completedPay.toLocaleString()}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">見込み給与（予定含む）</span>
            <span className="text-lg font-bold text-accent">¥{estimatedPay.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-text-secondary">※ 交通費・手当は含まれていません。実際の支給額とは異なる場合があります。</p>
        </div>
      </Card>

      {/* Shift breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">勤務内訳</h2>
        {monthShifts.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">この月のシフトはありません</p></Card>
        ) : (
          <div className="space-y-1.5">
            {monthShifts.sort((a, b) => a.date.localeCompare(b.date)).map((shift) => {
              const site = sites.find((s) => s.id === shift.siteId);
              const hours = calcHours(shift);
              const pay = Math.round(hours * hourlyRate);
              return (
                <Card key={shift.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{shift.date}</p>
                    <p className="text-xs text-text-secondary">
                      {shift.startTime}〜{shift.endTime} / {site?.name ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text-primary">¥{pay.toLocaleString()}</p>
                    <p className="text-[10px] text-text-secondary">{hours.toFixed(1)}h</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      shift.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {shift.status === "completed" ? "確定" : "予定"}
                    </span>
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
