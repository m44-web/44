"use client";

import { useEffect, useState, useCallback } from "react";

export function SessionGuard() {
  const [expired, setExpired] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        setExpired(true);
      }
    } catch {
      // network error, ignore
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSession]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [checkSession]);

  if (!expired) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-white/10 shadow-2xl p-6 max-w-sm text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-warning/20 flex items-center justify-center text-xl">
          🔒
        </div>
        <h2 className="font-semibold text-lg mb-2">セッションが期限切れです</h2>
        <p className="text-sm text-text-muted mb-4">
          セキュリティのため自動的にログアウトされました。再度ログインしてください。
        </p>
        <button
          onClick={() => { window.location.href = "/"; }}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium w-full"
        >
          ログインページへ
        </button>
      </div>
    </div>
  );
}
