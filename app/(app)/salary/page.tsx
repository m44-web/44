"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShiftsByGuard, getAttendanceByGuard, getGuard, getSites } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { Shift, AttendanceRecord, Guard, Site } from "@/lib/types";
import { SHIFT_TYPE_LABELS } from "@/lib/types";

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

  const dayRate = guard.hourlyRate ?? 1000;
  const nightRate = guard.nightHourlyRate ?? 1250;

  // Filter shifts for selected month
  const monthShifts = shifts.filter((s) => s.date.startsWith(selectedMonth) && s.status !== "cancelled");
  const completedShifts = monthShifts.filter((s) => s.status === "completed");
  const scheduledShifts = monthShifts.filter((s) => s.status !== "completed");

  const dayShifts = monthShifts.filter((s) => s.shiftType !== "night");
  const nightShifts = monthShifts.filter((s) => s.shiftType === "night");

  function calcHours(s: Shift): number {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    let hours = eh - sh + (em - sm) / 60;
    if (hours < 0) hours += 24; // overnight
    return hours;
  }

  function calcPay(s: Shift): number {
    const hours = calcHours(s);
    const rate = s.shiftType === "night" ? nightRate : dayRate;
    return Math.round(hours * rate);
  }

  const completedHours = completedShifts.reduce((sum, s) => sum + calcHours(s), 0);
  const scheduledHours = scheduledShifts.reduce((sum, s) => sum + calcHours(s), 0);
  const totalHours = completedHours + scheduledHours;

  const completedPay = completedShifts.reduce((sum, s) => sum + calcPay(s), 0);
  const estimatedPay = monthShifts.reduce((sum, s) => sum + calcPay(s), 0);

  // Generate month options
  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = -3; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">給与明細</h1>

      {/* Month selector */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="w-full rounded-xl border border-border bg-sub-bg px-4 py-4 text-lg font-medium text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors appearance-none cursor-pointer"
      >
        {monthOptions.map((m) => {
          const [y, mo] = m.split("-");
          return <option key={m} value={m}>{y}年{parseInt(mo)}月</option>;
        })}
      </select>

      {/* Big pay display */}
      <Card className="!border-accent/30 text-center !py-6">
        <p className="text-sm text-text-secondary">今月の給与（見込み）</p>
        <p className="text-4xl font-bold text-accent mt-2">¥{estimatedPay.toLocaleString()}</p>
        {completedPay !== estimatedPay && (
          <p className="text-sm text-text-secondary mt-2">
            確定分：<span className="font-bold text-success">¥{completedPay.toLocaleString()}</span>
          </p>
        )}
        <p className="text-[10px] text-text-secondary mt-2">※ 交通費・手当は含まれていません</p>
      </Card>

      {/* Rate info */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center !py-4">
          <p className="text-xs text-warning font-medium">日勤 時給</p>
          <p className="text-2xl font-bold text-text-primary mt-1">¥{dayRate.toLocaleString()}</p>
        </Card>
        <Card className="text-center !py-4">
          <p className="text-xs text-purple-400 font-medium">夜勤 時給</p>
          <p className="text-2xl font-bold text-text-primary mt-1">¥{nightRate.toLocaleString()}</p>
        </Card>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center !py-4">
          <p className="text-xs text-text-secondary">勤務日数</p>
          <p className="text-3xl font-bold text-text-primary mt-1">{monthShifts.length}<span className="text-base text-text-secondary ml-1">日</span></p>
        </Card>
        <Card className="text-center !py-4">
          <p className="text-xs text-text-secondary">合計時間</p>
          <p className="text-3xl font-bold text-text-primary mt-1">{totalHours.toFixed(1)}<span className="text-base text-text-secondary ml-1">h</span></p>
        </Card>
        <Card className="text-center !py-4">
          <p className="text-xs text-warning font-medium">日勤</p>
          <p className="text-2xl font-bold text-warning mt-1">{dayShifts.length}<span className="text-sm text-text-secondary ml-1">日</span></p>
        </Card>
        <Card className="text-center !py-4">
          <p className="text-xs text-purple-400 font-medium">夜勤</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{nightShifts.length}<span className="text-sm text-text-secondary ml-1">日</span></p>
        </Card>
      </div>

      {/* Shift breakdown */}
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">勤務一覧</h2>
        {monthShifts.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-6">この月のシフトはありません</p></Card>
        ) : (
          <div className="space-y-2">
            {monthShifts.sort((a, b) => a.date.localeCompare(b.date)).map((shift) => {
              const site = sites.find((s) => s.id === shift.siteId);
              const hours = calcHours(shift);
              const pay = calcPay(shift);
              const isNight = shift.shiftType === "night";
              return (
                <Card key={shift.id} className="flex items-center justify-between gap-3 !py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium text-text-primary">{shift.date}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isNight ? "bg-purple-500/10 text-purple-400" : "bg-warning/10 text-warning"
                      }`}>
                        {SHIFT_TYPE_LABELS[shift.shiftType ?? "day"]}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {shift.startTime}〜{shift.endTime}　{site?.name ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-text-primary">¥{pay.toLocaleString()}</p>
                    <p className="text-xs text-text-secondary">{hours.toFixed(1)}h × ¥{(isNight ? nightRate : dayRate).toLocaleString()}</p>
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
