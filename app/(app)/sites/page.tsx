"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSites, getShifts, getGuards } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
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

  function calcProjectDuration(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) return "—";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "終了";
    if (diffDays < 30) return `${diffDays}日`;
    const months = Math.round(diffDays / 30);
    return `約${months}ヶ月`;
  }

  function isProjectEnding(endDate?: string): boolean {
    if (!endDate) return false;
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }

  // Check for sites with insufficient certified guards
  function checkCertificationShortage(site: Site): boolean {
    if (!site.requiredCertifications || site.requiredCertifications.length === 0) return false;
    const siteGuardIds = [...new Set(shifts.filter((s) => s.siteId === site.id && s.status !== "cancelled").map((s) => s.guardId))];
    const certifiedGuards = siteGuardIds.filter((gId) => {
      const guard = guards.find((g) => g.id === gId);
      if (!guard) return false;
      return site.requiredCertifications.some((cert) => guard.certifications.includes(cert));
    });
    return certifiedGuards.length === 0 && siteGuardIds.length > 0;
  }

  const endingSoon = activeSites.filter((s) => isProjectEnding(s.endDate));
  const certShortage = activeSites.filter((s) => checkCertificationShortage(s));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">現場管理</h1>
        <Button href="/sites/new" size="sm">新規登録</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
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
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">工期終了間近</p>
          <p className="text-lg font-bold text-warning">{endingSoon.length}</p>
        </Card>
      </div>

      {/* Alerts */}
      {endingSoon.length > 0 && (
        <Card className="!border-warning/30 !bg-warning/5 !py-3">
          <p className="text-sm font-medium text-warning mb-1">工期終了が近い現場</p>
          <div className="flex flex-wrap gap-1.5">
            {endingSoon.map((s) => (
              <span key={s.id} className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning">
                {s.name}（〜{s.endDate}）
              </span>
            ))}
          </div>
        </Card>
      )}

      {certShortage.length > 0 && (
        <Card className="!border-danger/30 !bg-danger/5 !py-3">
          <p className="text-sm font-medium text-danger mb-1">資格者不足の現場</p>
          <div className="flex flex-wrap gap-1.5">
            {certShortage.map((s) => (
              <span key={s.id} className="text-xs px-2 py-0.5 rounded bg-danger/10 text-danger">
                {s.name}
              </span>
            ))}
          </div>
        </Card>
      )}

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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" /></svg>}
          title={search || filterStatus !== "all" ? "条件に該当する現場がありません" : "現場が登録されていません"}
          description={search || filterStatus !== "all" ? "検索条件を変更してください" : "最初の現場を登録してください"}
          actionLabel={!search && filterStatus === "all" ? "現場を登録" : undefined}
          actionHref={!search && filterStatus === "all" ? "/sites/new" : undefined}
        />
      ) : (
      <div className="space-y-2">
        {filtered.map((site) => {
          const { todayShifts, monthShifts, uniqueGuardCount } = getSiteStats(site.id);
          const hasCertReq = site.requiredCertifications && site.requiredCertifications.length > 0;
          const ending = isProjectEnding(site.endDate);
          return (
            <Link key={site.id} href={`/sites/${site.id}`}>
              <Card className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-primary truncate">{site.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        site.status === "active" ? "bg-success/10 text-success" : "bg-sub-bg text-text-secondary"
                      }`}>
                        {site.status === "active" ? "稼働中" : "休止中"}
                      </span>
                      {ending && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning shrink-0">工期終了間近</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{site.clientName}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-secondary">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent">{SITE_TYPE_LABELS[site.type]}</span>
                  {site.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-text-secondary truncate inline-flex items-center gap-0.5 hover:text-accent"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {site.address}
                    </a>
                  )}
                </div>

                {/* Project duration & requirements */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                  {site.startDate && site.endDate && (
                    <span className="text-text-secondary">
                      工期: <span className="text-text-primary font-medium">{site.startDate} 〜 {site.endDate}</span>
                      <span className="ml-1 text-text-secondary/70">({calcProjectDuration(site.startDate, site.endDate)})</span>
                    </span>
                  )}
                  {site.requiredGuards > 0 && (
                    <span className="text-text-secondary">
                      必要人数: <span className="text-text-primary font-medium">{site.requiredGuards}名</span>
                    </span>
                  )}
                </div>

                {/* Required certifications */}
                {hasCertReq && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-text-secondary mr-1">必要資格:</span>
                    {site.requiredCertifications.map((cert) => (
                      <span key={cert} className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger">{cert}</span>
                    ))}
                  </div>
                )}

                {todayShifts.length > 0 && (
                  <div className="flex items-center gap-2 text-xs bg-success/5 rounded-lg px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-success">
                      本日 {todayShifts.length}/{site.requiredGuards ?? "?"}名配置
                    </span>
                    <span className="text-text-secondary">
                      {todayShifts.map((s) => {
                        const g = guards.find((gg) => gg.id === s.guardId);
                        return g?.name?.split(" ")[0];
                      }).filter(Boolean).join("、")}
                    </span>
                    {todayShifts.length < (site.requiredGuards ?? 0) && (
                      <span className="text-danger font-medium ml-auto">人員不足</span>
                    )}
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
      )}
    </div>
  );
}
