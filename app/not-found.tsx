import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <p className="text-6xl font-bold text-accent">404</p>
        <h2 className="text-xl font-bold text-text-primary">ページが見つかりません</h2>
        <p className="text-sm text-text-secondary">
          お探しのページは移動または削除された可能性があります。
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark transition-colors"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
