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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">日報</h1>
        <button onClick={() => setShowForm(true)} className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark cursor-pointer transition-colors">
          日報を作成
        </button>
      </div>

      {reports.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-6 text-sm">日報はまだありません</p></Card>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => {
            const site = sites.find((s) => s.id === report.siteId);
            return (
              <Card key={report.id}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">{report.date}</span>
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
        <h2 className="text-lg font-bold">日報を作成</h2>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">シフト</label>
          <select value={shiftId} onChange={(e) => setShiftId(e.target.value)} className={`${inputClasses} appearance-none cursor-pointer`} required>
            <option value="">選択してください</option>
            {shifts.filter((s) => s.status !== "cancelled").slice(0, 20).map((s) => {
              const site = sites.find((st) => st.id === s.siteId);
              return (
                <option key={s.id} value={s.id}>{s.date} {s.startTime}〜{s.endTime} {site?.name ?? ""}</option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">報告内容 <span className="text-danger">*</span></label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="業務内容、異常の有無、特記事項などを記入..."
            rows={5}
            className={`${inputClasses} resize-vertical`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">添付写真</label>
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
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            写真を追加
          </button>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((att, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                  <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-0 right-0 bg-danger text-white rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:bg-sub-bg cursor-pointer transition-colors">キャンセル</button>
          <button type="submit" className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark cursor-pointer transition-colors">提出する</button>
        </div>
      </form>
    </div>
  );
}
