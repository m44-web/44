"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center text-2xl">
          📡
        </div>
        <h1 className="text-xl font-bold mb-2">オフラインです</h1>
        <p className="text-text-muted text-sm mb-6">
          インターネット接続がありません。接続が回復したら自動的にページが更新されます。
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
