"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSite, updateSite } from "@/lib/store";
import { SiteForm, type SiteFormValues } from "@/components/app/SiteForm";
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
