"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData, inquiryTypes } from "@/lib/validations";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitError("送信に失敗しました。もう一度お試しください。");
      }
    } catch {
      setSubmitError("送信に失敗しました。もう一度お試しください。");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 rounded-2xl border border-accent/20 bg-card-bg gradient-border">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          お問い合わせありがとうございます
        </h2>
        <p className="text-text-secondary max-w-md mx-auto">
          内容を確認のうえ、担当者より2営業日以内にご連絡いたします。
        </p>
      </div>
    );
  }

  const inputClasses =
    "w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";
  const labelClasses = "block text-sm font-medium text-text-primary mb-2";
  const errorClasses = "text-red-400 text-sm mt-1";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto space-y-6 rounded-2xl border border-border bg-card-bg p-8 sm:p-10"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="companyName" className={labelClasses}>
            会社名
          </label>
          <input
            id="companyName"
            type="text"
            placeholder="例：株式会社サンプル"
            className={inputClasses}
            {...register("companyName")}
          />
        </div>
        <div>
          <label htmlFor="name" className={labelClasses}>
            お名前 <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="例：山田 太郎"
            className={inputClasses}
            {...register("name")}
          />
          {errors.name && (
            <p className={errorClasses}>{errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClasses}>
            電話番号
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="例：011-000-0000"
            className={inputClasses}
            {...register("phone")}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            メールアドレス <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="例：info@example.com"
            className={inputClasses}
            {...register("email")}
          />
          {errors.email && (
            <p className={errorClasses}>{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="inquiryType" className={labelClasses}>
          お問い合わせ種別 <span className="text-red-400">*</span>
        </label>
        <select
          id="inquiryType"
          className={`${inputClasses} appearance-none cursor-pointer`}
          defaultValue=""
          {...register("inquiryType")}
        >
          <option value="" disabled>
            選択してください
          </option>
          {inquiryTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.inquiryType && (
          <p className={errorClasses}>{errors.inquiryType.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className={labelClasses}>
          お問い合わせ内容 <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="ご相談内容をご記入ください"
          className={`${inputClasses} resize-vertical`}
          {...register("message")}
        />
        {errors.message && (
          <p className={errorClasses}>{errors.message.message}</p>
        )}
      </div>

      {submitError && (
        <p className="text-red-400 text-sm text-center">{submitError}</p>
      )}

      <div className="text-center pt-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "送信する"}
        </Button>
      </div>
    </form>
  );
}
