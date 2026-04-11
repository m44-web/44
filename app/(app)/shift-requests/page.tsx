"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShiftRequests, getShiftRequestsByGuard, addShiftRequest, updateShiftRequest, getGuards, getSites } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { SHIFT_REQUEST_STATUS_LABELS, SHIFT_REQUEST_STATUS_COLORS } from "@/lib/types";
import type { ShiftRequest, Guard, Site } from "@/lib/types";

const inputClasses =
  "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

export default function ShiftRequestsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  if (isAdmin) return <AdminShiftRequestView />;
  return <GuardShiftRequestView guardId={user?.guardId ?? ""} />;
}

function getNextWeekDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);

  for (let i = 0; i < 7; i++) {
    const d = new Date(nextMonday);
    d.setDate(nextMonday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function GuardShiftRequestView({ guardId }: { guardId: string }) {
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  function refresh() {
    setRequests(getShiftRequestsByGuard(guardId));
  }

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [guardId]);

  if (!mounted) return null;

  const nextWeek = getNextWeekDates();
  const nextWeekStart = nextWeek[0];
  const nextWeekEnd = nextWeek[6];

  const nextWeekRequests = requests.filter(
    (r) => r.date >= nextWeekStart && r.date <= nextWeekEnd
  );

  const futureRequests = requests.filter((r) => r.date >= new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">シフト希望</h1>

      {/* Big submit button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-5 rounded-xl bg-accent text-white font-bold text-xl hover:bg-accent-dark cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
        希望を提出する
      </button>

      {/* Next week summary */}
      <Card>
        <h2 className="text-base font-bold text-text-primary mb-3">来週のシフト希望</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {nextWeek.map((date) => {
            const d = new Date(date + "T00:00:00");
            const dayIdx = d.getDay();
            const req = nextWeekRequests.find((r) => r.date === date);
            return (
              <div key={date} className="text-center">
                <p className={`text-xs font-medium ${
                  dayIdx === 0 ? "text-danger" : dayIdx === 6 ? "text-accent" : "text-text-secondary"
                }`}>
                  {DAY_LABELS[dayIdx]}
                </p>
                <p className="text-sm font-medium text-text-primary">{d.getDate()}</p>
                <div className={`mt-1.5 w-full h-2 rounded-full ${
                  req ? (req.status === "approved" ? "bg-success" : req.status === "rejected" ? "bg-danger" : "bg-warning") : "bg-sub-bg"
                }`} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-warning" /> 申請中</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-success" /> 承認済</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-danger" /> 却下</span>
        </div>
      </Card>

      {/* Notification banner */}
      {nextWeekRequests.length === 0 && (
        <Card className="!border-warning/30 !bg-warning/5 !py-5">
          <div className="flex items-start gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning shrink-0 mt-0.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div>
              <p className="text-base font-bold text-warning">来週のシフト希望が未提出です</p>
              <p className="text-sm text-text-secondary mt-1">早めにシフト希望を提出してください</p>
            </div>
          </div>
        </Card>
      )}

      {/* Request list */}
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">提出済み</h2>
        {futureRequests.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-6">提出済みの希望はありません</p></Card>
        ) : (
          <div className="space-y-2">
            {futureRequests.map((req) => {
              const d = new Date(req.date + "T00:00:00");
              return (
                <Card key={req.id} className="flex items-center justify-between gap-3 !py-4">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-text-primary">
                      {req.date}（{DAY_LABELS[d.getDay()]}）
                    </p>
                    <p className="text-sm text-text-secondary">{req.startTime}〜{req.endTime} {req.notes && `/ ${req.notes}`}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full shrink-0 font-medium ${SHIFT_REQUEST_STATUS_COLORS[req.status]}`}>
                    {SHIFT_REQUEST_STATUS_LABELS[req.status]}
                  </span>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <ShiftRequestFormModal
          guardId={guardId}
          existingDates={requests.map((r) => r.date)}
          onClose={() => setShowForm(false)}
          onDone={() => { setShowForm(false); refresh(); }}
        />
      )}
    </div>
  );
}

function AdminShiftRequestView() {
  const [requests, setRequests] = useState<ShiftRequest[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteSelections, setSiteSelections] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  function refresh() {
    setRequests(getShiftRequests());
    setGuards(getGuards());
    setSites(getSites());
  }

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  if (!mounted) return null;

  const activeSites = sites.filter((s) => s.status === "active");
  const pendingRequests = requests.filter((r) => r.status === "pending").sort((a, b) => a.date.localeCompare(b.date));
  const processedRequests = requests.filter((r) => r.status !== "pending").sort((a, b) => b.date.localeCompare(a.date));

  function handleApprove(id: string) {
    const selectedSiteId = siteSelections[id] || "";
    if (!selectedSiteId) {
      alert("現場を選択してから承認してください");
      return;
    }
    updateShiftRequest(id, { status: "approved" }, selectedSiteId);
    refresh();
  }

  function handleReject(id: string) {
    updateShiftRequest(id, { status: "rejected" });
    refresh();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">シフト希望管理</h1>

      {/* Pending count */}
      {pendingRequests.length > 0 && (
        <Card className="!border-warning/30 !bg-warning/5">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p className="text-sm font-medium text-warning">未処理のシフト希望が{pendingRequests.length}件あります</p>
          </div>
        </Card>
      )}

      <p className="text-xs text-text-secondary">※ 承認時に配置現場を選択 → シフト管理に自動反映されます</p>

      {/* Pending requests */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">未処理の希望</h2>
        {pendingRequests.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">未処理の希望はありません</p></Card>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((req) => {
              const guard = guards.find((g) => g.id === req.guardId);
              const d = new Date(req.date + "T00:00:00");
              const isNight = req.startTime >= "17:00" || req.endTime <= "08:00";
              return (
                <Card key={req.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary">{guard?.name ?? "—"}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          isNight ? "bg-purple-500/10 text-purple-400" : "bg-warning/10 text-warning"
                        }`}>
                          {isNight ? "夜勤" : "日勤"}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {req.date}（{DAY_LABELS[d.getDay()]}）{req.startTime}〜{req.endTime}
                        {req.notes && ` / ${req.notes}`}
                      </p>
                    </div>
                  </div>

                  {/* Site selection */}
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">配置先の現場を選択 <span className="text-danger">*</span></label>
                    <select
                      value={siteSelections[req.id] ?? ""}
                      onChange={(e) => setSiteSelections((prev) => ({ ...prev, [req.id]: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-sub-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">現場を選択してください</option>
                      {activeSites.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}（{s.clientName}）</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className={`flex-1 text-sm py-2.5 rounded-lg font-medium cursor-pointer transition-colors ${
                        siteSelections[req.id]
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-sub-bg text-text-secondary"
                      }`}
                    >
                      承認 → シフト作成
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex-1 text-sm py-2.5 rounded-lg bg-danger/10 text-danger font-medium hover:bg-danger/20 cursor-pointer transition-colors"
                    >
                      却下
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Processed requests */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-2">処理済み</h2>
          <div className="space-y-1.5">
            {processedRequests.slice(0, 20).map((req) => {
              const guard = guards.find((g) => g.id === req.guardId);
              const d = new Date(req.date + "T00:00:00");
              return (
                <Card key={req.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{guard?.name ?? "—"}</p>
                    <p className="text-xs text-text-secondary">
                      {req.date}（{DAY_LABELS[d.getDay()]}）{req.startTime}〜{req.endTime}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${SHIFT_REQUEST_STATUS_COLORS[req.status]}`}>
                    {SHIFT_REQUEST_STATUS_LABELS[req.status]}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ShiftRequestFormModal({
  guardId, existingDates, onClose, onDone,
}: {
  guardId: string; existingDates: string[]; onClose: () => void; onDone: () => void;
}) {
  const nextWeek = getNextWeekDates();
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [shiftType, setShiftType] = useState<"day" | "night">("day");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [notes, setNotes] = useState("");

  function handleShiftTypeChange(type: "day" | "night") {
    setShiftType(type);
    if (type === "day") { setStartTime("09:00"); setEndTime("18:00"); }
    else { setStartTime("18:00"); setEndTime("06:00"); }
  }

  function toggleDate(date: string) {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedDates.size === 0) return;
    selectedDates.forEach((date) => {
      if (!existingDates.includes(date)) {
        addShiftRequest({ guardId, date, startTime, endTime, notes: notes.trim(), status: "pending" });
      }
    });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-card-bg border border-border rounded-t-xl sm:rounded-xl p-5 space-y-4">
        <h2 className="text-xl font-bold">シフト希望を提出</h2>

        {/* Day/Night toggle - big buttons */}
        <div>
          <label className="block text-base font-medium text-text-primary mb-2">勤務区分</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleShiftTypeChange("day")}
              className={`py-4 rounded-xl text-lg font-bold cursor-pointer transition-colors border ${
                shiftType === "day"
                  ? "border-warning bg-warning/10 text-warning"
                  : "border-border text-text-secondary"
              }`}
            >
              日勤
            </button>
            <button
              type="button"
              onClick={() => handleShiftTypeChange("night")}
              className={`py-4 rounded-xl text-lg font-bold cursor-pointer transition-colors border ${
                shiftType === "night"
                  ? "border-purple-400 bg-purple-500/10 text-purple-400"
                  : "border-border text-text-secondary"
              }`}
            >
              夜勤
            </button>
          </div>
        </div>

        <div>
          <label className="block text-base font-medium text-text-primary mb-2">希望日を選択</label>
          <div className="grid grid-cols-7 gap-2">
            {nextWeek.map((date) => {
              const d = new Date(date + "T00:00:00");
              const dayIdx = d.getDay();
              const selected = selectedDates.has(date);
              const alreadySubmitted = existingDates.includes(date);
              return (
                <button
                  key={date}
                  type="button"
                  disabled={alreadySubmitted}
                  onClick={() => toggleDate(date)}
                  className={`flex flex-col items-center py-3 rounded-xl text-sm cursor-pointer transition-all active:scale-95 ${
                    alreadySubmitted ? "bg-sub-bg text-text-secondary/40 cursor-not-allowed" :
                    selected ? "bg-accent text-white" :
                    "border border-border text-text-primary hover:border-accent/30"
                  }`}
                >
                  <span className={`text-xs ${
                    !selected && (dayIdx === 0 ? "text-danger" : dayIdx === 6 ? "text-accent" : "")
                  }`}>
                    {DAY_LABELS[dayIdx]}
                  </span>
                  <span className="font-bold text-base">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">開始時間</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`${inputClasses} !py-4`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">終了時間</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`${inputClasses} !py-4`} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">メモ</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="備考があれば入力" className={inputClasses} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl border border-border text-text-secondary text-lg hover:bg-sub-bg cursor-pointer transition-colors active:scale-[0.98]">戻る</button>
          <button type="submit" disabled={selectedDates.size === 0} className="flex-1 py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-dark cursor-pointer transition-colors disabled:opacity-40 active:scale-[0.98]">
            {selectedDates.size}日分を提出
          </button>
        </div>
      </form>
    </div>
  );
}
