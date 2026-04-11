"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGuards } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Guard } from "@/lib/types";

export default function GuardsPage() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards());
  }, []);

  if (!mounted) return null;

  const filtered = guards.filter(
    (g) =>
      g.name.includes(search) ||
      g.nameKana.includes(search) ||
      g.phone.includes(search) ||
      g.email.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">警備員管理</h1>
        <Button href="/guards/new" size="sm">新規登録</Button>
      </div>

      <input
        type="text"
        placeholder="名前・電話番号で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
      />

      <p className="text-sm text-text-secondary">{filtered.length}名</p>

      <div className="space-y-2">
        {filtered.map((guard) => (
          <Link key={guard.id} href={`/guards/${guard.id}`}>
            <Card className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary">{guard.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    guard.status === "active" ? "bg-success/10 text-success" : "bg-sub-bg text-text-secondary"
                  }`}>
                    {guard.status === "active" ? "稼働中" : "休止中"}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{guard.phone}</p>
                {guard.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {guard.certifications.map((cert) => (
                      <span key={cert} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
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
