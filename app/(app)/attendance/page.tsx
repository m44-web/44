"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShifts, getGuards, getSites, getAttendance, getShiftsByGuard, getAttendanceByGuard, clockIn, clockOut, addLocation, getLocations, updateAttendance } from "@/lib/store";
import { useToast } from "@/lib/toast";
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
  const [guardSearch, setGuardSearch] = useState("");
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards());
    setSites(getSites());
    setShifts(getShifts());
    setAllAttendance(getAttendance());
    setLocations(getLocations());
  }, []);

  const { attendance, dateShifts, onDuty, completed, absent, notYetClocked, locationsByGuard } = useMemo(() => {
    const allAtt = allAttendance.filter((a) => a.date === selectedDate);
    const ds = shifts.filter((s) => s.date === selectedDate && s.status !== "cancelled");
    const scheduledGuardIds = new Set(ds.map((s) => s.guardId));
    const attendedGuardIds = new Set(allAtt.map((a) => a.guardId));
    const locMap = new Map<string, LocationLog[]>();
    for (const l of locations) {
      if (!l.timestamp.startsWith(selectedDate)) continue;
      if (!locMap.has(l.guardId)) locMap.set(l.guardId, []);
      locMap.get(l.guardId)!.push(l);
    }
    for (const arr of locMap.values()) arr.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    // Apply guard search filter to visible rows (but not to status counters — those should reflect reality)
    const term = guardSearch.trim();
    const filteredAtt = term
      ? allAtt.filter((a) => {
          const g = guards.find((gg) => gg.id === a.guardId);
          return g && (g.name.includes(term) || g.nameKana.includes(term));
        })
      : allAtt;
    return {
      attendance: filteredAtt,
      dateShifts: ds,
      onDuty: allAtt.filter((a) => a.status === "on_duty").length,
      completed: allAtt.filter((a) => a.status === "completed").length,
      absent: allAtt.filter((a) => a.status === "absent").length,
      notYetClocked: [...scheduledGuardIds].filter((id) => !attendedGuardIds.has(id)),
      locationsByGuard: locMap,
    };
  }, [allAttendance, shifts, locations, selectedDate, guardSearch, guards]);

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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">勤怠管理</h1>
        <button
          onClick={() => window.print()}
          className="text-sm px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors no-print inline-flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
          印刷
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
        />
        <input
          type="text"
          placeholder="警備員名で検索..."
          value={guardSearch}
          onChange={(e) => setGuardSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

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
                    {(() => {
                      if (!shift || !record.clockIn) return null;
                      const [sh, sm] = shift.startTime.split(":").map(Number);
                      const [ih, im] = record.clockIn.split(":").map(Number);
                      const diffMin = (ih * 60 + im) - (sh * 60 + sm);
                      if (diffMin >= 10) return <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 bg-danger/10 text-danger">遅刻 {diffMin}分</span>;
                      if (diffMin <= -15) return <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 bg-success/10 text-success">早め {Math.abs(diffMin)}分</span>;
                      return null;
                    })()}
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
                    <button
                      onClick={() => setEditing(record)}
                      className="text-accent hover:underline cursor-pointer no-print"
                    >
                      修正
                    </button>
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

      {editing && (
        <AttendanceEditModal
          record={editing}
          onClose={() => setEditing(null)}
          onSave={(updates) => {
            updateAttendance(editing.id, updates);
            setAllAttendance(getAttendance());
            setEditing(null);
            showToast("勤怠記録を更新しました", "success");
          }}
        />
      )}
    </div>
  );
}

function AttendanceEditModal({
  record, onClose, onSave,
}: {
  record: AttendanceRecord;
  onClose: () => void;
  onSave: (updates: Partial<AttendanceRecord>) => void;
}) {
  const [clockInTime, setClockInTime] = useState(record.clockIn ?? "");
  const [clockOutTime, setClockOutTime] = useState(record.clockOut ?? "");
  const [status, setStatus] = useState<AttendanceRecord["status"]>(record.status);
  const [notes, setNotes] = useState(record.notes ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave() {
    onSave({
      clockIn: clockInTime || null,
      clockOut: clockOutTime || null,
      status,
      notes: notes.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card-bg border border-border rounded-t-xl sm:rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold">勤怠記録を修正</h2>
        <p className="text-xs text-text-secondary">{record.date}</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">出勤時刻</label>
            <input
              type="time"
              value={clockInTime}
              onChange={(e) => setClockInTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-sub-bg px-3 py-2 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1">退勤時刻</label>
            <input
              type="time"
              value={clockOutTime}
              onChange={(e) => setClockOutTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-sub-bg px-3 py-2 text-text-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">ステータス</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceRecord["status"])}
            className="w-full rounded-lg border border-border bg-sub-bg px-3 py-2 text-text-primary appearance-none cursor-pointer"
          >
            <option value="pending">未出勤</option>
            <option value="on_duty">勤務中</option>
            <option value="completed">勤務完了</option>
            <option value="absent">欠勤</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-primary mb-1">備考</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="打刻忘れによる手動修正など"
            className="w-full rounded-lg border border-border bg-sub-bg px-3 py-2 text-text-primary resize-vertical"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-sub-bg cursor-pointer">
            キャンセル
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark cursor-pointer">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function GuardAttendance({ guardId }: { guardId?: string }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentTime, setCurrentTime] = useState(nowTimeStr());
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

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
    showToast("上番しました。お気をつけて！", "success");
  }

  function handleClockOut(shiftId: string) {
    clockOut(shiftId);
    sendLocationOnClock("clock_out");
    refreshData();
    showToast("下番しました。お疲れ様でした！", "success");
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
                      <LiveDuration clockInTime={att.clockIn!} />
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

function LiveDuration({ clockInTime }: { clockInTime: string }) {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    function update() {
      const [ih, im] = clockInTime.split(":").map(Number);
      const now = new Date();
      const nh = now.getHours();
      const nm = now.getMinutes();
      let totalMin = (nh * 60 + nm) - (ih * 60 + im);
      if (totalMin < 0) totalMin += 24 * 60;
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      setElapsed(`${h}時間${String(m).padStart(2, "0")}分`);
    }
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [clockInTime]);
  if (!elapsed) return null;
  return <p className="text-xs text-success/80 mt-1">経過 {elapsed}</p>;
}
