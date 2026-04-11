"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getGuard, updateGuard } from "@/lib/store";
import { GuardForm, type GuardFormValues } from "@/components/app/GuardForm";
import type { Guard } from "@/lib/types";

export default function GuardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [guard, setGuard] = useState<Guard | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuard(getGuard(id));
  }, [id]);

  if (!mounted) return null;
  if (!guard) {
    return <p className="text-text-secondary py-8 text-center">警備員が見つかりません</p>;
  }

  function handleSubmit(data: GuardFormValues) {
    updateGuard(id, {
      name: data.name,
      nameKana: data.nameKana,
      phone: data.phone,
      email: data.email,
      certifications: data.certifications,
    });
    router.push("/guards");
  }

  function toggleStatus() {
    const newStatus = guard!.status === "active" ? "inactive" : "active";
    updateGuard(id, { status: newStatus });
    setGuard({ ...guard!, status: newStatus });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">警備員を編集</h1>
        <button
          onClick={toggleStatus}
          className={`text-sm px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
            guard.status === "active"
              ? "border-danger/30 text-danger hover:bg-danger/10"
              : "border-success/30 text-success hover:bg-success/10"
          }`}
        >
          {guard.status === "active" ? "休止にする" : "稼働にする"}
        </button>
      </div>
      <GuardForm
        onSubmit={handleSubmit}
        defaultValues={{
          name: guard.name,
          nameKana: guard.nameKana,
          phone: guard.phone,
          email: guard.email,
          certifications: guard.certifications,
        }}
      />
    </div>
  );
}
