"use client";

import { useState } from "react";
import { SITE_TYPE_LABELS, CERTIFICATION_OPTIONS } from "@/lib/types";
import type { Site } from "@/lib/types";

export type SiteFormValues = {
  name: string;
  clientName: string;
  address: string;
  type: Site["type"];
  phone: string;
  startDate: string;
  endDate: string;
  requiredGuards: number;
  requiredCertifications: string[];
  notes: string;
};

type SiteFormProps = {
  onSubmit: (data: SiteFormValues) => void;
  defaultValues?: SiteFormValues;
};

const inputClasses =
  "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
const labelClasses = "block text-sm font-medium text-text-primary mb-1.5";

export function SiteForm({ onSubmit, defaultValues }: SiteFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [clientName, setClientName] = useState(defaultValues?.clientName ?? "");
  const [address, setAddress] = useState(defaultValues?.address ?? "");
  const [type, setType] = useState<Site["type"]>(defaultValues?.type ?? "facility");
  const [phone, setPhone] = useState(defaultValues?.phone ?? "");
  const [startDate, setStartDate] = useState(defaultValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(defaultValues?.endDate ?? "");
  const [requiredGuards, setRequiredGuards] = useState(defaultValues?.requiredGuards ?? 1);
  const [requiredCerts, setRequiredCerts] = useState<string[]>(defaultValues?.requiredCertifications ?? []);
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleCert(cert: string) {
    setRequiredCerts((prev) => prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "現場名を入力してください";
    if (!clientName.trim()) errs.clientName = "クライアント名を入力してください";
    if (!address.trim()) errs.address = "住所を入力してください";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      name: name.trim(), clientName: clientName.trim(), address: address.trim(), type, phone: phone.trim(),
      startDate, endDate, requiredGuards, requiredCertifications: requiredCerts, notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card-bg border border-border rounded-xl p-5 sm:p-6 space-y-4">
      <div>
        <label htmlFor="name" className={labelClasses}>
          現場名 <span className="text-danger">*</span>
        </label>
        <input id="name" type="text" placeholder="ABCモール 常駐警備" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
        {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="clientName" className={labelClasses}>
            クライアント名 <span className="text-danger">*</span>
          </label>
          <input id="clientName" type="text" placeholder="株式会社サンプル" value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClasses} />
          {errors.clientName && <p className="text-danger text-sm mt-1">{errors.clientName}</p>}
        </div>
        <div>
          <label htmlFor="type" className={labelClasses}>警備種別</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as Site["type"])} className={`${inputClasses} appearance-none cursor-pointer`}>
            {Object.entries(SITE_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="address" className={labelClasses}>
          住所 <span className="text-danger">*</span>
        </label>
        <input id="address" type="text" placeholder="東京都新宿区..." value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} />
        {errors.address && <p className="text-danger text-sm mt-1">{errors.address}</p>}
      </div>

      <div>
        <label htmlFor="phone" className={labelClasses}>電話番号</label>
        <input id="phone" type="tel" placeholder="03-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
      </div>

      {/* Project duration */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={labelClasses}>工期開始日</label>
          <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="endDate" className={labelClasses}>工期終了日</label>
          <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClasses} />
        </div>
      </div>

      {/* Required guards */}
      <div>
        <label htmlFor="requiredGuards" className={labelClasses}>必要配置人数</label>
        <input id="requiredGuards" type="number" min="1" max="100" value={requiredGuards} onChange={(e) => setRequiredGuards(Number(e.target.value))} className={inputClasses} />
        <p className="text-[10px] text-text-secondary mt-1">この現場に必要な1日あたりの最低配置人数</p>
      </div>

      {/* Required certifications */}
      <div>
        <label className={labelClasses}>必要資格</label>
        <p className="text-[10px] text-text-secondary mb-2">この現場に配置する警備員に必要な資格を選択</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CERTIFICATION_OPTIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-sub-bg cursor-pointer transition-colors">
              <input type="checkbox" checked={requiredCerts.includes(cert)} onChange={() => toggleCert(cert)} className="accent-accent w-4 h-4" />
              <span className="text-sm text-text-primary">{cert}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClasses}>備考</label>
        <textarea id="notes" rows={3} placeholder="特記事項があれば入力" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClasses} resize-vertical`} />
      </div>

      <div className="pt-2">
        <button type="submit" className="w-full bg-accent text-white font-semibold rounded-lg px-4 py-3 hover:bg-accent-dark transition-colors cursor-pointer">
          {defaultValues ? "更新する" : "登録する"}
        </button>
      </div>
    </form>
  );
}
