"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGuards, getSites, addShift, getShifts } from "@/lib/store";
import { BackButton } from "@/components/ui/BackButton";
import type { Guard, Site, Shift, ShiftType } from "@/lib/types";
import { SHIFT_PREFERENCE_LABELS } from "@/lib/types";

const inputClasses =
  "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
const labelClasses = "block text-sm font-medium text-text-primary mb-1.5";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function NewShiftPage() {
  return (
    <Suspense fallback={null}>
      <NewShiftForm />
    </Suspense>
  );
}

function NewShiftForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") || todayStr();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [guardId, setGuardId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [date, setDate] = useState(initialDate);
  const [multiDates, setMultiDates] = useState<Set<string>>(new Set());
  const [multiMode, setMultiMode] = useState(false);
  const [shiftType, setShiftType] = useState<ShiftType>("day");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards().filter((g) => g.status === "active"));
    setSites(getSites().filter((s) => s.status === "active"));
    setAllShifts(getShifts());
  }, []);

  // Detect conflicts: same guard, same date, overlapping time
  const conflict = useMemo(() => {
    if (!guardId || !date) return null;
    const guardShifts = allShifts.filter((s) => s.guardId === guardId && s.date === date && s.status !== "cancelled");
    if (guardShifts.length === 0) return null;
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const newStart = toMin(startTime);
    let newEnd = toMin(endTime);
    if (newEnd <= newStart) newEnd += 24 * 60;
    for (const s of guardShifts) {
      const sStart = toMin(s.startTime);
      let sEnd = toMin(s.endTime);
      if (sEnd <= sStart) sEnd += 24 * 60;
      if (newStart < sEnd && sStart < newEnd) {
        return { shift: s, type: "overlap" as const };
      }
    }
    return { shift: guardShifts[0], type: "same_day" as const };
  }, [guardId, date, startTime, endTime, allShifts]);

  if (!mounted) return null;

  function handleShiftTypeChange(type: ShiftType) {
    setShiftType(type);
    if (type === "day") {
      setStartTime("09:00");
      setEndTime("18:00");
    } else {
      setStartTime("18:00");
      setEndTime("06:00");
    }
  }

  const selectedGuard = guards.find((g) => g.id === guardId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!guardId) errs.guardId = "警備員を選択してください";
    if (!siteId) errs.siteId = "現場を選択してください";
    const dates = multiMode ? Array.from(multiDates) : [date];
    if (dates.length === 0) errs.date = "日付を選択してください";
    if (!multiMode && conflict?.type === "overlap") errs.conflict = "時間が重複するシフトがあります";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    for (const d of dates) {
      addShift({ guardId, siteId, date: d, startTime, endTime, shiftType, status: "scheduled", notes: notes.trim() });
    }
    router.push("/shifts");
  }

  function toggleMultiDate(d: string) {
    setMultiDates((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <BackButton fallbackHref="/shifts" label="シフト一覧へ" />
      <h1 className="text-2xl font-bold">シフトを作成</h1>

      <form onSubmit={handleSubmit} className="bg-card-bg border border-border rounded-xl p-5 sm:p-6 space-y-4">
        {/* Shift type toggle */}
        <div>
          <label className={labelClasses}>勤務種別</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleShiftTypeChange("day")}
              className={`py-3 rounded-lg text-sm font-medium cursor-pointer transition-colors border ${
                shiftType === "day"
                  ? "border-warning bg-warning/10 text-warning"
                  : "border-border text-text-secondary hover:border-warning/30"
              }`}
            >
              日勤
            </button>
            <button
              type="button"
              onClick={() => handleShiftTypeChange("night")}
              className={`py-3 rounded-lg text-sm font-medium cursor-pointer transition-colors border ${
                shiftType === "night"
                  ? "border-purple-400 bg-purple-500/10 text-purple-400"
                  : "border-border text-text-secondary hover:border-purple-400/30"
              }`}
            >
              夜勤
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="guardId" className={labelClasses}>
            警備員 <span className="text-danger">*</span>
          </label>
          <select id="guardId" value={guardId} onChange={(e) => setGuardId(e.target.value)} className={`${inputClasses} appearance-none cursor-pointer`}>
            <option value="">選択してください</option>
            {guards.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}（{SHIFT_PREFERENCE_LABELS[g.shiftPreference]}・¥{(shiftType === "night" ? g.nightHourlyRate : g.hourlyRate).toLocaleString()}/h）
              </option>
            ))}
          </select>
          {errors.guardId && <p className="text-danger text-sm mt-1">{errors.guardId}</p>}
          {selectedGuard && shiftType === "night" && (selectedGuard.shiftPreference === "day_only") && (
            <p className="text-warning text-xs mt-1">この警備員は日勤のみ希望です</p>
          )}
        </div>

        <div>
          <label htmlFor="siteId" className={labelClasses}>
            現場 <span className="text-danger">*</span>
          </label>
          <select id="siteId" value={siteId} onChange={(e) => setSiteId(e.target.value)} className={`${inputClasses} appearance-none cursor-pointer`}>
            <option value="">選択してください</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}（{s.clientName}）</option>
            ))}
          </select>
          {errors.siteId && <p className="text-danger text-sm mt-1">{errors.siteId}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="date" className="block text-sm font-medium text-text-primary">
              日付 <span className="text-danger">*</span>
            </label>
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setMultiMode(false)}
                className={`px-2.5 py-1 cursor-pointer transition-colors ${!multiMode ? "bg-accent text-white" : "text-text-secondary hover:bg-sub-bg"}`}
              >
                単一
              </button>
              <button
                type="button"
                onClick={() => setMultiMode(true)}
                className={`px-2.5 py-1 cursor-pointer transition-colors ${multiMode ? "bg-accent text-white" : "text-text-secondary hover:bg-sub-bg"}`}
              >
                複数日付
              </button>
            </div>
          </div>
          {!multiMode ? (
            <input id="date" type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} className={inputClasses} />
          ) : (
            <MultiDatePicker selected={multiDates} onToggle={toggleMultiDate} />
          )}
          {errors.date && <p className="text-danger text-sm mt-1">{errors.date}</p>}
          {multiMode && multiDates.size > 0 && (
            <p className="text-xs text-accent mt-1">{multiDates.size}日分のシフトを一括作成します</p>
          )}
        </div>

        {/* Conflict warning */}
        {conflict && (() => {
          const existingSite = sites.find((s) => s.id === conflict.shift.siteId);
          return (
            <div className={`rounded-lg border p-3 flex items-start gap-2 ${
              conflict.type === "overlap" ? "border-danger/40 bg-danger/5" : "border-warning/40 bg-warning/5"
            }`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 mt-0.5 ${conflict.type === "overlap" ? "text-danger" : "text-warning"}`}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="text-sm">
                <p className={`font-semibold ${conflict.type === "overlap" ? "text-danger" : "text-warning"}`}>
                  {conflict.type === "overlap" ? "時間が重複しています" : "同日に既存シフトあり"}
                </p>
                <p className="text-text-secondary text-xs mt-0.5">
                  {existingSite?.name ?? "—"} / {conflict.shift.startTime}〜{conflict.shift.endTime}（{conflict.shift.shiftType === "night" ? "夜勤" : "日勤"}）
                </p>
              </div>
            </div>
          );
        })()}

        <div className="grid gap-4 grid-cols-2">
          <div>
            <label htmlFor="startTime" className={labelClasses}>開始時間</label>
            <input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label htmlFor="endTime" className={labelClasses}>終了時間</label>
            <input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClasses} />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className={labelClasses}>備考</label>
          <textarea id="notes" rows={2} placeholder="特記事項" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClasses} resize-vertical`} />
        </div>

        <div className="pt-2">
          <button type="submit" className="w-full bg-accent text-white font-semibold rounded-lg px-4 py-3 hover:bg-accent-dark transition-colors cursor-pointer">
            シフトを作成{multiMode && multiDates.size > 1 ? `（${multiDates.size}件）` : ""}
          </button>
        </div>
      </form>
    </div>
  );
}

function MultiDatePicker({ selected, onToggle }: { selected: Set<string>; onToggle: (d: string) => void }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const today = todayStr();
  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);
  const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

  function pad2(n: number) { return String(n).padStart(2, "0"); }
  function dateStr(day: number) { return `${firstDay.getFullYear()}-${pad2(firstDay.getMonth() + 1)}-${pad2(day)}`; }

  function selectWeekdays() {
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(firstDay.getFullYear(), firstDay.getMonth(), i);
      const weekday = d.getDay();
      if (weekday >= 1 && weekday <= 5) {
        const ds = dateStr(i);
        if (ds >= today && !selected.has(ds)) onToggle(ds);
      }
    }
  }

  return (
    <div className="border border-border rounded-lg p-2 bg-sub-bg">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setMonthOffset((m) => m - 1)} className="p-1 rounded hover:bg-card-bg text-text-secondary cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <p className="text-sm font-semibold">{firstDay.getFullYear()}年 {firstDay.getMonth() + 1}月</p>
        <button type="button" onClick={() => setMonthOffset((m) => m + 1)} className="p-1 rounded hover:bg-card-bg text-text-secondary cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
      <div className="flex gap-1 mb-2 text-[10px]">
        <button type="button" onClick={selectWeekdays} className="px-2 py-0.5 rounded bg-accent/10 text-accent cursor-pointer">平日全選択</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayLabels.map((l, i) => (
          <div key={l} className={`text-[10px] py-0.5 ${i === 0 ? "text-danger" : i === 6 ? "text-accent" : "text-text-secondary"}`}>{l}</div>
        ))}
        {days.map((d, i) => {
          if (d === null) return <div key={`p-${i}`} />;
          const ds = dateStr(d);
          const isSelected = selected.has(ds);
          const isPast = ds < today;
          const isToday = ds === today;
          const weekday = new Date(ds + "T00:00:00").getDay();
          return (
            <button
              key={d}
              type="button"
              disabled={isPast}
              onClick={() => onToggle(ds)}
              className={`text-xs py-1.5 rounded cursor-pointer transition-colors ${
                isPast ? "text-text-secondary/30 cursor-not-allowed" :
                isSelected ? "bg-accent text-white font-bold" :
                isToday ? "bg-accent/10 text-accent font-semibold" :
                weekday === 0 ? "text-danger hover:bg-card-bg" :
                weekday === 6 ? "text-accent hover:bg-card-bg" :
                "text-text-primary hover:bg-card-bg"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
