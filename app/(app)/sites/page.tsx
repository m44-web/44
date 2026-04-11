"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSites, getShifts, getGuards } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Site, Shift, Guard } from "@/lib/types";
import { SITE_TYPE_LABELS } from "@/lib/types";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSites(getSites());
    setShifts(getShifts());
    setGuards(getGuards());
  }, []);

  if (!mounted) return null;

  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);
  const activeSites = sites.filter((s) => s.status === "active");

  const filtered = sites.filter((s) => {
    const matchSearch = s.name.includes(search) || s.clientName.includes(search) || s.address.includes(search);
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function getSiteStats(siteId: string) {
    const siteShifts = shifts.filter((s) => s.siteId === siteId);
    const todayShifts = siteShifts.filter((s) => s.date === today && s.status !== "cancelled");
    const monthShifts = siteShifts.filter((s) => s.date.startsWith(thisMonth) && s.status !== "cancelled");
    const uniqueGuards = new Set(siteShifts.map((s) => s.guardId));
    return { todayShifts, monthShifts, uniqueGuardCount: uniqueGuards.size };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">現場管理</h1>
        <Button href="/sites/new" size="sm">新規登録</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">全現場</p>
          <p className="text-lg font-bold text-text-primary">{sites.length}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">稼働中</p>
          <p className="text-lg font-bold text-success">{activeSites.length}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">本日配置</p>
          <p className="text-lg font-bold text-accent">{sites.filter((s) => shifts.some((sh) => sh.siteId === s.id && sh.date === today && sh.status !== "cancelled")).length}</p>
        </Card>
      </div>

      <input
        type="text"
        placeholder="現場名・クライアント名・住所で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
      />

      <div className="flex items-center gap-2">
        {(["all", "active", "inactive"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
              filterStatus === s ? "bg-accent text-white" : "bg-sub-bg text-text-secondary hover:text-text-primary"
            }`}
          >
            {s === "all" ? "すべて" : s === "active" ? "稼働中" : "休止中"}
          </button>
        ))}
        <span className="text-sm text-text-secondary ml-auto">{filtered.length}件</span>
      </div>

      <div className="space-y-2">
        {filtered.map((site) => {
          const { todayShifts, monthShifts, uniqueGuardCount } = getSiteStats(site.id);
          return (
            <Link key={site.id} href={`/sites/${site.id}`}>
              <Card className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-primary truncate">{site.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        site.status === "active" ? "bg-success/10 text-success" : "bg-sub-bg text-text-secondary"
                      }`}>
                        {site.status === "active" ? "稼働中" : "休止中"}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{site.clientName}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-secondary">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent">{SITE_TYPE_LABELS[site.type]}</span>
                  <span className="text-text-secondary truncate">{site.address}</span>
                </div>

                {todayShifts.length > 0 && (
                  <div className="flex items-center gap-2 text-xs bg-success/5 rounded-lg px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-success">本日 {todayShifts.length}名配置</span>
                    <span className="text-text-secondary">
                      {todayShifts.map((s) => {
                        const g = guards.find((gg) => gg.id === s.guardId);
                        return g?.name?.split(" ")[0];
                      }).filter(Boolean).join("、")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                  <span>今月シフト: <span className="text-text-primary font-medium">{monthShifts.length}件</span></span>
                  <span>配置警備員: <span className="text-text-primary font-medium">{uniqueGuardCount}名</span></span>
                  {site.phone && <span>{site.phone}</span>}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
