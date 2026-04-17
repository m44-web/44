"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: Props) {
  const [type, setType] = useState<"shifts" | "gps">("shifts");
  const [days, setDays] = useState("30");
  const [userId, setUserId] = useState("");
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  if (open && !loaded) {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((data) => setEmployees(data.employees))
      .catch(() => {});
    setLoaded(true);
  }

  if (!open) return null;

  const params = new URLSearchParams({ type, days });
  if (userId) params.set("userId", userId);
  const url = `/api/export?${params}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="データエクスポート"
    >
      <div
        className="w-full max-w-md bg-surface rounded-xl border border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">データエクスポート</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text text-sm">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="export-type" className="block text-sm text-text-muted mb-1">
              データ種別
            </label>
            <select
              id="export-type"
              value={type}
              onChange={(e) => setType(e.target.value as "shifts" | "gps")}
              className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm"
            >
              <option value="shifts">シフト履歴</option>
              <option value="gps">GPSログ</option>
            </select>
          </div>

          <div>
            <label htmlFor="export-days" className="block text-sm text-text-muted mb-1">
              期間
            </label>
            <select
              id="export-days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm"
            >
              <option value="7">過去7日間</option>
              <option value="14">過去14日間</option>
              <option value="30">過去30日間</option>
              <option value="60">過去60日間</option>
              <option value="90">過去90日間</option>
              <option value="365">過去1年間</option>
            </select>
          </div>

          <div>
            <label htmlFor="export-user" className="block text-sm text-text-muted mb-1">
              従業員（任意）
            </label>
            <select
              id="export-user"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm"
            >
              <option value="">全従業員</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <a href={url} download onClick={onClose}>
              <Button className="w-full">CSVダウンロード</Button>
            </a>
          </div>

          <p className="text-[10px] text-text-muted text-center">
            UTF-8 BOM付きCSV（Excel対応）
          </p>
        </div>
      </div>
    </div>
  );
}
