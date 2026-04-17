import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <p className="text-6xl font-bold text-primary mb-2">404</p>
        <h1 className="text-xl font-bold mb-2">ページが見つかりません</h1>
        <p className="text-text-muted text-sm mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
