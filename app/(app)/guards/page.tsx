"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGuards } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Guard } from "@/lib/types";
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_COLORS } from "@/lib/types";

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
        <h1 className="text-2xl font-bold">警備員名簿</h1>
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
            <Card className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{guard.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                    guard.status === "active" ? "bg-success/10 text-success" : "bg-sub-bg text-text-secondary"
                  }`}>
                    {guard.status === "active" ? "稼働中" : "休止中"}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-text-secondary">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium ${SKILL_LEVEL_COLORS[guard.skillLevel]}`}>
                  {SKILL_LEVEL_LABELS[guard.skillLevel]}
                </span>
                {guard.experienceYears > 0 && (
                  <span className="text-text-secondary">経験{guard.experienceYears}年</span>
                )}
                <span className="text-text-secondary">{guard.phone}</span>
              </div>

              {(guard.certifications.length > 0 || guard.licenses.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {guard.certifications.map((cert) => (
                    <span key={cert} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                      {cert}
                    </span>
                  ))}
                  {guard.licenses.map((lic) => (
                    <span key={lic} className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning">
                      {lic}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
