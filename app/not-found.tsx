import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="py-24 pt-32 min-h-[70vh] flex items-center">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-accent text-sm tracking-[0.3em] uppercase font-display mb-4">
            404 — Page Not Found
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold text-text-primary mb-6">
            このページは
            <br />
            <span className="text-accent">見つかりません</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed mb-10">
            お探しのページは削除されたか、URLが変更された可能性があります。
            AI社員は、迷子のページを探すのも得意ですが、
            今回はトップページからお探しいただくのが早そうです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/" size="lg">
              トップに戻る
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              お問い合わせ
            </Button>
          </div>
          <div className="mt-16 text-sm text-text-secondary">
            <p>よく見られているページ：</p>
            <div className="mt-3 flex flex-wrap gap-4 justify-center">
              <Link href="/about" className="hover:text-accent transition-colors">
                AI社員とは
              </Link>
              <span>·</span>
              <Link href="/media" className="hover:text-accent transition-colors">
                料金プラン
              </Link>
              <span>·</span>
              <Link href="/cases" className="hover:text-accent transition-colors">
                導入事例
              </Link>
              <span>·</span>
              <Link href="/blog" className="hover:text-accent transition-colors">
                ブログ
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
