"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getGuard, updateGuard, getLendingByGuard, getEquipment, returnLending, getShiftsByGuard, getAttendanceByGuard, getSites, getReportsByGuard } from "@/lib/store";
import { GuardForm, type GuardFormValues } from "@/components/app/GuardForm";
import { Card } from "@/components/ui/Card";
import type { Guard, EquipmentLending, EquipmentItem, Shift, AttendanceRecord, Site, DailyReport } from "@/lib/types";
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_COLORS, EQUIPMENT_CATEGORY_LABELS, SHIFT_STATUS_LABELS, SHIFT_PREFERENCE_LABELS, SHIFT_PREFERENCE_COLORS } from "@/lib/types";

export default function GuardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [guard, setGuard] = useState<Guard | undefined>();
  const [lending, setLending] = useState<EquipmentLending[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  function refresh() {
    setGuard(getGuard(id));
    setLending(getLendingByGuard(id));
    setEquipment(getEquipment());
    setShifts(getShiftsByGuard(id));
    setAttendance(getAttendanceByGuard(id));
    setSites(getSites());
    setReports(getReportsByGuard(id));
  }

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [id]);

  if (!mounted) return null;
  if (!guard) {
    return <p className="text-text-secondary py-8 text-center">警備員が見つかりません</p>;
  }

  function handleSubmit(data: GuardFormValues) {
    updateGuard(id, data);
    setGuard({ ...guard!, ...data });
    setEditMode(false);
  }

  function toggleStatus() {
    const newStatus = guard!.status === "active" ? "inactive" : "active";
    updateGuard(id, { status: newStatus });
    setGuard({ ...guard!, status: newStatus });
  }

  function handleReturn(lendingId: string) {
    returnLending(lendingId);
    setLending(getLendingByGuard(id));
  }

  if (editMode) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditMode(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="text-2xl font-bold">警備員を編集</h1>
        </div>
        <GuardForm
          onSubmit={handleSubmit}
          defaultValues={{
            name: guard.name, nameKana: guard.nameKana, phone: guard.phone, email: guard.email,
            certifications: guard.certifications, licenses: guard.licenses,
            skillLevel: guard.skillLevel, experienceYears: guard.experienceYears,
            hourlyRate: guard.hourlyRate, nightHourlyRate: guard.nightHourlyRate, shiftPreference: guard.shiftPreference,
            notes: guard.notes,
          }}
        />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);
  const todayShift = shifts.find((s) => s.date === today && s.status !== "cancelled");
  const todayAttendance = attendance.find((a) => a.date === today);
  const upcomingShifts = shifts.filter((s) => s.date >= today && s.status !== "cancelled").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const thisMonthShifts = shifts.filter((s) => s.date.startsWith(thisMonth) && s.status !== "cancelled");
  const completedShifts = shifts.filter((s) => s.status === "completed");

  function calcHours(s: Shift): number {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    let hours = eh - sh + (em - sm) / 60;
    if (hours < 0) hours += 24;
    return hours;
  }

  const monthlyHours = thisMonthShifts.reduce((sum, s) => sum + calcHours(s), 0);
  const monthlyPay = Math.round(monthlyHours * (guard.hourlyRate ?? 1000));
  const totalCompletedHours = completedShifts.reduce((sum, s) => sum + calcHours(s), 0);

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/guards")} className="text-text-secondary hover:text-text-primary cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">{guard.name}</h1>
            <p className="text-xs text-text-secondary">{guard.nameKana}</p>
          </div>
        </div>
        <button onClick={() => setEditMode(true)} className="text-sm px-3 py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 cursor-pointer transition-colors">
          編集
        </button>
      </div>

      {/* Today status banner */}
      {todayShift && (
        <Card className={`!py-3 ${
          todayAttendance?.status === "on_duty" ? "!border-success/30 !bg-success/5" :
          todayAttendance?.status === "completed" ? "!border-accent/30 !bg-accent/5" :
          "!border-warning/30 !bg-warning/5"
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                todayAttendance?.status === "on_duty" ? "bg-success animate-pulse" :
                todayAttendance?.status === "completed" ? "bg-accent" :
                "bg-warning"
              }`} />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {todayAttendance?.status === "on_duty" ? "現在勤務中" :
                   todayAttendance?.status === "completed" ? "本日の勤務完了" :
                   "本日シフト予定"}
                </p>
                <p className="text-xs text-text-secondary">
                  {todayShift.startTime}〜{todayShift.endTime}
                  {todayAttendance?.clockIn && ` / 出勤 ${todayAttendance.clockIn}`}
                  {todayAttendance?.clockOut && ` / 退勤 ${todayAttendance.clockOut}`}
                </p>
              </div>
            </div>
            <p className="text-xs text-text-secondary">{sites.find((s) => s.id === todayShift.siteId)?.name}</p>
          </div>
        </Card>
      )}

      {/* Profile card */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${SKILL_LEVEL_COLORS[guard.skillLevel]}`}>
              {SKILL_LEVEL_LABELS[guard.skillLevel]}
            </span>
            {guard.experienceYears > 0 && (
              <span className="text-sm text-text-secondary">経験 {guard.experienceYears}年</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${guard.status === "active" ? "bg-success/10 text-success" : "bg-sub-bg text-text-secondary"}`}>
              {guard.status === "active" ? "稼働中" : "休止中"}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${SHIFT_PREFERENCE_COLORS[guard.shiftPreference]}`}>
              {SHIFT_PREFERENCE_LABELS[guard.shiftPreference]}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.127.96.362 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45c.91.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              <a href={`tel:${guard.phone}`} className="text-accent">{guard.phone}</a>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              <span className="text-text-primary truncate">{guard.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary shrink-0"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <span className="text-text-primary">日勤¥{(guard.hourlyRate ?? 1000).toLocaleString()} / 夜勤¥{(guard.nightHourlyRate ?? 1250).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span className="text-text-primary">登録日: {guard.createdAt}</span>
            </div>
          </div>

          {guard.notes && (
            <div className="text-sm bg-sub-bg rounded-lg p-2.5"><span className="text-text-secondary">備考: </span><span className="text-text-primary">{guard.notes}</span></div>
          )}
        </div>
      </Card>

      {/* Monthly stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center !py-3">
          <p className="text-[10px] text-text-secondary">今月シフト</p>
          <p className="text-lg font-bold text-text-primary">{thisMonthShifts.length}<span className="text-xs text-text-secondary">件</span></p>
        </Card>
        <Card className="text-center !py-3">
          <p className="text-[10px] text-text-secondary">今月勤務時間</p>
          <p className="text-lg font-bold text-accent">{monthlyHours.toFixed(1)}<span className="text-xs text-text-secondary">h</span></p>
        </Card>
        <Card className="text-center !py-3">
          <p className="text-[10px] text-text-secondary">今月見込み給与</p>
          <p className="text-lg font-bold text-success">¥{monthlyPay.toLocaleString()}</p>
        </Card>
      </div>

      {/* Certifications */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-2">警備業務検定</h2>
        {guard.certifications.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {guard.certifications.map((cert) => (
              <span key={cert} className="text-xs px-2.5 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
                {cert}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-secondary">検定なし</p>
        )}
      </Card>

      {/* Licenses */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-2">免許・資格</h2>
        {guard.licenses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {guard.licenses.map((lic) => (
              <span key={lic} className="text-xs px-2.5 py-1 rounded-lg bg-warning/10 text-warning border border-warning/20">
                {lic}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-secondary">資格なし</p>
        )}
      </Card>

      {/* Upcoming shifts */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">今後のシフト</h2>
        {upcomingShifts.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">予定なし</p></Card>
        ) : (
          <div className="space-y-1.5">
            {upcomingShifts.map((shift) => {
              const site = sites.find((s) => s.id === shift.siteId);
              const hours = calcHours(shift);
              return (
                <Card key={shift.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{shift.date}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        shift.status === "confirmed" ? "bg-accent/10 text-accent" :
                        shift.status === "completed" ? "bg-success/10 text-success" :
                        "bg-warning/10 text-warning"
                      }`}>
                        {SHIFT_STATUS_LABELS[shift.status]}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{shift.startTime}〜{shift.endTime}（{hours.toFixed(1)}h）/ {site?.name ?? "—"}</p>
                  </div>
                  <p className="text-xs text-text-secondary shrink-0">¥{Math.round(hours * (guard.hourlyRate ?? 1000)).toLocaleString()}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Equipment lending */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">貸出中の装備・制服（{lending.length}点）</h2>
        {lending.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">貸出中の装備はありません</p></Card>
        ) : (
          <div className="space-y-1.5">
            {lending.map((item) => {
              const eq = equipment.find((e) => e.id === item.equipmentId);
              return (
                <Card key={item.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{eq?.name ?? "—"}</p>
                    <p className="text-xs text-text-secondary">
                      {eq ? EQUIPMENT_CATEGORY_LABELS[eq.category] : ""} / {item.quantity}点 / 貸出: {item.lentDate}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReturn(item.id)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors shrink-0"
                  >
                    返却
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent reports */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">最近の日報（{reports.length}件）</h2>
        {reports.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">日報なし</p></Card>
        ) : (
          <div className="space-y-1.5">
            {reports.slice(0, 3).map((report) => {
              const site = sites.find((s) => s.id === report.siteId);
              return (
                <Card key={report.id} className="!py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">{report.date}</span>
                    <span className="text-xs text-text-secondary">{site?.name}</span>
                  </div>
                  <p className="text-xs text-text-primary line-clamp-2">{report.content}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Work summary */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-2">勤務実績</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-secondary text-xs">総シフト数</p>
            <p className="font-bold text-text-primary">{shifts.length}件</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">完了シフト数</p>
            <p className="font-bold text-text-primary">{completedShifts.length}件</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">総勤務時間</p>
            <p className="font-bold text-accent">{totalCompletedHours.toFixed(1)}時間</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs">日報提出数</p>
            <p className="font-bold text-text-primary">{reports.length}件</p>
          </div>
        </div>
      </Card>

      {/* Status toggle */}
      <div className="pt-2">
        <button
          onClick={toggleStatus}
          className={`w-full text-sm px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
            guard.status === "active"
              ? "border-danger/30 text-danger hover:bg-danger/10"
              : "border-success/30 text-success hover:bg-success/10"
          }`}
        >
          {guard.status === "active" ? "この警備員を休止にする" : "この警備員を稼働にする"}
        </button>
      </div>
    </div>
  );
}
