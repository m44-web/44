"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShifts, getGuards, getSites, getAttendance, getShiftsByGuard, getAttendanceByGuard, clockIn, clockOut, addLocation } from "@/lib/store";
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
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards());
    setSites(getSites());
    setShifts(getShifts());
    setAllAttendance(getAttendance());
  }, []);

  if (!mounted) return null;

  const attendance = allAttendance.filter((a) => a.date === selectedDate);
  const dateShifts = shifts.filter((s) => s.date === selectedDate && s.status !== "cancelled");
  const onDuty = attendance.filter((a) => a.status === "on_duty").length;
  const completed = attendance.filter((a) => a.status === "completed").length;
  const absent = attendance.filter((a) => a.status === "absent").length;

  // Guards scheduled but no attendance record
  const scheduledGuardIds = new Set(dateShifts.map((s) => s.guardId));
  const attendedGuardIds = new Set(attendance.map((a) => a.guardId));
  const notYetClocked = [...scheduledGuardIds].filter((id) => !attendedGuardIds.has(id));

  const statusColors: Record<AttendanceRecord["status"], string> = {
    pending: "bg-sub-bg text-text-secondary",
    on_duty: "bg-success/10 text-success",
    completed: "bg-accent/10 text-accent",
    absent: "bg-danger/10 text-danger",
  };

  function calcWorkedHours(att: AttendanceRecord): string {
    if (!att.clockIn || !att.clockOut) return "—";
    const [ih, im] = att.clockIn.split(":").map(Number);
    const [oh, om] = att.clockOut.split(":").map(Number);
    let hours = oh - ih + (om - im) / 60;
    if (hours < 0) hours += 24;
    return hours.toFixed(1) + "h";
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">勤怠管理</h1>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">シフト数</p>
          <p className="text-lg font-bold text-text-primary">{dateShifts.length}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">勤務中</p>
          <p className="text-lg font-bold text-success">{onDuty}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">完了</p>
          <p className="text-lg font-bold text-accent">{completed}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">未出勤</p>
          <p className="text-lg font-bold text-warning">{notYetClocked.length}</p>
        </Card>
      </div>

      {/* Not yet clocked in */}
      {notYetClocked.length > 0 && selectedDate === todayStr() && (
        <Card className="!border-warning/30 !bg-warning/5 !py-3">
          <p className="text-sm font-medium text-warning mb-1">未出勤の警備員</p>
          <div className="flex flex-wrap gap-1.5">
            {notYetClocked.map((gId) => {
              const g = guards.find((gg) => gg.id === gId);
              const s = dateShifts.find((ss) => ss.guardId === gId);
              return (
                <span key={gId} className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning">
                  {g?.name ?? "—"} {s?.startTime}〜
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* Attendance records */}
      <p className="text-sm text-text-secondary">{attendance.length}件の記録</p>

      {attendance.length === 0 && dateShifts.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-6 text-sm">この日の勤怠記録はありません</p></Card>
      ) : (
        <div className="space-y-2">
          {attendance.map((record) => {
            const guard = guards.find((g) => g.id === record.guardId);
            const site = sites.find((s) => s.id === record.siteId);
            const shift = shifts.find((s) => s.id === record.shiftId);
            return (
              <Card key={record.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      record.status === "on_duty" ? "bg-success animate-pulse" :
                      record.status === "completed" ? "bg-accent" :
                      record.status === "absent" ? "bg-danger" : "bg-sub-bg"
                    }`} />
                    <p className="font-medium text-text-primary truncate">{guard?.name ?? "—"}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${statusColors[record.status]}`}>
                      {ATTENDANCE_STATUS_LABELS[record.status]}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-text-secondary shrink-0">
                    {record.clockIn ?? "--:--"} 〜 {record.clockOut ?? "--:--"}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{site?.name ?? "—"}</span>
                  <div className="flex items-center gap-2">
                    {shift && <span>予定 {shift.startTime}〜{shift.endTime}</span>}
                    <span>{calcWorkedHours(record)}</span>
                  </div>
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

  function sendLocationOnClock(type: "clock_in" | "clock_out") {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          addLocation({
            guardId: guardId!,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString(),
            type,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }

  function handleClockIn(shiftId: string) {
    clockIn(shiftId);
    sendLocationOnClock("clock_in");
    refreshData();
  }

  function handleClockOut(shiftId: string) {
    clockOut(shiftId);
    sendLocationOnClock("clock_out");
    refreshData();
  }

  // Past attendance
  const allAttendance = getAttendanceByGuard(guardId).filter((a) => a.date !== todayStr()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-text-secondary text-sm">現在時刻</p>
        <p className="text-5xl font-bold font-mono text-accent mt-1">{currentTime}</p>
        <p className="text-xs text-text-secondary mt-1">{todayStr()}</p>
      </div>

      {shifts.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-8 text-sm">本日のシフトはありません</p></Card>
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
                  <div className="text-center py-4 rounded-lg bg-success/10 space-y-1">
                    <p className="text-success font-medium text-lg">勤務完了</p>
                    <p className="text-sm text-text-secondary font-mono">
                      出勤 {att.clockIn} → 退勤 {att.clockOut}
                    </p>
                    {att.clockIn && att.clockOut && (() => {
                      const [ih, im] = att.clockIn!.split(":").map(Number);
                      const [oh, om] = att.clockOut!.split(":").map(Number);
                      let h = oh - ih + (om - im) / 60;
                      if (h < 0) h += 24;
                      return <p className="text-xs text-text-secondary">勤務時間: {h.toFixed(1)}時間</p>;
                    })()}
                  </div>
                ) : att?.status === "on_duty" ? (
                  <div className="space-y-2">
                    <div className="text-center py-2 rounded-lg bg-success/10">
                      <p className="text-success text-sm">出勤済み: {att.clockIn}</p>
                    </div>
                    <button
                      onClick={() => handleClockOut(shift.id)}
                      className="w-full py-4 rounded-xl bg-danger text-white font-bold text-lg hover:bg-red-600 transition-colors cursor-pointer active:scale-95"
                    >
                      退勤する
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleClockIn(shift.id)}
                    className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-dark transition-colors cursor-pointer active:scale-95"
                  >
                    出勤する
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent history */}
      {allAttendance.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-2">最近の勤怠履歴</h2>
          <div className="space-y-1.5">
            {allAttendance.map((att) => {
              const site = sites.find((s) => s.id === att.siteId);
              return (
                <Card key={att.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{att.date}</p>
                    <p className="text-xs text-text-secondary">{site?.name ?? "—"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-text-secondary">{att.clockIn ?? "--:--"} 〜 {att.clockOut ?? "--:--"}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      att.status === "completed" ? "bg-success/10 text-success" :
                      att.status === "on_duty" ? "bg-accent/10 text-accent" : "bg-sub-bg text-text-secondary"
                    }`}>
                      {ATTENDANCE_STATUS_LABELS[att.status]}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[11px] text-text-secondary text-center">出退勤時に自動的にGPS位置情報が送信されます</p>
    </div>
  );
}
