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
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
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

  function lentGuards(eqId: string) {
    return activeLending.filter((l) => l.equipmentId === eqId).map((l) => {
      const guard = guards.find((g) => g.id === l.guardId);
      return { ...l, guardName: guard?.name ?? "—" };
    });
  }

  const totalStock = equipment.reduce((sum, eq) => sum + eq.totalStock, 0);
  const totalLent = activeLending.reduce((sum, l) => sum + l.quantity, 0);
  const lowStockItems = equipment.filter((eq) => {
    const available = eq.totalStock - lentCount(eq.id);
    return available <= 2;
  });

  const LONG_TERM_THRESHOLD_DAYS = 60;
  const longTermLendings = activeLending.map((l) => {
    const days = Math.floor((Date.now() - new Date(l.lentDate).getTime()) / (1000 * 60 * 60 * 24));
    return { lending: l, days };
  }).filter((x) => x.days >= LONG_TERM_THRESHOLD_DAYS);

  const filteredEquipment = equipment.filter((eq) => {
    if (filterCategory !== "all" && eq.category !== filterCategory) return false;
    if (search.trim() && !eq.name.includes(search.trim()) && !(eq.notes ?? "").includes(search.trim())) return false;
    return true;
  });

  const categories = Object.entries(EQUIPMENT_CATEGORY_LABELS);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">装備・制服管理</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowLend(true)} className="text-sm px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark cursor-pointer transition-colors">貸出</button>
          <button onClick={() => setShowAddItem(true)} className="text-sm px-3 py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 cursor-pointer transition-colors">装備追加</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">装備種類</p>
          <p className="text-lg font-bold text-text-primary">{equipment.length}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">総在庫</p>
          <p className="text-lg font-bold text-accent">{totalStock}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">貸出中</p>
          <p className="text-lg font-bold text-warning">{totalLent}</p>
        </Card>
        <Card className="text-center !py-2.5">
          <p className="text-[10px] text-text-secondary">在庫少</p>
          <p className="text-lg font-bold text-danger">{lowStockItems.length}</p>
        </Card>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <Card className="!border-danger/30 !bg-danger/5 !py-3">
          <p className="text-sm font-medium text-danger mb-1">在庫不足の装備</p>
          <div className="flex flex-wrap gap-1.5">
            {lowStockItems.map((eq) => {
              const available = eq.totalStock - lentCount(eq.id);
              return (
                <span key={eq.id} className="text-xs px-2 py-0.5 rounded bg-danger/10 text-danger">
                  {eq.name}（残{available}）
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* Long term lending alert */}
      {longTermLendings.length > 0 && (
        <Card className="!border-warning/30 !bg-warning/5 !py-3">
          <p className="text-sm font-medium text-warning mb-1">長期貸出の装備（{LONG_TERM_THRESHOLD_DAYS}日以上）</p>
          <div className="flex flex-wrap gap-1.5">
            {longTermLendings.map(({ lending: l, days }) => {
              const eq = equipment.find((e) => e.id === l.equipmentId);
              const guard = guards.find((g) => g.id === l.guardId);
              return (
                <span key={l.id} className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning">
                  {eq?.name ?? "—"} / {guard?.name ?? "—"}（{days}日）
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="装備名・備考で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={inputClasses}
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilterCategory("all")}
          className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
            filterCategory === "all" ? "bg-accent text-white" : "bg-sub-bg text-text-secondary hover:text-text-primary"
          }`}
        >
          すべて
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(key)}
            className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
              filterCategory === key ? "bg-accent text-white" : "bg-sub-bg text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Equipment list */}
      <div className="space-y-2">
        {filteredEquipment.map((item) => {
          const lent = lentCount(item.id);
          const available = item.totalStock - lent;
          const lentDetails = lentGuards(item.id);
          return (
            <Card key={item.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary">{item.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{EQUIPMENT_CATEGORY_LABELS[item.category]}</span>
                  </div>
                  {item.notes && <p className="text-xs text-text-secondary mt-0.5">{item.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm">
                    <span className={`font-bold ${available <= 0 ? "text-danger" : available <= 3 ? "text-warning" : "text-success"}`}>{available}</span>
                    <span className="text-text-secondary">/{item.totalStock}</span>
                  </p>
                  <p className="text-[10px] text-text-secondary">在庫/全数</p>
                </div>
              </div>

              {/* Stock bar */}
              <div className="w-full h-2 bg-sub-bg rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    available <= 0 ? "bg-danger" : available <= 3 ? "bg-warning" : "bg-success"
                  }`}
                  style={{ width: `${(available / item.totalStock) * 100}%` }}
                />
              </div>

              {/* Who has them */}
              {lentDetails.length > 0 && (
                <div className="text-xs text-text-secondary">
                  <p className="mb-1">貸出先:</p>
                  <div className="flex flex-wrap gap-1">
                    {lentDetails.map((d) => (
                      <span key={d.id} className="px-2 py-0.5 rounded bg-sub-bg text-text-primary">
                        {d.guardName}（{d.quantity}点・{d.lentDate}）
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Active lending list */}
      <div>
        <h2 className="text-lg font-semibold mb-2">貸出中一覧（{activeLending.length}件）</h2>
        {activeLending.length === 0 ? (
          <Card><p className="text-text-secondary text-center py-4 text-sm">貸出中の装備はありません</p></Card>
        ) : (
          <div className="space-y-1.5">
            {activeLending.map((item) => {
              const eq = equipment.find((e) => e.id === item.equipmentId);
              const guard = guards.find((g) => g.id === item.guardId);
              const daysSinceLent = Math.floor((Date.now() - new Date(item.lentDate).getTime()) / (1000 * 60 * 60 * 24));
              const isLongTerm = daysSinceLent >= LONG_TERM_THRESHOLD_DAYS;
              return (
                <Card key={item.id} className={`flex items-center justify-between gap-3 !py-3 ${isLongTerm ? "!border-warning/30 !bg-warning/5" : ""}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-text-primary">{eq?.name ?? "—"}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{eq ? EQUIPMENT_CATEGORY_LABELS[eq.category] : ""}</span>
                      {isLongTerm && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">長期貸出</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">
                      {guard?.name ?? "—"} / {item.quantity}点 / {item.lentDate}〜（{daysSinceLent}日間）
                    </p>
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
        <LendModal equipment={equipment} guards={guards.filter((g) => g.status === "active")} activeLending={activeLending} onClose={() => setShowLend(false)} onDone={() => { setShowLend(false); refresh(); }} />
      )}
    </div>
  );
}

function AddEquipmentModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentItem["category"]>("uniform");
  const [totalStock, setTotalStock] = useState(1);
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addEquipment({ name: name.trim(), category, totalStock, notes: notes.trim() });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-card-bg border border-border rounded-t-xl sm:rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold">装備を追加</h2>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">品名 <span className="text-danger">*</span></label>
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
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">備考</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="用途・仕様など" className={inputClasses} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:bg-sub-bg cursor-pointer transition-colors">キャンセル</button>
          <button type="submit" className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark cursor-pointer transition-colors">追加</button>
        </div>
      </form>
    </div>
  );
}

function LendModal({ equipment, guards, activeLending, onClose, onDone }: {
  equipment: EquipmentItem[]; guards: Guard[]; activeLending: EquipmentLending[];
  onClose: () => void; onDone: () => void;
}) {
  const [equipmentId, setEquipmentId] = useState("");
  const [guardId, setGuardId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const selectedEquip = equipment.find((e) => e.id === equipmentId);
  const lentCount = selectedEquip
    ? activeLending.filter((l) => l.equipmentId === equipmentId).reduce((sum, l) => sum + l.quantity, 0)
    : 0;
  const available = selectedEquip ? selectedEquip.totalStock - lentCount : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!equipmentId || !guardId || quantity > available) return;
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
            {equipment.map((eq) => {
              const eqLent = activeLending.filter((l) => l.equipmentId === eq.id).reduce((sum, l) => sum + l.quantity, 0);
              const eqAvail = eq.totalStock - eqLent;
              return (
                <option key={eq.id} value={eq.id} disabled={eqAvail <= 0}>
                  {eq.name}（残{eqAvail}/{eq.totalStock}）
                </option>
              );
            })}
          </select>
          {selectedEquip && (
            <p className="text-xs text-text-secondary mt-1">
              在庫: <span className={available <= 0 ? "text-danger" : available <= 3 ? "text-warning" : "text-success"}>{available}</span>/{selectedEquip.totalStock}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">警備員</label>
          <select value={guardId} onChange={(e) => setGuardId(e.target.value)} className={`${inputClasses} appearance-none cursor-pointer`} required>
            <option value="">選択してください</option>
            {guards.map((g) => (
              <option key={g.id} value={g.id}>{g.name}（{g.nameKana}）</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">数量（最大{available}）</label>
          <input type="number" min="1" max={available} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={inputClasses} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:bg-sub-bg cursor-pointer transition-colors">キャンセル</button>
          <button type="submit" disabled={!equipmentId || !guardId || quantity > available || available <= 0} className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark cursor-pointer transition-colors disabled:opacity-40">貸出する</button>
        </div>
      </form>
    </div>
  );
}
