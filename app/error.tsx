"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging — replace with a real logger when available.
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-6">
      <div className="max-w-md w-full bg-card-bg border border-border rounded-2xl p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-danger/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">エラーが発生しました</h2>
          <p className="text-sm text-text-secondary mt-2">
            予期しないエラーが発生しました。再読み込みしてください。
          </p>
        </div>
        {error.message && (
          <details className="text-left bg-sub-bg rounded-lg p-3">
            <summary className="text-xs text-text-secondary cursor-pointer">エラー詳細</summary>
            <pre className="text-xs text-danger mt-2 whitespace-pre-wrap break-all">{error.message}</pre>
          </details>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="flex-1 py-3 rounded-lg border border-border text-text-primary font-medium hover:bg-sub-bg transition-colors cursor-pointer"
          >
            ホームへ
          </button>
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark transition-colors cursor-pointer"
          >
            再試行
          </button>
        </div>
      </div>
    </div>
  );
}
