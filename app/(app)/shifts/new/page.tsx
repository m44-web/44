"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGuards, getSites, addShift } from "@/lib/store";
import type { Guard, Site, ShiftType } from "@/lib/types";
import { SHIFT_PREFERENCE_LABELS } from "@/lib/types";

const inputClasses =
  "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
const labelClasses = "block text-sm font-medium text-text-primary mb-1.5";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function NewShiftPage() {
  const router = useRouter();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [guardId, setGuardId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [date, setDate] = useState(todayStr());
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
  }, []);

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
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    addShift({ guardId, siteId, date, startTime, endTime, shiftType, status: "scheduled", notes: notes.trim() });
    router.push("/shifts");
  }

  return (
    <div className="space-y-4 max-w-2xl">
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
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses} />
          {errors.date && <p className="text-danger text-sm mt-1">{errors.date}</p>}
        </div>

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
