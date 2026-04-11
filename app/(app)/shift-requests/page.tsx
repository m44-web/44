"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getShiftRequests, getShiftRequestsByGuard, addShiftRequest, updateShiftRequest, getGuards } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { SHIFT_REQUEST_STATUS_LABELS, SHIFT_REQUEST_STATUS_COLORS } from "@/lib/types";
import type { ShiftRequest, Guard } from "@/lib/types";

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
  // Find next Monday
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

  // Requests for next week
  const nextWeekRequests = requests.filter(
    (r) => r.date >= nextWeekStart && r.date <= nextWeekEnd
  );

  // Future requests
  const futureRequests = requests.filter((r) => r.date >= new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">シフト希望</h1>
        <button onClick={() => setShowForm(true)} className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark cursor-pointer transition-colors">
          希望を提出
        </button>
      </div>

      {/* Next week summary */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-3">来週のシフト希望</h2>
        <div className="grid grid-cols-7 gap-1">
          {nextWeek.map((date) => {
            const d = new Date(date + "T00:00:00");
            const dayIdx = d.getDay();
            const req = nextWeekRequests.find((r) => r.date === date);
            return (
              <div key={date} className="text-center">
                <p className={`text-[10px] font-medium ${
                  dayIdx === 0 ? "text-danger" : dayIdx === 6 ? "text-accent" : "text-text-secondary"
                }`}>
                  {DAY_LABELS[dayIdx]}
                </p>
                <p className="text-xs text-text-primary">{d.getDate()}</p>
                <div className={`mt-1 w-full h-1.5 rounded-full ${
                  req ? (req.status === "approved" ? "bg-success" : req.status === "rejected" ? "bg-danger" : "bg-warning") : "bg-sub-bg"
                }`} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2 text-[10px] text-text-secondary">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> 申請中</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> 承認</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger" /> 却下</span>
        </div>
      </Card>

      {/* Notification banner */}
      {nextWeekRequests.length === 0 && (
        <Card className="!border-warning/30 !bg-warning/5">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning shrink-0 mt-0.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div>
              <p className="text-sm font-medium text-warning">来週のシフト希望が未提出です</p>
              <p className="text-xs text-text-secondary mt-0.5">早めにシフト希望を提出してください</p>
            </div>
          </div>
        </Card>
      )}

      {/* Request list */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">提出済み希望一覧</h2>
        {futureRequests.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">提出済みの希望はありません</p></Card>
        ) : (
          <div className="space-y-1.5">
            {futureRequests.map((req) => {
              const d = new Date(req.date + "T00:00:00");
              return (
                <Card key={req.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {req.date}（{DAY_LABELS[d.getDay()]}）
                    </p>
                    <p className="text-xs text-text-secondary">{req.startTime}〜{req.endTime} {req.notes && `/ ${req.notes}`}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${SHIFT_REQUEST_STATUS_COLORS[req.status]}`}>
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
  const [mounted, setMounted] = useState(false);

  function refresh() {
    setRequests(getShiftRequests());
    setGuards(getGuards());
  }

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  if (!mounted) return null;

  const pendingRequests = requests.filter((r) => r.status === "pending").sort((a, b) => a.date.localeCompare(b.date));
  const processedRequests = requests.filter((r) => r.status !== "pending").sort((a, b) => b.date.localeCompare(a.date));

  function handleApprove(id: string) {
    updateShiftRequest(id, { status: "approved" });
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
              return (
                <Card key={req.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{guard?.name ?? "—"}</p>
                      <p className="text-xs text-text-secondary">
                        {req.date}（{DAY_LABELS[d.getDay()]}）{req.startTime}〜{req.endTime}
                        {req.notes && ` / ${req.notes}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 text-sm py-2 rounded-lg bg-success/10 text-success font-medium hover:bg-success/20 cursor-pointer transition-colors"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex-1 text-sm py-2 rounded-lg bg-danger/10 text-danger font-medium hover:bg-danger/20 cursor-pointer transition-colors"
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
        <h2 className="text-lg font-bold">シフト希望を提出</h2>

        {/* Day/Night toggle */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">勤務種別</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleShiftTypeChange("day")}
              className={`py-3 rounded-lg text-base font-bold cursor-pointer transition-colors border ${
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
              className={`py-3 rounded-lg text-base font-bold cursor-pointer transition-colors border ${
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
          <label className="block text-sm font-medium text-text-primary mb-2">来週の希望日を選択</label>
          <div className="grid grid-cols-7 gap-1.5">
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
                  className={`flex flex-col items-center py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    alreadySubmitted ? "bg-sub-bg text-text-secondary/40 cursor-not-allowed" :
                    selected ? "bg-accent text-white" :
                    "border border-border text-text-primary hover:border-accent/30"
                  }`}
                >
                  <span className={`text-[10px] ${
                    !selected && (dayIdx === 0 ? "text-danger" : dayIdx === 6 ? "text-accent" : "")
                  }`}>
                    {DAY_LABELS[dayIdx]}
                  </span>
                  <span className="font-medium">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">開始時間</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">終了時間</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClasses} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">備考</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="夜勤可能、午前のみなど" className={inputClasses} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:bg-sub-bg cursor-pointer transition-colors">キャンセル</button>
          <button type="submit" disabled={selectedDates.size === 0} className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark cursor-pointer transition-colors disabled:opacity-40">
            {selectedDates.size}日分を提出
          </button>
        </div>
      </form>
    </div>
  );
}
