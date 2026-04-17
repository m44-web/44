"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGuards, getShifts, getLending, getEquipment, getAttendance } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import type { Guard, Shift, EquipmentLending, AttendanceRecord } from "@/lib/types";
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_COLORS } from "@/lib/types";

export default function GuardsPage() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [lending, setLending] = useState<EquipmentLending[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards());
    setShifts(getShifts());
    setLending(getLending());
    setAttendance(getAttendance());
  }, []);

  if (!mounted) return null;

  const today = new Date().toISOString().split("T")[0];

  const filtered = guards.filter((g) => {
    const matchSearch =
      g.name.includes(search) ||
      g.nameKana.includes(search) ||
      g.phone.includes(search) ||
      g.email.includes(search) ||
      g.certifications.some((c) => c.includes(search)) ||
      g.licenses.some((l) => l.includes(search));
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount = guards.filter((g) => g.status === "active").length;
  const inactiveCount = guards.filter((g) => g.status === "inactive").length;
  const onDutyToday = attendance.filter((a) => a.date === today && a.status === "on_duty").length;
  const scheduledToday = shifts.filter((s) => s.date === today && s.status !== "cancelled").length;

  function getGuardStats(guardId: string) {
    const guardShifts = shifts.filter((s) => s.guardId === guardId);
    const todayShift = guardShifts.find((s) => s.date === today && s.status !== "cancelled");
    const thisMonthShifts = guardShifts.filter((s) => s.date.startsWith(today.slice(0, 7)) && s.status !== "cancelled");
    const activeLending = lending.filter((l) => l.guardId === guardId && !l.returnDate);
    const todayAttendance = attendance.find((a) => a.guardId === guardId && a.date === today);
    return { todayShift, thisMonthShifts, activeLending, todayAttendance };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">警備員名簿</h1>
        <Button href="/guards/new" size="sm">新規登録</Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">合計</p>
          <p className="text-lg font-bold text-text-primary">{guards.length}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">稼働中</p>
          <p className="text-lg font-bold text-success">{activeCount}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">休止中</p>
          <p className="text-lg font-bold text-warning">{inactiveCount}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">本日勤務</p>
          <p className="text-lg font-bold text-accent">{onDutyToday}/{scheduledToday}</p>
        </Card>
      </div>

      {/* Search and filters */}
      <input
        type="text"
        placeholder="名前・電話番号・資格で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
      />

      <div className="flex items-center gap-2">
        {(["all", "active", "inactive"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
              filterStatus === s
                ? "bg-accent text-white"
                : "bg-sub-bg text-text-secondary hover:text-text-primary"
            }`}
          >
            {s === "all" ? "全員" : s === "active" ? "稼働中" : "休止中"}
          </button>
        ))}
        <span className="text-sm text-text-secondary ml-auto">{filtered.length}名</span>
      </div>

      {/* Guard list */}
      <div className="space-y-2">
        {filtered.map((guard) => {
          const { todayShift, thisMonthShifts, activeLending, todayAttendance } = getGuardStats(guard.id);
          return (
            <Link key={guard.id} href={`/guards/${guard.id}`}>
              <Card className="space-y-2.5">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={guard.name} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-text-primary truncate">{guard.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                          guard.status === "active" ? "bg-success/10 text-success" : "bg-sub-bg text-text-secondary"
                        }`}>
                          {guard.status === "active" ? "稼働中" : "休止中"}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary">{guard.nameKana}</p>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-secondary">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                {/* Info row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${SKILL_LEVEL_COLORS[guard.skillLevel]}`}>
                    {SKILL_LEVEL_LABELS[guard.skillLevel]}
                  </span>
                  {guard.experienceYears > 0 && (
                    <span className="text-text-secondary">経験{guard.experienceYears}年</span>
                  )}
                  <span className="text-text-secondary">{guard.phone}</span>
                  <span className="text-text-secondary">¥{(guard.hourlyRate ?? 1000).toLocaleString()}/h</span>
                </div>

                {/* Today status */}
                {todayShift && (
                  <div className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${
                    todayAttendance?.status === "on_duty" ? "bg-success/10" :
                    todayAttendance?.status === "completed" ? "bg-accent/10" :
                    "bg-warning/10"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      todayAttendance?.status === "on_duty" ? "bg-success" :
                      todayAttendance?.status === "completed" ? "bg-accent" :
                      "bg-warning"
                    }`} />
                    <span className={
                      todayAttendance?.status === "on_duty" ? "text-success" :
                      todayAttendance?.status === "completed" ? "text-accent" :
                      "text-warning"
                    }>
                      {todayAttendance?.status === "on_duty" ? "勤務中" :
                       todayAttendance?.status === "completed" ? "勤務完了" :
                       "本日シフト予定"}
                      {" "}{todayShift.startTime}〜{todayShift.endTime}
                    </span>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                  <span>今月シフト: <span className="text-text-primary font-medium">{thisMonthShifts.length}件</span></span>
                  <span>貸出装備: <span className="text-text-primary font-medium">{activeLending.length}点</span></span>
                  <span>登録: {guard.createdAt}</span>
                </div>

                {/* Certifications & Licenses */}
                {(guard.certifications.length > 0 || guard.licenses.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {guard.certifications.map((cert) => (
                      <span key={cert} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                        {cert}
                      </span>
                    ))}
                    {guard.licenses.map((lic) => (
                      <span key={lic} className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning">
                        {lic}
                      </span>
                    ))}
                  </div>
                )}

                {guard.notes && (
                  <p className="text-[11px] text-text-secondary/70 truncate">備考: {guard.notes}</p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
