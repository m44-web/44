"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getHandoverBySite, addHandoverNote, getSites, getGuard, getShiftsByGuard, updateHandoverNote } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { Card } from "@/components/ui/Card";
import type { HandoverNote, Site, Shift } from "@/lib/types";

const inputClasses =
  "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

export default function HandoverPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  if (isAdmin) return <AdminHandoverView />;
  return <GuardHandoverView guardId={user?.guardId ?? ""} userName={user?.name ?? ""} />;
}

function GuardHandoverView({ guardId, userName }: { guardId: string; userName: string }) {
  const [sites, setSites] = useState<Site[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [notes, setNotes] = useState<HandoverNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const allSites = getSites();
    setSites(allSites);
    const myShifts = getShiftsByGuard(guardId);
    setShifts(myShifts);
    // Auto-select today's site
    const today = new Date().toISOString().split("T")[0];
    const todayShift = myShifts.find((s) => s.date === today && s.status !== "cancelled");
    if (todayShift) {
      setSelectedSiteId(todayShift.siteId);
    } else if (allSites.length > 0) {
      setSelectedSiteId(allSites[0].id);
    }
  }, [guardId]);

  useEffect(() => {
    if (selectedSiteId) setNotes(getHandoverBySite(selectedSiteId));
  }, [selectedSiteId]);

  if (!mounted) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !selectedSiteId) return;
    addHandoverNote({
      siteId: selectedSiteId,
      guardId,
      guardName: userName,
      date: new Date().toISOString().split("T")[0],
      content: content.trim(),
    });
    setContent("");
    setShowForm(false);
    setNotes(getHandoverBySite(selectedSiteId));
  }

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">引継ぎノート</h1>

      <select
        value={selectedSiteId}
        onChange={(e) => setSelectedSiteId(e.target.value)}
        className={`${inputClasses} appearance-none cursor-pointer`}
      >
        {sites.filter((s) => s.status === "active").map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {selectedSite && (
        <Card className="!py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">{selectedSite.name}</p>
              <p className="text-xs text-text-secondary">{selectedSite.address}</p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedSite.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-medium hover:bg-accent/20 transition-colors"
            >
              ナビ開始
            </a>
          </div>
        </Card>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-dark cursor-pointer transition-all active:scale-[0.98]"
      >
        引継ぎを書く
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="text-xs font-medium text-text-secondary mb-1.5">テンプレート（タップで追加）</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "異常なし", text: "本日、特に異常はありませんでした。引き続きよろしくお願いします。" },
                { label: "不審者対応", text: "[時刻]頃、[場所]にて不審者を目撃。声かけを行い退去を確認。引き続き警戒をお願いします。" },
                { label: "設備不良", text: "[場所]の[設備]に不具合を発見。応急処置済み。管理者に報告要。" },
                { label: "巡回報告", text: "定時巡回[回数]回実施。異常なし。" },
                { label: "来訪者対応", text: "[時刻]頃、[来訪者名]様が来訪。用件: [内容]。対応済み。" },
              ].map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => setContent((prev) => prev ? `${prev}\n\n${tpl.text}` : tpl.text)}
                  className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer transition-colors"
                >
                  + {tpl.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="次の人に伝えたいことを書いてください..."
            rows={5}
            className={`${inputClasses} resize-vertical`}
            required
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-border text-text-secondary cursor-pointer transition-colors">キャンセル</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-accent text-white font-bold cursor-pointer transition-colors active:scale-[0.98]">投稿する</button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">最近の引継ぎ</h2>
        {notes.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-6 text-sm">まだ引継ぎはありません</p></Card>
        ) : (
          <div className="space-y-2">
            {notes.slice(0, 20).map((note) => (
              <Card key={note.id}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-primary">{note.guardName}</span>
                    <span className="text-xs text-text-secondary">{note.date}</span>
                  </div>
                  <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminHandoverView() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [notes, setNotes] = useState<HandoverNote[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  function togglePin(id: string, current: boolean) {
    updateHandoverNote(id, { pinned: !current });
    setNotes(getHandoverBySite(selectedSiteId));
    showToast(current ? "ピン止めを解除" : "ピン止めしました", "success");
  }

  useEffect(() => {
    setMounted(true);
    const allSites = getSites();
    setSites(allSites);
    if (allSites.length > 0) setSelectedSiteId(allSites[0].id);
  }, []);

  useEffect(() => {
    if (selectedSiteId) setNotes(getHandoverBySite(selectedSiteId));
  }, [selectedSiteId]);

  if (!mounted) return null;

  const filteredNotes = search.trim()
    ? notes.filter((n) => n.content.includes(search.trim()) || n.guardName.includes(search.trim()))
    : notes;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">引継ぎノート</h1>

      <select
        value={selectedSiteId}
        onChange={(e) => setSelectedSiteId(e.target.value)}
        className={`${inputClasses} appearance-none cursor-pointer`}
      >
        {sites.map((s) => (
          <option key={s.id} value={s.id}>{s.name}（{s.clientName}）</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="内容・警備員名で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={inputClasses}
      />

      <p className="text-sm text-text-secondary">{filteredNotes.length}件の引継ぎ</p>

      {filteredNotes.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-6 text-sm">{search.trim() ? "該当する引継ぎがありません" : "この現場の引継ぎはありません"}</p></Card>
      ) : (
        <div className="space-y-2">
          {filteredNotes.slice(0, 30).map((note) => (
            <Card key={note.id} className={note.pinned ? "!border-warning/30 !bg-warning/5" : ""}>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {note.pinned && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-warning shrink-0">
                        <path d="M16 3l5 5-7 7-1 5-4-4-5 2 1-5-4-4 5-1 7-7 3 2z" />
                      </svg>
                    )}
                    <span className="text-sm font-semibold text-text-primary">{note.guardName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">{note.date}</span>
                  </div>
                  <button
                    onClick={() => togglePin(note.id, !!note.pinned)}
                    className={`text-xs px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      note.pinned ? "text-warning hover:bg-warning/10" : "text-text-secondary hover:text-warning hover:bg-sub-bg"
                    }`}
                    aria-label={note.pinned ? "ピン止めを解除" : "ピン止め"}
                  >
                    {note.pinned ? "解除" : "ピン止め"}
                  </button>
                </div>
                <p className="text-sm text-text-primary whitespace-pre-wrap">{note.content}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
