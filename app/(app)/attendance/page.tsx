"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShifts, getGuards, getSites, getAttendance, getShiftsByGuard, getAttendanceByGuard, clockIn, clockOut } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { Shift, Guard, Site, AttendanceRecord } from "@/lib/types";
import { ATTENDANCE_STATUS_LABELS } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function nowTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function AttendancePage() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <AdminAttendance />;
  }
  return <GuardAttendance guardId={user?.guardId} />;
}

function AdminAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards());
    setSites(getSites());
  }, []);

  useEffect(() => {
    if (mounted) {
      setAttendance(getAttendance().filter((a) => a.date === selectedDate));
    }
  }, [mounted, selectedDate]);

  if (!mounted) return null;

  const statusColors: Record<AttendanceRecord["status"], string> = {
    pending: "bg-sub-bg text-text-secondary",
    on_duty: "bg-success/10 text-success",
    completed: "bg-accent/10 text-accent",
    absent: "bg-danger/10 text-danger",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">勤怠管理</h1>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
      />

      <p className="text-sm text-text-secondary">{attendance.length}件の記録</p>

      {attendance.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-8">この日の勤怠記録はありません</p></Card>
      ) : (
        <div className="space-y-2">
          {attendance.map((record) => {
            const guard = guards.find((g) => g.id === record.guardId);
            const site = sites.find((s) => s.id === record.siteId);
            return (
              <Card key={record.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-text-primary">{guard?.name ?? "—"}</p>
                  <p className="text-sm text-text-secondary">{site?.name ?? "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono">
                    {record.clockIn ?? "--:--"} 〜 {record.clockOut ?? "--:--"}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[record.status]}`}>
                    {ATTENDANCE_STATUS_LABELS[record.status]}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GuardAttendance({ guardId }: { guardId?: string }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentTime, setCurrentTime] = useState(nowTimeStr());
  const [mounted, setMounted] = useState(false);

  const refreshData = useCallback(() => {
    if (!guardId) return;
    const today = todayStr();
    setShifts(getShiftsByGuard(guardId).filter((s) => s.date === today && s.status !== "cancelled"));
    setAttendance(getAttendanceByGuard(guardId).filter((a) => a.date === today));
    setSites(getSites());
  }, [guardId]);

  useEffect(() => {
    setMounted(true);
    refreshData();
    const timer = setInterval(() => setCurrentTime(nowTimeStr()), 10000);
    return () => clearInterval(timer);
  }, [refreshData]);

  if (!mounted || !guardId) return null;

  function handleClockIn(shiftId: string) {
    clockIn(shiftId);
    refreshData();
  }

  function handleClockOut(shiftId: string) {
    clockOut(shiftId);
    refreshData();
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-text-secondary text-sm">現在時刻</p>
        <p className="text-5xl font-bold font-mono text-accent mt-1">{currentTime}</p>
      </div>

      {shifts.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-8">本日のシフトはありません</p></Card>
      ) : (
        <div className="space-y-4">
          {shifts.map((shift) => {
            const site = sites.find((s) => s.id === shift.siteId);
            const att = attendance.find((a) => a.shiftId === shift.id);

            return (
              <Card key={shift.id} className="space-y-4">
                <div>
                  <p className="font-semibold text-text-primary text-lg">{site?.name ?? "—"}</p>
                  <p className="text-sm text-text-secondary">{site?.address}</p>
                  <p className="text-sm font-mono mt-2">{shift.startTime} 〜 {shift.endTime}</p>
                </div>

                {att?.status === "completed" ? (
                  <div className="text-center py-3 rounded-lg bg-success/10">
                    <p className="text-success font-medium">勤務完了</p>
                    <p className="text-sm text-text-secondary mt-1 font-mono">
                      {att.clockIn} 〜 {att.clockOut}
                    </p>
                  </div>
                ) : att?.status === "on_duty" ? (
                  <button
                    onClick={() => handleClockOut(shift.id)}
                    className="w-full py-4 rounded-xl bg-danger text-white font-bold text-lg hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    退勤する
                  </button>
                ) : (
                  <button
                    onClick={() => handleClockIn(shift.id)}
                    className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-dark transition-colors cursor-pointer"
                  >
                    出勤する
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
