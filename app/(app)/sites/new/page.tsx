"use client";

import { useRouter } from "next/navigation";
import { addSite } from "@/lib/store";
import { SiteForm, type SiteFormValues } from "@/components/app/SiteForm";
import { BackButton } from "@/components/ui/BackButton";

export default function NewSitePage() {
  const router = useRouter();

  function handleSubmit(data: SiteFormValues) {
    addSite({ ...data, status: "active" });
    router.push("/sites");
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <BackButton fallbackHref="/sites" label="現場一覧へ" />
      <h1 className="text-2xl font-bold">現場を登録</h1>
      <SiteForm onSubmit={handleSubmit} />
    </div>
  );
}
