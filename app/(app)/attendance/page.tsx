"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShifts, getGuards, getSites, getAttendance, getShiftsByGuard, getAttendanceByGuard, clockIn, clockOut, addLocation, getLocations } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { Shift, Guard, Site, AttendanceRecord, LocationLog } from "@/lib/types";
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
  const [locations, setLocations] = useState<LocationLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards());
    setSites(getSites());
    setShifts(getShifts());
    setAllAttendance(getAttendance());
    setLocations(getLocations());
  }, []);

  const { attendance, dateShifts, onDuty, completed, absent, notYetClocked, locationsByGuard } = useMemo(() => {
    const att = allAttendance.filter((a) => a.date === selectedDate);
    const ds = shifts.filter((s) => s.date === selectedDate && s.status !== "cancelled");
    const scheduledGuardIds = new Set(ds.map((s) => s.guardId));
    const attendedGuardIds = new Set(att.map((a) => a.guardId));
    const locMap = new Map<string, LocationLog[]>();
    for (const l of locations) {
      if (!l.timestamp.startsWith(selectedDate)) continue;
      if (!locMap.has(l.guardId)) locMap.set(l.guardId, []);
      locMap.get(l.guardId)!.push(l);
    }
    for (const arr of locMap.values()) arr.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return {
      attendance: att,
      dateShifts: ds,
      onDuty: att.filter((a) => a.status === "on_duty").length,
      completed: att.filter((a) => a.status === "completed").length,
      absent: att.filter((a) => a.status === "absent").length,
      notYetClocked: [...scheduledGuardIds].filter((id) => !attendedGuardIds.has(id)),
      locationsByGuard: locMap,
    };
  }, [allAttendance, shifts, locations, selectedDate]);

  if (!mounted) return null;

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
                {/* GPS location history */}
                {(() => {
                  const guardLocs = locationsByGuard.get(record.guardId);
                  if (!guardLocs || guardLocs.length === 0) return null;
                  const typeLabels: Record<string, string> = { clock_in: "上番", clock_out: "下番", manual: "手動", periodic: "定期" };
                  const typeColors: Record<string, string> = { clock_in: "text-success", clock_out: "text-danger", manual: "text-accent", periodic: "text-text-secondary" };
                  return (
                    <div className="pt-1.5 border-t border-border space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        <span className="font-medium">GPS履歴 ({guardLocs.length}件)</span>
                      </div>
                      {guardLocs.map((loc) => {
                        const time = new Date(loc.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                        return (
                          <div key={loc.id} className="flex items-center gap-2 text-[10px] pl-4">
                            <span className={`font-medium ${typeColors[loc.type] ?? "text-text-secondary"}`}>
                              {typeLabels[loc.type] ?? loc.type}
                            </span>
                            <span className="text-text-secondary font-mono">{time}</span>
                            {loc.speed != null && loc.speed >= 0 && (
                              <span className={`${loc.speed * 3.6 > 60 ? "text-danger" : loc.speed * 3.6 > 5 ? "text-warning" : "text-success"}`}>
                                {(loc.speed * 3.6).toFixed(0)}km/h
                              </span>
                            )}
                            <a href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-0.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                              地図
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
            speed: pos.coords.speed,
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
      <h1 className="text-2xl font-bold">出退勤</h1>

      {/* Big clock display */}
      <div className="text-center py-4">
        <p className="text-sm text-text-secondary">現在時刻</p>
        <p className="text-6xl font-bold font-mono text-accent mt-2">{currentTime}</p>
        <p className="text-sm text-text-secondary mt-2">{todayStr()}</p>
      </div>

      {shifts.length === 0 ? (
        <Card className="text-center !py-8">
          <p className="text-lg text-text-secondary">本日のシフトはありません</p>
          <p className="text-sm text-text-secondary mt-1">お休みです！ゆっくり休んでください</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {shifts.map((shift) => {
            const site = sites.find((s) => s.id === shift.siteId);
            const att = attendance.find((a) => a.shiftId === shift.id);
            const isNight = shift.shiftType === "night";

            return (
              <Card key={shift.id} className="space-y-4 !py-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      isNight ? "bg-purple-500/10 text-purple-400" : "bg-warning/10 text-warning"
                    }`}>
                      {isNight ? "夜勤" : "日勤"}
                    </span>
                  </div>
                  <p className="font-bold text-text-primary text-xl">{site?.name ?? "—"}</p>
                  <p className="text-sm text-text-secondary mt-1">{site?.address}</p>
                  <p className="text-2xl font-bold font-mono mt-3 text-text-primary">{shift.startTime} 〜 {shift.endTime}</p>
                </div>

                {att?.status === "completed" ? (
                  <div className="text-center py-5 rounded-xl bg-success/10 space-y-2">
                    <p className="text-success font-bold text-xl">お疲れ様でした！</p>
                    <p className="text-base text-text-secondary font-mono">
                      {att.clockIn} → {att.clockOut}
                    </p>
                    {att.clockIn && att.clockOut && (() => {
                      const [ih, im] = att.clockIn!.split(":").map(Number);
                      const [oh, om] = att.clockOut!.split(":").map(Number);
                      let h = oh - ih + (om - im) / 60;
                      if (h < 0) h += 24;
                      return <p className="text-sm text-text-secondary">{h.toFixed(1)}時間 勤務完了</p>;
                    })()}
                  </div>
                ) : att?.status === "on_duty" ? (
                  <div className="space-y-3">
                    <div className="text-center py-3 rounded-xl bg-success/10">
                      <p className="text-success font-medium text-base">出勤済み：{att.clockIn}</p>
                    </div>
                    <button
                      onClick={() => handleClockOut(shift.id)}
                      className="w-full py-6 rounded-2xl bg-danger text-white font-bold text-xl hover:bg-red-600 transition-all cursor-pointer active:scale-[0.97]"
                    >
                      退勤する（下番報告）
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleClockIn(shift.id)}
                    className="w-full py-6 rounded-2xl bg-accent text-white font-bold text-xl hover:bg-accent-dark transition-all cursor-pointer active:scale-[0.97]"
                  >
                    出勤する（上番報告）
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
          <h2 className="text-base font-bold text-text-primary mb-3">最近の記録</h2>
          <div className="space-y-2">
            {allAttendance.map((att) => {
              const site = sites.find((s) => s.id === att.siteId);
              return (
                <Card key={att.id} className="flex items-center justify-between gap-3 !py-4">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-text-primary">{att.date}</p>
                    <p className="text-sm text-text-secondary">{site?.name ?? "—"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono text-text-secondary">{att.clockIn ?? "--:--"} 〜 {att.clockOut ?? "--:--"}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      att.status === "completed" ? "bg-success/10 text-success" :
                      att.status === "on_duty" ? "bg-accent/10 text-accent" : "bg-sub-bg text-text-secondary"
                    }`}>
                      {att.status === "completed" ? "完了" : att.status === "on_duty" ? "勤務中" : "未出勤"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-text-secondary text-center">出退勤時にGPS位置情報が自動送信されます</p>
    </div>
  );
}
