import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { cases, getCase } from "@/lib/data/cases";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  return cases.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const c = getCase(id);
  if (!c) return { title: "事例が見つかりません" };

  return {
    title: `導入事例：${c.title}`,
    description: `${c.industry}｜${c.summary}`,
  };
}

export default async function CaseDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const caseStudy = getCase(id);
  if (!caseStudy) notFound();

  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <article className="max-w-3xl mx-auto">
            <Link
              href="/cases"
              className="text-accent text-sm hover:underline mb-8 inline-block"
            >
              ← 導入事例一覧に戻る
            </Link>

            <span className="inline-block text-xs font-medium text-accent bg-accent/10 rounded-full px-3 py-1 mb-4">
              {caseStudy.industry}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-4">
              {caseStudy.title}
            </h1>

            <p className="text-text-secondary mb-8">{caseStudy.location}</p>

            <div className="p-6 rounded-xl bg-accent/5 border border-accent/20 mb-12">
              <p className="text-lg text-text-primary font-medium leading-relaxed">
                {caseStudy.summary}
              </p>
              <p className="text-accent font-bold text-xl mt-4">
                効果：{caseStudy.effect}
              </p>
            </div>

            <div className="space-y-12">
              <section className="grid sm:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-sm font-semibold text-text-secondary mb-2">
                    企業規模
                  </h3>
                  <p className="text-lg text-text-primary">
                    {caseStudy.employeeCount ?? "—"}
                  </p>
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold text-text-secondary mb-2">
                    採用したAI社員
                  </h3>
                  <p className="text-lg text-text-primary">
                    {caseStudy.aiRole ?? "AI総務"}
                  </p>
                </Card>
              </section>

              {caseStudy.before && caseStudy.after && (
                <section>
                  <h2 className="text-2xl font-bold text-text-primary mb-6">
                    導入前と導入後
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <h3 className="text-sm font-semibold text-text-secondary mb-4">
                        BEFORE（導入前）
                      </h3>
                      <ul className="space-y-3">
                        {caseStudy.before.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-text-secondary">
                            <span className="text-red-400 shrink-0 mt-1">×</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card className="border-accent/30">
                      <h3 className="text-sm font-semibold text-accent mb-4">
                        AFTER（導入後）
                      </h3>
                      <ul className="space-y-3">
                        {caseStudy.after.map((a) => (
                          <li key={a} className="flex items-start gap-2 text-text-primary">
                            <span className="text-accent shrink-0 mt-1">✓</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </section>
              )}

              {caseStudy.workflow && (
                <section>
                  <h2 className="text-2xl font-bold text-text-primary mb-6">
                    活用の流れ
                  </h2>
                  <ol className="space-y-4">
                    {caseStudy.workflow.map((step, i) => (
                      <li key={step} className="flex gap-4">
                        <span className="shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="text-text-secondary pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {caseStudy.testimonial && (
                <section>
                  <Card className="border-accent/30 bg-accent/5">
                    <blockquote className="text-xl text-text-primary leading-relaxed italic">
                      「{caseStudy.testimonial.quote}」
                    </blockquote>
                    <footer className="mt-4 text-sm text-text-secondary">
                      — {caseStudy.testimonial.author}（{caseStudy.testimonial.role}）
                    </footer>
                  </Card>
                </section>
              )}

              <section className="text-center pt-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  あなたの会社でも、試してみませんか？
                </h2>
                <p className="text-text-secondary mb-8">
                  2週間無料のお試し採用。クレジットカード登録不要。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button href="/contact" size="lg">
                    無料でAI社員を試す
                  </Button>
                  <Button href="/media" variant="outline" size="lg">
                    料金プランを見る
                  </Button>
                </div>
              </section>
            </div>
          </article>
        </MotionWrapper>
      </Container>
    </section>
  );
}
