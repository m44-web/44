"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const success = login(email, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("メールアドレスが見つかりません");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-accent">L</span>security
          </h1>
          <p className="text-text-secondary mt-2 text-sm">警備員管理システム</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card-bg border border-border rounded-xl p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lsecurity.jp"
              required
              className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1.5">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              className="w-full rounded-lg border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-accent text-white font-semibold rounded-lg px-4 py-3 hover:bg-accent-dark transition-colors cursor-pointer"
          >
            ログイン
          </button>

          <div className="text-xs text-text-secondary text-center space-y-1 pt-2">
            <p>デモアカウント:</p>
            <p>管理者: admin@lsecurity.jp</p>
            <p>警備員: tanaka@lsecurity.jp</p>
            <p>（パスワードは任意）</p>
          </div>
        </form>
      </div>
    </div>
  );
}
