"use client";

import { useState } from "react";
import { CERTIFICATION_OPTIONS } from "@/lib/types";

export type GuardFormValues = {
  name: string;
  nameKana: string;
  phone: string;
  email: string;
  certifications: string[];
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
    onSubmit({ name: name.trim(), nameKana: nameKana.trim(), phone: phone.trim(), email: email.trim(), certifications: certs });
  }

  function toggleCert(cert: string) {
    setCerts((prev) => prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card-bg border border-border rounded-xl p-5 sm:p-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClasses}>
            氏名 <span className="text-danger">*</span>
          </label>
          <input id="name" type="text" placeholder="山田 太郎" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
          {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="nameKana" className={labelClasses}>
            フリガナ <span className="text-danger">*</span>
          </label>
          <input id="nameKana" type="text" placeholder="ヤマダ タロウ" value={nameKana} onChange={(e) => setNameKana(e.target.value)} className={inputClasses} />
          {errors.nameKana && <p className="text-danger text-sm mt-1">{errors.nameKana}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClasses}>
            電話番号 <span className="text-danger">*</span>
          </label>
          <input id="phone" type="tel" placeholder="090-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
          {errors.phone && <p className="text-danger text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            メールアドレス <span className="text-danger">*</span>
          </label>
          <input id="email" type="email" placeholder="example@lsecurity.jp" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
          {errors.email && <p className="text-danger text-sm mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className={labelClasses}>資格</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CERTIFICATION_OPTIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-sub-bg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={certs.includes(cert)}
                onChange={() => toggleCert(cert)}
                className="accent-accent w-4 h-4"
              />
              <span className="text-sm text-text-primary">{cert}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2 flex gap-3">
        <button type="submit" className="flex-1 bg-accent text-white font-semibold rounded-lg px-4 py-3 hover:bg-accent-dark transition-colors cursor-pointer">
          {defaultValues ? "更新する" : "登録する"}
        </button>
      </div>
    </form>
  );
}
