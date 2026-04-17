"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSite, updateSite } from "@/lib/store";
import { SiteForm, type SiteFormValues } from "@/components/app/SiteForm";
import { BackButton } from "@/components/ui/BackButton";
import type { Site } from "@/lib/types";

export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [site, setSite] = useState<Site | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSite(getSite(id));
  }, [id]);

  if (!mounted) return null;
  if (!site) {
    return <p className="text-text-secondary py-8 text-center">現場が見つかりません</p>;
  }

  function handleSubmit(data: SiteFormValues) {
    updateSite(id, data);
    router.push("/sites");
  }

  function toggleStatus() {
    const newStatus = site!.status === "active" ? "inactive" : "active";
    updateSite(id, { status: newStatus });
    setSite({ ...site!, status: newStatus });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <BackButton fallbackHref="/sites" label="現場一覧へ" />
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">現場を編集</h1>
        <button
          onClick={toggleStatus}
          className={`text-sm px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
            site.status === "active"
              ? "border-danger/30 text-danger hover:bg-danger/10"
              : "border-success/30 text-success hover:bg-success/10"
          }`}
        >
          {site.status === "active" ? "休止にする" : "稼働にする"}
        </button>
      </div>

      {/* Quick actions */}
      {site.address && (
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            地図で見る
          </a>
          {site.phone && (
            <a
              href={`tel:${site.phone}`}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-success hover:border-success/30 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              電話する
            </a>
          )}
        </div>
      )}
      <SiteForm
        onSubmit={handleSubmit}
        defaultValues={{
          name: site.name,
          clientName: site.clientName,
          address: site.address,
          type: site.type,
          phone: site.phone,
          startDate: site.startDate ?? "",
          endDate: site.endDate ?? "",
          requiredGuards: site.requiredGuards ?? 1,
          requiredCertifications: site.requiredCertifications ?? [],
          notes: site.notes,
        }}
      />
    </div>
  );
}
