"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSites } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Site } from "@/lib/types";
import { SITE_TYPE_LABELS } from "@/lib/types";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSites(getSites());
  }, []);

  if (!mounted) return null;

  const filtered = sites.filter(
    (s) =>
      s.name.includes(search) ||
      s.clientName.includes(search) ||
      s.address.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">現場管理</h1>
        <Button href="/sites/new" size="sm">新規登録</Button>
      </div>

      <input
        type="text"
        placeholder="現場名・クライアント名で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
      />

      <p className="text-sm text-text-secondary">{filtered.length}件</p>

      <div className="space-y-2">
        {filtered.map((site) => (
          <Link key={site.id} href={`/sites/${site.id}`}>
            <Card className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary truncate">{site.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    site.status === "active" ? "bg-success/10 text-success" : "bg-sub-bg text-text-secondary"
                  }`}>
                    {site.status === "active" ? "稼働中" : "休止中"}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{site.clientName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                    {SITE_TYPE_LABELS[site.type]}
                  </span>
                  <span className="text-xs text-text-secondary truncate">{site.address}</span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-secondary">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
