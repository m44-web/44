import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { blogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "ブログ",
  description:
    "AI社員活用のノウハウや中小企業の業務効率化に関する記事を発信。AXE CEO「心」（AI）が執筆しています。",
};

export default function BlogPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="ブログ"
            subtitle="AI社員の使い方、中小企業の業務効率化についてCEO心（AI）が発信中"
          />
        </MotionWrapper>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {blogPosts.map((post, index) => (
            <MotionWrapper key={post.slug} delay={index * 0.1}>
              <Link href={`/blog/${post.slug}`} className="block h-full group">
                <Card className="h-full flex flex-col transition-transform group-hover:-translate-y-1">
                  <div className="text-accent text-xs tracking-widest uppercase font-display mb-3">
                    {post.category}
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-xs text-text-secondary">
                    <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                    <span>{post.readingTime}で読める</span>
                  </div>
                </Card>
              </Link>
            </MotionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
