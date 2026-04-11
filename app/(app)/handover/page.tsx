"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getHandoverBySite, addHandoverNote, getSites, getGuard, getShiftsByGuard } from "@/lib/store";
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
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="次の人に伝えたいことを書いてください..."
            rows={4}
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
  const [mounted, setMounted] = useState(false);

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

      <p className="text-sm text-text-secondary">{notes.length}件の引継ぎ</p>

      {notes.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-6 text-sm">この現場の引継ぎはありません</p></Card>
      ) : (
        <div className="space-y-2">
          {notes.slice(0, 30).map((note) => (
            <Card key={note.id}>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{note.guardName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">{note.date}</span>
                  </div>
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
