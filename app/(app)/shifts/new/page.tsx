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
    if (!date) errs.date = "日付を入力してください";
    if (conflict?.type === "overlap") errs.conflict = "時間が重複するシフトがあります";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    addShift({ guardId, siteId, date, startTime, endTime, shiftType, status: "scheduled", notes: notes.trim() });
    router.push("/shifts");
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
          <label htmlFor="date" className={labelClasses}>
            日付 <span className="text-danger">*</span>
          </label>
          <input id="date" type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} className={inputClasses} />
          {errors.date && <p className="text-danger text-sm mt-1">{errors.date}</p>}
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
            シフトを作成
          </button>
        </div>
      </form>
    </div>
  );
}
