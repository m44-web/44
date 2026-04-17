"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

const schema = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
    newPassword: z.string().min(6, "新しいパスワードは6文字以上必要です"),
    confirmPassword: z.string().min(1, "確認のため再入力してください"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "確認用パスワードが一致しません",
    path: ["confirmPassword"],
  });

type Input = z.infer<typeof schema>;

export function SettingsPanel({
  userName,
  userEmail,
  userRole,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
}) {
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Input>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Input) => {
    setServerError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(json.error || "変更に失敗しました");
        return;
      }
      setSuccessMsg("パスワードを変更しました");
      reset();
    } catch {
      setServerError("通信エラーが発生しました");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const backLink = userRole === "admin" ? "/admin" : "/employee";

  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-white/10">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href={backLink} className="text-text-muted hover:text-text text-sm">
              ← 戻る
            </Link>
            <h1 className="font-semibold">設定</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-sm">
            ログアウト
          </Button>
        </Container>
      </header>

      <Container className="py-6 space-y-6 max-w-2xl">
        <Card>
          <h2 className="font-semibold mb-4">アカウント情報</h2>
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-text-muted">名前</dt>
            <dd>{userName}</dd>
            <dt className="text-text-muted">メール</dt>
            <dd>{userEmail}</dd>
            <dt className="text-text-muted">権限</dt>
            <dd>{userRole === "admin" ? "管理者" : "従業員"}</dd>
          </dl>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">パスワード変更</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">
                現在のパスワード
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register("currentPassword")}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-danger">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">
                新しいパスワード
              </label>
              <input
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-danger">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                {serverError}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm">
                {successMsg}
              </div>
            )}

            <Button type="submit" loading={isSubmitting}>
              変更する
            </Button>
          </form>
        </Card>
      </Container>
    </div>
  );
}
