"use client";

import { useRouter } from "next/navigation";
import { addGuard } from "@/lib/store";
import { GuardForm, type GuardFormValues } from "@/components/app/GuardForm";

export default function NewGuardPage() {
  const router = useRouter();

  function handleSubmit(data: GuardFormValues) {
    addGuard({
      name: data.name,
      nameKana: data.nameKana,
      phone: data.phone,
      email: data.email,
      certifications: data.certifications,
      status: "active",
    });
    router.push("/guards");
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">警備員を登録</h1>
      <GuardForm onSubmit={handleSubmit} />
    </div>
  );
}
