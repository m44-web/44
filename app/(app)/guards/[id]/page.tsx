"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getGuard, updateGuard, getLendingByGuard, getEquipment, returnLending } from "@/lib/store";
import { GuardForm, type GuardFormValues } from "@/components/app/GuardForm";
import { Card } from "@/components/ui/Card";
import type { Guard, EquipmentLending, EquipmentItem } from "@/lib/types";
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_COLORS, EQUIPMENT_CATEGORY_LABELS } from "@/lib/types";

export default function GuardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [guard, setGuard] = useState<Guard | undefined>();
  const [lending, setLending] = useState<EquipmentLending[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuard(getGuard(id));
    setLending(getLendingByGuard(id));
    setEquipment(getEquipment());
  }, [id]);

  if (!mounted) return null;
  if (!guard) {
    return <p className="text-text-secondary py-8 text-center">警備員が見つかりません</p>;
  }

  function handleSubmit(data: GuardFormValues) {
    updateGuard(id, data);
    setGuard({ ...guard!, ...data });
    setEditMode(false);
  }

  function toggleStatus() {
    const newStatus = guard!.status === "active" ? "inactive" : "active";
    updateGuard(id, { status: newStatus });
    setGuard({ ...guard!, status: newStatus });
  }

  function handleReturn(lendingId: string) {
    returnLending(lendingId);
    setLending(getLendingByGuard(id));
  }

  if (editMode) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditMode(false)} className="text-text-secondary hover:text-text-primary cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="text-2xl font-bold">警備員を編集</h1>
        </div>
        <GuardForm
          onSubmit={handleSubmit}
          defaultValues={{
            name: guard.name, nameKana: guard.nameKana, phone: guard.phone, email: guard.email,
            certifications: guard.certifications, licenses: guard.licenses,
            skillLevel: guard.skillLevel, experienceYears: guard.experienceYears, notes: guard.notes,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/guards")} className="text-text-secondary hover:text-text-primary cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="text-2xl font-bold">{guard.name}</h1>
        </div>
        <button onClick={() => setEditMode(true)} className="text-sm px-3 py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 cursor-pointer transition-colors">
          編集
        </button>
      </div>

      {/* Profile card */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${SKILL_LEVEL_COLORS[guard.skillLevel]}`}>
              {SKILL_LEVEL_LABELS[guard.skillLevel]}
            </span>
            {guard.experienceYears > 0 && (
              <span className="text-sm text-text-secondary">経験 {guard.experienceYears}年</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full ${guard.status === "active" ? "bg-success/10 text-success" : "bg-sub-bg text-text-secondary"}`}>
              {guard.status === "active" ? "稼働中" : "休止中"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><span className="text-text-secondary">フリガナ: </span><span className="text-text-primary">{guard.nameKana}</span></div>
            <div><span className="text-text-secondary">電話: </span><a href={`tel:${guard.phone}`} className="text-accent">{guard.phone}</a></div>
            <div><span className="text-text-secondary">メール: </span><span className="text-text-primary">{guard.email}</span></div>
            <div><span className="text-text-secondary">登録日: </span><span className="text-text-primary">{guard.createdAt}</span></div>
          </div>

          {guard.notes && (
            <div className="text-sm"><span className="text-text-secondary">備考: </span><span className="text-text-primary">{guard.notes}</span></div>
          )}
        </div>
      </Card>

      {/* Certifications */}
      {guard.certifications.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-2">警備業務検定</h2>
          <div className="flex flex-wrap gap-2">
            {guard.certifications.map((cert) => (
              <span key={cert} className="text-xs px-2.5 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Licenses */}
      {guard.licenses.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-2">免許・資格</h2>
          <div className="flex flex-wrap gap-2">
            {guard.licenses.map((lic) => (
              <span key={lic} className="text-xs px-2.5 py-1 rounded-lg bg-warning/10 text-warning border border-warning/20">
                {lic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Equipment lending */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-2">貸出中の装備・制服</h2>
        {lending.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">貸出中の装備はありません</p></Card>
        ) : (
          <div className="space-y-1.5">
            {lending.map((item) => {
              const eq = equipment.find((e) => e.id === item.equipmentId);
              return (
                <Card key={item.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{eq?.name ?? "—"}</p>
                    <p className="text-xs text-text-secondary">
                      {eq ? EQUIPMENT_CATEGORY_LABELS[eq.category] : ""} / {item.quantity}点 / 貸出: {item.lentDate}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReturn(item.id)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors shrink-0"
                  >
                    返却
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Status toggle */}
      <div className="pt-2">
        <button
          onClick={toggleStatus}
          className={`w-full text-sm px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
            guard.status === "active"
              ? "border-danger/30 text-danger hover:bg-danger/10"
              : "border-success/30 text-success hover:bg-success/10"
          }`}
        >
          {guard.status === "active" ? "この警備員を休止にする" : "この警備員を稼働にする"}
        </button>
      </div>
    </div>
  );
}
