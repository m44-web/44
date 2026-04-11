"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { getReports, getReportsByGuard, addReport, getShiftsByGuard, getShifts, getGuards, getSites } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { DailyReport, Guard, Site, Shift } from "@/lib/types";

const inputClasses =
  "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

export default function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  if (isAdmin) return <AdminReportsView />;
  return <GuardReportsView guardId={user?.guardId ?? ""} />;
}

function GuardReportsView({ guardId }: { guardId: string }) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  function refresh() {
    setReports(getReportsByGuard(guardId));
    setShifts(getShiftsByGuard(guardId));
    setSites(getSites());
  }

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [guardId]);

  if (!mounted) return null;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">にっぽう</h1>

      {/* Big create button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-5 rounded-xl bg-accent text-white font-bold text-xl hover:bg-accent-dark cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        にっぽうを かく
      </button>

      {reports.length === 0 ? (
        <Card className="text-center !py-8">
          <p className="text-lg text-text-secondary">にっぽうは まだ ありません</p>
          <p className="text-sm text-text-secondary mt-1">しごとが おわったら にっぽうを かきましょう</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">{reports.length}けん の にっぽう</p>
          {reports.sort((a, b) => b.date.localeCompare(a.date)).map((report) => {
            const site = sites.find((s) => s.id === report.siteId);
            return (
              <Card key={report.id}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm px-3 py-1 rounded-lg bg-accent/10 text-accent font-medium">{report.date}</span>
                    <span className="text-sm text-text-secondary">{site?.name ?? "—"}</span>
                  </div>
                  <p className="text-base text-text-primary whitespace-pre-wrap leading-relaxed">{report.content}</p>
                  {report.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {report.attachments.map((att, i) => (
                        <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-sub-bg">
                          <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <ReportFormModal
          guardId={guardId}
          shifts={shifts}
          sites={sites}
          onClose={() => setShowForm(false)}
          onDone={() => { setShowForm(false); refresh(); }}
        />
      )}
    </div>
  );
}

function AdminReportsView() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReports(getReports());
    setGuards(getGuards());
    setSites(getSites());
  }, []);

  if (!mounted) return null;

  const filtered = selectedDate
    ? reports.filter((r) => r.date === selectedDate)
    : reports;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">日報一覧</h1>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className={inputClasses}
      />

      <p className="text-sm text-text-secondary">{filtered.length}件</p>

      {filtered.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-6 text-sm">この日の日報はありません</p></Card>
      ) : (
        <div className="space-y-2">
          {filtered.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).map((report) => {
            const guard = guards.find((g) => g.id === report.guardId);
            const site = sites.find((s) => s.id === report.siteId);
            return (
              <Card key={report.id}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{guard?.name ?? "—"}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">{report.date}</span>
                    </div>
                    <span className="text-xs text-text-secondary">{site?.name ?? "—"}</span>
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{report.content}</p>
                  {report.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {report.attachments.map((att, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-sub-bg">
                          <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReportFormModal({
  guardId, shifts, sites, onClose, onDone,
}: {
  guardId: string; shifts: Shift[]; sites: Site[]; onClose: () => void; onDone: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const todayShifts = shifts.filter((s) => s.date === today);
  const [shiftId, setShiftId] = useState(todayShifts[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; dataUrl: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedShift = shifts.find((s) => s.id === shiftId);
  const siteId = selectedShift?.siteId ?? "";

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [...prev, { name: file.name, dataUrl: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !shiftId) return;
    addReport({
      guardId, shiftId, siteId, date: today,
      content: content.trim(), attachments,
      submittedAt: new Date().toISOString(),
    });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-card-bg border border-border rounded-t-xl sm:rounded-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold">にっぽうを かく</h2>

        <div>
          <label className="block text-base font-medium text-text-primary mb-2">どの しごと？</label>
          <select value={shiftId} onChange={(e) => setShiftId(e.target.value)} className={`${inputClasses} !py-4 !text-base appearance-none cursor-pointer`} required>
            <option value="">えらんでください</option>
            {shifts.filter((s) => s.status !== "cancelled").slice(0, 20).map((s) => {
              const site = sites.find((st) => st.id === s.siteId);
              return (
                <option key={s.id} value={s.id}>{s.date} {s.startTime}〜{s.endTime} {site?.name ?? ""}</option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-base font-medium text-text-primary mb-2">ほうこく ないよう <span className="text-danger">*</span></label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="きょうの しごとの ないよう を かいてください..."
            rows={5}
            className={`${inputClasses} !text-base resize-vertical`}
            required
          />
        </div>

        <div>
          <label className="block text-base font-medium text-text-primary mb-2">しゃしん</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-3 text-base px-4 py-3 rounded-xl border border-border text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors active:scale-[0.98] w-full justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            しゃしんを ついか
          </button>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {attachments.map((att, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-0 right-0 bg-danger text-white rounded-bl-lg w-6 h-6 flex items-center justify-center text-sm cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl border border-border text-text-secondary text-lg hover:bg-sub-bg cursor-pointer transition-colors active:scale-[0.98]">戻る</button>
          <button type="submit" className="flex-1 py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-dark cursor-pointer transition-colors active:scale-[0.98]">提出</button>
        </div>
      </form>
    </div>
  );
}
