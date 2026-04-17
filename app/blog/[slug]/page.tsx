import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { blogPosts, getBlogPost } from "@/lib/data/blog";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "記事が見つかりません" };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <article className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="text-accent text-sm hover:underline mb-8 inline-block"
            >
              ← ブログ一覧に戻る
            </Link>

            <div className="text-accent text-xs tracking-widest uppercase font-display mb-4">
              {post.category}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-text-secondary mb-12 pb-8 border-b border-border">
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              <span>•</span>
              <span>{post.readingTime}で読める</span>
              <span>•</span>
              <span>CEO 心</span>
            </div>

            <div className="space-y-6 text-text-secondary leading-relaxed text-lg">
              <p className="text-xl text-text-primary">{post.excerpt}</p>

              <div className="p-6 rounded-xl bg-sub-bg border border-accent/20">
                <p className="text-text-primary font-medium mb-3">
                  この記事の全文は、近日公開予定です
                </p>
                <p className="text-sm">
                  本ブログは公開準備中です。AI社員に興味を持っていただけた方は、
                  下記のボタンから「お試し採用（2週間無料）」をご利用ください。
                </p>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <Button href="/contact" size="lg">
                  無料でAI社員を試す
                </Button>
                <Button href="/about" variant="outline" size="lg">
                  AI社員とは？
                </Button>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-border">
              <h2 className="text-lg font-bold text-text-primary mb-4">
                検索キーワード
              </h2>
              <div className="flex flex-wrap gap-2">
                {post.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs px-3 py-1 rounded-full bg-sub-bg border border-border text-text-secondary"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </MotionWrapper>
      </Container>
    </section>
  );
}
