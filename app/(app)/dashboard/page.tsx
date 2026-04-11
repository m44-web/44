"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getGuards, getSites, getShifts, getAttendance, getShiftsByGuard, getAttendanceByGuard } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { Guard, Site, Shift, AttendanceRecord } from "@/lib/types";
import { SITE_TYPE_LABELS, SHIFT_STATUS_LABELS, ATTENDANCE_STATUS_LABELS } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = todayStr();
    if (user?.role === "admin") {
      setGuards(getGuards().filter((g) => g.status === "active"));
      setSites(getSites().filter((s) => s.status === "active"));
      setTodayShifts(getShifts().filter((s) => s.date === today));
      setTodayAttendance(getAttendance().filter((a) => a.date === today));
    } else if (user?.guardId) {
      setTodayShifts(getShiftsByGuard(user.guardId).filter((s) => s.date === today));
      setTodayAttendance(getAttendanceByGuard(user.guardId).filter((a) => a.date === today));
    }
  }, [user]);

  if (!mounted) return null;

  if (user?.role === "admin") {
    return <AdminDashboard guards={guards} sites={sites} todayShifts={todayShifts} todayAttendance={todayAttendance} />;
  }

  return <GuardDashboard shifts={todayShifts} attendance={todayAttendance} />;
}

function AdminDashboard({
  guards, sites, todayShifts, todayAttendance,
}: {
  guards: Guard[]; sites: Site[]; todayShifts: Shift[]; todayAttendance: AttendanceRecord[];
}) {
  const allGuards = getGuards();
  const allSites = getSites();
  const onDuty = todayAttendance.filter((a) => a.status === "on_duty").length;

  const stats = [
    { label: "登録警備員", value: guards.length, unit: "名", href: "/guards", color: "text-accent" },
    { label: "稼働現場", value: sites.length, unit: "件", href: "/sites", color: "text-success" },
    { label: "本日のシフト", value: todayShifts.length, unit: "件", href: "/shifts", color: "text-warning" },
    { label: "勤務中", value: onDuty, unit: "名", href: "/attendance", color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="text-center hover:border-accent/30">
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
                <span className="text-lg ml-0.5">{stat.unit}</span>
              </p>
              <p className="text-text-secondary text-sm mt-1">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">本日のシフト</h2>
          <Link href="/shifts" className="text-sm text-accent hover:underline">すべて見る</Link>
        </div>
        {todayShifts.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4">本日のシフトはありません</p></Card>
        ) : (
          <div className="space-y-2">
            {todayShifts.map((shift) => {
              const guard = allGuards.find((g) => g.id === shift.guardId);
              const site = allSites.find((s) => s.id === shift.siteId);
              const att = todayAttendance.find((a) => a.shiftId === shift.id);
              return (
                <Card key={shift.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{guard?.name ?? "—"}</p>
                    <p className="text-sm text-text-secondary truncate">{site?.name ?? "—"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono">{shift.startTime}〜{shift.endTime}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      att?.status === "on_duty" ? "bg-success/10 text-success" :
                      att?.status === "completed" ? "bg-accent/10 text-accent" :
                      "bg-sub-bg text-text-secondary"
                    }`}>
                      {att ? ATTENDANCE_STATUS_LABELS[att.status] : SHIFT_STATUS_LABELS[shift.status]}
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

function GuardDashboard({ shifts, attendance }: { shifts: Shift[]; attendance: AttendanceRecord[] }) {
  const allSites = getSites();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">本日の予定</h1>

      {shifts.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-8">本日のシフトはありません</p></Card>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => {
            const site = allSites.find((s) => s.id === shift.siteId);
            const att = attendance.find((a) => a.shiftId === shift.id);
            return (
              <Card key={shift.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{site?.name ?? "—"}</p>
                    <p className="text-sm text-text-secondary mt-1">{site?.address}</p>
                    <p className="text-sm font-mono mt-2">
                      {shift.startTime} 〜 {shift.endTime}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
                    att?.status === "on_duty" ? "bg-success/10 text-success" :
                    att?.status === "completed" ? "bg-accent/10 text-accent" :
                    "bg-sub-bg text-text-secondary"
                  }`}>
                    {att ? ATTENDANCE_STATUS_LABELS[att.status] : "未出勤"}
                  </span>
                </div>
                {att?.status !== "completed" && (
                  <Link
                    href="/attendance"
                    className="mt-4 block text-center bg-accent text-white rounded-lg py-3 font-medium hover:bg-accent-dark transition-colors"
                  >
                    {att?.status === "on_duty" ? "退勤する" : "出勤する"}
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
