"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { getReports, getReportsByGuard, addReport, getShiftsByGuard, getShifts, getGuards, getSites } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { Card } from "@/components/ui/Card";
import { Lightbox } from "@/components/ui/Lightbox";
import { EmptyState } from "@/components/ui/EmptyState";
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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
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
      <h1 className="text-2xl font-bold">日報</h1>

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
        日報を作成
      </button>

      {reports.length === 0 ? (
        <EmptyState
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>}
          title="日報はまだありません"
          description="勤務終了後に日報を作成してください"
          actionLabel="日報を作成"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">{reports.length}件の日報</p>
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
                        <button
                          key={i}
                          type="button"
                          onClick={() => setLightboxSrc(att.dataUrl)}
                          className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-sub-bg cursor-pointer active:scale-95 transition-transform"
                        >
                          <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                        </button>
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

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}

function AdminReportsView() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReports(getReports());
    setGuards(getGuards());
    setSites(getSites());
  }, []);

  if (!mounted) return null;

  const filtered = reports.filter((r) => {
    const dateMatch = !selectedDate || r.date === selectedDate;
    const siteMatch = siteFilter === "all" || r.siteId === siteFilter;
    if (!dateMatch || !siteMatch) return false;
    if (!search.trim()) return true;
    const guard = guards.find((g) => g.id === r.guardId);
    const site = sites.find((s) => s.id === r.siteId);
    const term = search.trim();
    return (
      r.content.includes(term) ||
      (guard?.name.includes(term) ?? false) ||
      (site?.name.includes(term) ?? false)
    );
  });

  // Monthly summary
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthReports = reports.filter((r) => r.date.startsWith(thisMonth));
  const uniqueGuardsMonth = new Set(monthReports.map((r) => r.guardId)).size;
  const uniqueDaysMonth = new Set(monthReports.map((r) => r.date)).size;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">日報一覧</h1>

      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">今月の提出数</p>
          <p className="text-lg font-bold text-accent">{monthReports.length}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">提出した警備員</p>
          <p className="text-lg font-bold text-text-primary">{uniqueGuardsMonth}名</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">提出日数</p>
          <p className="text-lg font-bold text-success">{uniqueDaysMonth}日</p>
        </Card>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={inputClasses}
        />
        <input
          type="text"
          placeholder="警備員・現場・内容で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-sub-bg text-text-primary cursor-pointer"
          aria-label="現場フィルタ"
        >
          <option value="all">全現場</option>
          {sites.filter((s) => s.status === "active").map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {selectedDate && (
          <button onClick={() => setSelectedDate("")} className="text-xs text-accent hover:underline cursor-pointer">
            日付指定を解除
          </button>
        )}
        {siteFilter !== "all" && (
          <button onClick={() => setSiteFilter("all")} className="text-xs text-accent hover:underline cursor-pointer">
            現場絞り込みを解除
          </button>
        )}
      </div>

      <p className="text-sm text-text-secondary">{filtered.length}件</p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
          title={search.trim() ? "該当する日報がありません" : "この日の日報はありません"}
          description={search.trim() ? "検索条件を変更してください" : "警備員が勤務後に日報を提出するとここに表示されます"}
        />
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
                        <button
                          key={i}
                          type="button"
                          onClick={() => setLightboxSrc(att.dataUrl)}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-sub-bg cursor-pointer active:scale-95 transition-transform"
                        >
                          <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
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
  const draftKey = `lsecurity_report_draft_${guardId}`;
  const [shiftId, setShiftId] = useState(todayShifts[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; dataUrl: string }[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.date === today && draft.content) {
          setContent(draft.content);
          if (draft.shiftId) setShiftId(draft.shiftId);
          setDraftRestored(true);
        } else {
          localStorage.removeItem(draftKey);
        }
      }
    } catch {}
  }, [draftKey, today]);

  // Auto-save draft while typing
  useEffect(() => {
    if (!content) return;
    const t = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ date: today, content, shiftId }));
    }, 500);
    return () => clearTimeout(t);
  }, [content, shiftId, today, draftKey]);

  const selectedShift = shifts.find((s) => s.id === shiftId);
  const siteId = selectedShift?.siteId ?? "";

  async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = maxDim / Math.max(width, height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("canvas unavailable")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image decode failed")); };
      img.src = url;
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const MAX_BYTES = 8 * 1024 * 1024; // 8MB before compression
    const MAX_ATTACHMENTS = 5;
    const list = Array.from(files);
    for (const file of list) {
      if (attachments.length >= MAX_ATTACHMENTS) {
        showToast(`添付は最大${MAX_ATTACHMENTS}件までです`, "warning");
        break;
      }
      if (file.size > MAX_BYTES) {
        showToast(`${file.name}が大きすぎます（上限${Math.round(MAX_BYTES / 1024 / 1024)}MB）`, "error");
        continue;
      }
      try {
        const dataUrl = file.type.startsWith("image/")
          ? await compressImage(file)
          : await new Promise<string>((res, rej) => {
              const r = new FileReader();
              r.onload = () => res(r.result as string);
              r.onerror = () => rej(r.error);
              r.readAsDataURL(file);
            });
        setAttachments((prev) => [...prev, { name: file.name, dataUrl }]);
      } catch {
        showToast(`${file.name}の読み込みに失敗しました`, "error");
      }
    }
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
    localStorage.removeItem(draftKey);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-card-bg border border-border rounded-t-xl sm:rounded-xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold">日報を作成</h2>

        <div>
          <label className="block text-base font-medium text-text-primary mb-2">対象のシフト</label>
          <select value={shiftId} onChange={(e) => setShiftId(e.target.value)} className={`${inputClasses} !py-4 !text-base appearance-none cursor-pointer`} required>
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-base font-medium text-text-primary">報告内容 <span className="text-danger">*</span></label>
            {draftRestored && <span className="text-[10px] text-accent">下書きを復元しました</span>}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="本日の勤務内容を記入してください..."
            rows={5}
            className={`${inputClasses} !text-base resize-vertical`}
            required
          />
        </div>

        <div>
          <label className="block text-base font-medium text-text-primary mb-2">写真添付</label>
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
            写真を追加
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
