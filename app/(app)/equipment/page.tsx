"use client";

import { useState, useEffect } from "react";
import { getEquipment, getLending, getGuards, addEquipment, addLending } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { EquipmentItem, EquipmentLending, Guard } from "@/lib/types";
import { EQUIPMENT_CATEGORY_LABELS } from "@/lib/types";

const inputClasses =
  "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [lending, setLending] = useState<EquipmentLending[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showLend, setShowLend] = useState(false);
  const [mounted, setMounted] = useState(false);

  function refresh() {
    setEquipment(getEquipment());
    setLending(getLending());
    setGuards(getGuards());
  }

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  if (!mounted) return null;

  const activeLending = lending.filter((l) => !l.returnDate);

  function lentCount(eqId: string) {
    return activeLending.filter((l) => l.equipmentId === eqId).reduce((sum, l) => sum + l.quantity, 0);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">装備・制服管理</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowLend(true)} className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark cursor-pointer transition-colors">貸出</button>
          <button onClick={() => setShowAddItem(true)} className="text-sm px-3 py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 cursor-pointer transition-colors">装備追加</button>
        </div>
      </div>

      {/* Equipment list */}
      <div className="space-y-2">
        {equipment.map((item) => {
          const lent = lentCount(item.id);
          const available = item.totalStock - lent;
          return (
            <Card key={item.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-text-primary">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{EQUIPMENT_CATEGORY_LABELS[item.category]}</span>
                  {item.notes && <span className="text-xs text-text-secondary">{item.notes}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm">
                  <span className={`font-bold ${available <= 0 ? "text-danger" : available <= 3 ? "text-warning" : "text-success"}`}>{available}</span>
                  <span className="text-text-secondary">/{item.totalStock}</span>
                </p>
                <p className="text-[10px] text-text-secondary">在庫/全数</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active lending */}
      <div>
        <h2 className="text-lg font-semibold mb-2">貸出中一覧</h2>
        {activeLending.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">貸出中の装備はありません</p></Card>
        ) : (
          <div className="space-y-1.5">
            {activeLending.map((item) => {
              const eq = equipment.find((e) => e.id === item.equipmentId);
              const guard = guards.find((g) => g.id === item.guardId);
              return (
                <Card key={item.id} className="flex items-center justify-between gap-3 !py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{eq?.name ?? "—"}</p>
                    <p className="text-xs text-text-secondary">{guard?.name ?? "—"} / {item.quantity}点 / {item.lentDate}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add equipment modal */}
      {showAddItem && (
        <AddEquipmentModal onClose={() => setShowAddItem(false)} onDone={() => { setShowAddItem(false); refresh(); }} />
      )}

      {/* Lend equipment modal */}
      {showLend && (
        <LendModal equipment={equipment} guards={guards.filter((g) => g.status === "active")} onClose={() => setShowLend(false)} onDone={() => { setShowLend(false); refresh(); }} />
      )}
    </div>
  );
}

function AddEquipmentModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentItem["category"]>("uniform");
  const [totalStock, setTotalStock] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addEquipment({ name: name.trim(), category, totalStock, notes: "" });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-card-bg border border-border rounded-t-xl sm:rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold">装備を追加</h2>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">品名</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ヘルメット" className={inputClasses} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">カテゴリ</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as EquipmentItem["category"])} className={`${inputClasses} appearance-none cursor-pointer`}>
              {Object.entries(EQUIPMENT_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">総数</label>
            <input type="number" min="1" value={totalStock} onChange={(e) => setTotalStock(Number(e.target.value))} className={inputClasses} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:bg-sub-bg cursor-pointer transition-colors">キャンセル</button>
          <button type="submit" className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark cursor-pointer transition-colors">追加</button>
        </div>
      </form>
    </div>
  );
}

function LendModal({ equipment, guards, onClose, onDone }: { equipment: EquipmentItem[]; guards: Guard[]; onClose: () => void; onDone: () => void }) {
  const [equipmentId, setEquipmentId] = useState("");
  const [guardId, setGuardId] = useState("");
  const [quantity, setQuantity] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!equipmentId || !guardId) return;
    addLending({
      equipmentId, guardId, quantity,
      lentDate: new Date().toISOString().split("T")[0],
      returnDate: null, condition: "good", notes: "",
    });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-card-bg border border-border rounded-t-xl sm:rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold">装備を貸出</h2>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">装備</label>
          <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className={`${inputClasses} appearance-none cursor-pointer`} required>
            <option value="">選択してください</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">警備員</label>
          <select value={guardId} onChange={(e) => setGuardId(e.target.value)} className={`${inputClasses} appearance-none cursor-pointer`} required>
            <option value="">選択してください</option>
            {guards.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">数量</label>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={inputClasses} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:bg-sub-bg cursor-pointer transition-colors">キャンセル</button>
          <button type="submit" className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark cursor-pointer transition-colors">貸出する</button>
        </div>
      </form>
    </div>
  );
}
