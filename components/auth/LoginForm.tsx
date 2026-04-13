"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "ログインに失敗しました");
        return;
      }

      if (json.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/employee");
      }
    } catch {
      setServerError("通信エラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1.5">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="w-full px-4 py-2.5 bg-surface-light border border-white/10 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="admin@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1.5">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="w-full px-4 py-2.5 bg-surface-light border border-white/10 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
          {serverError}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        ログイン
      </Button>
    </form>
  );
}
