"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShifts, getGuards, getSites, getShiftsByGuard } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Shift, Guard, Site } from "@/lib/types";
import { SHIFT_STATUS_LABELS, SHIFT_TYPE_LABELS } from "@/lib/types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const statusColors: Record<Shift["status"], string> = {
  scheduled: "bg-warning/20 border-warning/40",
  confirmed: "bg-accent/20 border-accent/40",
  completed: "bg-success/20 border-success/40",
  cancelled: "bg-sub-bg border-border opacity-50",
};

const dotColors: Record<Shift["status"], string> = {
  scheduled: "bg-warning",
  confirmed: "bg-accent",
  completed: "bg-success",
  cancelled: "bg-text-secondary",
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const weekday = WEEKDAYS[d.getDay()];
  const today = todayStr();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const label = `${d.getMonth() + 1}/${d.getDate()}(${weekday})`;
  if (dateStr === today) return `${label} - 今日`;
  if (dateStr === tomorrowStr) return `${label} - 明日`;
  return label;
}

export default function ShiftsPage() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">(user?.role === "admin" ? "calendar" : "list");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards());
    setSites(getSites());
    if (user?.role === "admin") {
      setShifts(getShifts());
    } else if (user?.guardId) {
      setShifts(getShiftsByGuard(user.guardId));
    }
  }, [user]);

  if (!mounted) return null;

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
    setSelectedDate(null);
  }

  const activeShifts = shifts.filter((s) => s.status !== "cancelled");

  // Calendar data
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
  const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  function dateStr(day: number) {
    return `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function shiftsForDay(day: number) {
    return activeShifts.filter((s) => s.date === dateStr(day));
  }

  const selectedShifts = selectedDate
    ? activeShifts.filter((s) => s.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  // List view data
  const sortedShifts = [...activeShifts].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const groupedByDate = sortedShifts.reduce<Record<string, Shift[]>>((acc, shift) => {
    if (!acc[shift.date]) acc[shift.date] = [];
    acc[shift.date].push(shift);
    return acc;
  }, {});
  const dates = Object.keys(groupedByDate).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">シフト管理</h1>
        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1.5 text-sm cursor-pointer transition-colors ${viewMode === "calendar" ? "bg-accent text-white" : "text-text-secondary hover:bg-sub-bg"}`}
                >
                  カレンダー
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 text-sm cursor-pointer transition-colors ${viewMode === "list" ? "bg-accent text-white" : "text-text-secondary hover:bg-sub-bg"}`}
                >
                  リスト
                </button>
              </div>
              <Button href="/shifts/new" size="sm">シフト作成</Button>
            </>
          )}
        </div>
      </div>

      {viewMode === "calendar" && user?.role === "admin" ? (
        <div className="space-y-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-sub-bg transition-colors cursor-pointer text-text-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h2 className="text-lg font-semibold">
              {currentMonth.year}年 {currentMonth.month + 1}月
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-sub-bg transition-colors cursor-pointer text-text-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" />予定</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" />確定</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" />完了</span>
          </div>

          {/* Calendar grid */}
          <div className="bg-card-bg border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-7">
              {WEEKDAYS.map((wd, i) => (
                <div key={wd} className={`text-center py-2 text-xs font-medium border-b border-border ${i === 0 ? "text-danger" : i === 6 ? "text-accent" : "text-text-secondary"}`}>
                  {wd}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="min-h-[60px] sm:min-h-[80px] border-b border-r border-border bg-sub-bg/30" />;
                }
                const ds = dateStr(day);
                const dayShifts = shiftsForDay(day);
                const isToday = ds === todayStr();
                const isSelected = ds === selectedDate;
                const dayOfWeek = new Date(ds + "T00:00:00").getDay();

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : ds)}
                    className={`min-h-[60px] sm:min-h-[80px] border-b border-r border-border p-1 text-left transition-colors cursor-pointer hover:bg-sub-bg ${isSelected ? "bg-accent/10 ring-1 ring-accent" : ""}`}
                  >
                    <span className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday ? "bg-accent text-white" : dayOfWeek === 0 ? "text-danger" : dayOfWeek === 6 ? "text-accent" : "text-text-primary"
                    }`}>
                      {day}
                    </span>
                    {dayShifts.length > 0 && (
                      <div className="mt-0.5 space-y-0.5">
                        {dayShifts.slice(0, 3).map((shift) => {
                          const guard = guards.find((g) => g.id === shift.guardId);
                          return (
                            <div key={shift.id} className={`text-[9px] sm:text-[10px] px-1 py-0.5 rounded border truncate ${statusColors[shift.status]}`}>
                              <span className="hidden sm:inline">{guard?.name ?? ""}</span>
                              <span className="sm:hidden">{guard?.name?.charAt(0) ?? ""}</span>
                            </div>
                          );
                        })}
                        {dayShifts.length > 3 && (
                          <div className="text-[9px] text-text-secondary text-center">+{dayShifts.length - 3}</div>
                        )}
                      </div>
                    )}
                    {dayShifts.length === 0 && (
                      <div className="mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected date detail */}
          {selectedDate && (
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">
                {formatDateLabel(selectedDate)} のシフト ({selectedShifts.length}件)
              </h3>
              {selectedShifts.length === 0 ? (
                <Card><p className="text-text-secondary text-center py-4">この日のシフトはありません</p></Card>
              ) : (
                <div className="space-y-2">
                  {selectedShifts.map((shift) => {
                    const guard = guards.find((g) => g.id === shift.guardId);
                    const site = sites.find((s) => s.id === shift.siteId);
                    return (
                      <Card key={shift.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-text-primary">{guard?.name ?? "—"}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              shift.shiftType === "night" ? "bg-purple-500/10 text-purple-400" : "bg-warning/10 text-warning"
                            }`}>
                              {SHIFT_TYPE_LABELS[shift.shiftType ?? "day"]}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary truncate">{site?.name ?? "—"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-mono">{shift.startTime}〜{shift.endTime}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusColors[shift.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[shift.status]}`} />
                            {SHIFT_STATUS_LABELS[shift.status]}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* List view */
        <div>
          {dates.length === 0 ? (
            <Card><p className="text-text-secondary text-center py-8">シフトはありません</p></Card>
          ) : (
            <div className="space-y-5">
              {dates.map((date) => (
                <div key={date}>
                  <h2 className="text-sm font-semibold text-text-secondary mb-2 sticky top-0 bg-primary py-1">
                    {formatDateLabel(date)}
                  </h2>
                  <div className="space-y-2">
                    {groupedByDate[date].map((shift) => {
                      const guard = guards.find((g) => g.id === shift.guardId);
                      const site = sites.find((s) => s.id === shift.siteId);
                      return (
                        <Card key={shift.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            {user?.role === "admin" && (
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-text-primary truncate">{guard?.name ?? "—"}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                                  shift.shiftType === "night" ? "bg-purple-500/10 text-purple-400" : "bg-warning/10 text-warning"
                                }`}>
                                  {SHIFT_TYPE_LABELS[shift.shiftType ?? "day"]}
                                </span>
                              </div>
                            )}
                            {user?.role !== "admin" && (
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                                  shift.shiftType === "night" ? "bg-purple-500/10 text-purple-400" : "bg-warning/10 text-warning"
                                }`}>
                                  {shift.shiftType === "night" ? "夜勤" : "日勤"}
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-text-secondary truncate">{site?.name ?? "—"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-mono">{shift.startTime}〜{shift.endTime}</p>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusColors[shift.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColors[shift.status]}`} />
                              {SHIFT_STATUS_LABELS[shift.status]}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
