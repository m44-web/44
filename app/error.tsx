"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/20 flex items-center justify-center text-2xl">
          ⚠
        </div>
        <h1 className="text-xl font-bold mb-2">エラーが発生しました</h1>
        <p className="text-text-muted text-sm mb-6">
          申し訳ありません。処理中にエラーが発生しました。もう一度お試しください。
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium"
          >
            もう一度試す
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-text-muted"
          >
            ホームへ
          </Link>
        </div>
      </div>
    </div>
  );
}
