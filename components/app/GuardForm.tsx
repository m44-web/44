"use client";

import { useState } from "react";
import { CERTIFICATION_OPTIONS, LICENSE_OPTIONS, SKILL_LEVEL_LABELS, SHIFT_PREFERENCE_LABELS, TRAINING_STATUS_LABELS } from "@/lib/types";
import type { SkillLevel, ShiftPreference, TrainingStatus } from "@/lib/types";

export type GuardFormValues = {
  name: string;
  nameKana: string;
  phone: string;
  email: string;
  certifications: string[];
  licenses: string[];
  skillLevel: SkillLevel;
  experienceYears: number;
  hourlyRate: number;
  nightHourlyRate: number;
  shiftPreference: ShiftPreference;
  trainingStatus: TrainingStatus;
  notes: string;
};

type GuardFormProps = {
  onSubmit: (data: GuardFormValues) => void;
  defaultValues?: GuardFormValues;
};

const inputClasses =
  "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
const labelClasses = "block text-sm font-medium text-text-primary mb-1.5";

export function GuardForm({ onSubmit, defaultValues }: GuardFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [nameKana, setNameKana] = useState(defaultValues?.nameKana ?? "");
  const [phone, setPhone] = useState(defaultValues?.phone ?? "");
  const [email, setEmail] = useState(defaultValues?.email ?? "");
  const [certs, setCerts] = useState<string[]>(defaultValues?.certifications ?? []);
  const [licenses, setLicenses] = useState<string[]>(defaultValues?.licenses ?? []);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(defaultValues?.skillLevel ?? "beginner");
  const [experienceYears, setExperienceYears] = useState(defaultValues?.experienceYears ?? 0);
  const [hourlyRate, setHourlyRate] = useState(defaultValues?.hourlyRate ?? 1000);
  const [nightHourlyRate, setNightHourlyRate] = useState(defaultValues?.nightHourlyRate ?? 1250);
  const [shiftPreference, setShiftPreference] = useState<ShiftPreference>(defaultValues?.shiftPreference ?? "any");
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>(defaultValues?.trainingStatus ?? "none");
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "名前を入力してください";
    if (!nameKana.trim()) errs.nameKana = "フリガナを入力してください";
    if (!phone.trim()) errs.phone = "電話番号を入力してください";
    if (!email.trim()) errs.email = "メールアドレスを入力してください";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      name: name.trim(), nameKana: nameKana.trim(), phone: phone.trim(), email: email.trim(),
      certifications: certs, licenses, skillLevel, experienceYears, hourlyRate, nightHourlyRate, shiftPreference, trainingStatus, notes: notes.trim(),
    });
  }

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((c) => c !== item) : [...list, item]);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card-bg border border-border rounded-xl p-5 sm:p-6 space-y-5">
      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClasses}>氏名 <span className="text-danger">*</span></label>
          <input id="name" type="text" placeholder="山田 太郎" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
          {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="nameKana" className={labelClasses}>フリガナ <span className="text-danger">*</span></label>
          <input id="nameKana" type="text" placeholder="ヤマダ タロウ" value={nameKana} onChange={(e) => setNameKana(e.target.value)} className={inputClasses} />
          {errors.nameKana && <p className="text-danger text-sm mt-1">{errors.nameKana}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClasses}>電話番号 <span className="text-danger">*</span></label>
          <input id="phone" type="tel" placeholder="090-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
          {errors.phone && <p className="text-danger text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>メールアドレス <span className="text-danger">*</span></label>
          <input id="email" type="email" placeholder="example@lsecurity.jp" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
          {errors.email && <p className="text-danger text-sm mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Skill & Experience */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="skillLevel" className={labelClasses}>熟練度</label>
          <select id="skillLevel" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value as SkillLevel)} className={`${inputClasses} appearance-none cursor-pointer`}>
            {Object.entries(SKILL_LEVEL_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="experienceYears" className={labelClasses}>経験年数</label>
          <input id="experienceYears" type="number" min="0" max="50" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} className={inputClasses} />
        </div>
      </div>

      {/* Shift preference */}
      <div>
        <label className={labelClasses}>勤務希望</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(SHIFT_PREFERENCE_LABELS) as [ShiftPreference, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setShiftPreference(key)}
              className={`py-3 rounded-lg text-sm font-medium cursor-pointer transition-colors border ${
                shiftPreference === key
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-text-secondary hover:border-accent/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Training status */}
      <div>
        <label htmlFor="trainingStatus" className={labelClasses}>研修・教育状態</label>
        <select id="trainingStatus" value={trainingStatus} onChange={(e) => setTrainingStatus(e.target.value as TrainingStatus)} className={`${inputClasses} appearance-none cursor-pointer`}>
          {(Object.entries(TRAINING_STATUS_LABELS) as [TrainingStatus, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Hourly rates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hourlyRate" className={labelClasses}>日勤時給（円）</label>
          <input id="hourlyRate" type="number" min="0" step="50" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="nightHourlyRate" className={labelClasses}>夜勤時給（円）</label>
          <input id="nightHourlyRate" type="number" min="0" step="50" value={nightHourlyRate} onChange={(e) => setNightHourlyRate(Number(e.target.value))} className={inputClasses} />
          <p className="text-[10px] text-text-secondary mt-1">22:00〜5:00は深夜割増が適用されます</p>
        </div>
      </div>

      {/* Certifications */}
      <div>
        <label className={labelClasses}>警備業務検定</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CERTIFICATION_OPTIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-sub-bg cursor-pointer transition-colors">
              <input type="checkbox" checked={certs.includes(cert)} onChange={() => toggleItem(certs, setCerts, cert)} className="accent-accent w-4 h-4" />
              <span className="text-sm text-text-primary">{cert}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Licenses */}
      <div>
        <label className={labelClasses}>免許・資格</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LICENSE_OPTIONS.map((lic) => (
            <label key={lic} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-sub-bg cursor-pointer transition-colors">
              <input type="checkbox" checked={licenses.includes(lic)} onChange={() => toggleItem(licenses, setLicenses, lic)} className="accent-warning w-4 h-4" />
              <span className="text-sm text-text-primary">{lic}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClasses}>備考</label>
        <textarea id="notes" rows={2} placeholder="特記事項" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClasses} resize-vertical`} />
      </div>

      <div className="pt-2">
        <button type="submit" className="w-full bg-accent text-white font-semibold rounded-lg px-4 py-3 hover:bg-accent-dark transition-colors cursor-pointer">
          {defaultValues ? "更新する" : "登録する"}
        </button>
      </div>
    </form>
  );
}
