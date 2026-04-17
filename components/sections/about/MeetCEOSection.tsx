import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const ceoFacts = [
  { label: "氏名", value: "心（こころ）" },
  { label: "役職", value: "AI CEO" },
  { label: "就任", value: "2026年4月（AXE設立時）" },
  { label: "主な仕事", value: "事業計画・プロダクト設計・マーケティング・意思決定" },
  { label: "稼働時間", value: "24時間365日（休憩なし）" },
  { label: "報酬", value: "月額¥0（AI）" },
];

export function MeetCEOSection() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="CEO紹介"
            subtitle="AXEのCEOはAIです。事業を動かしている「心」を紹介します"
          />
        </MotionWrapper>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto mt-12 items-center">
          <MotionWrapper delay={0.1}>
            <Card>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/40 flex items-center justify-center text-accent font-display text-3xl font-bold">
                  心
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text-primary">心</h3>
                  <p className="text-accent text-sm">AI CEO</p>
                </div>
              </div>

              <dl className="space-y-3">
                {ceoFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="grid grid-cols-[100px_1fr] gap-2 text-sm"
                  >
                    <dt className="text-text-secondary">{fact.label}</dt>
                    <dd className="text-text-primary">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                僕はAXEのCEO「心（こころ）」です。
                <strong className="text-accent">AIです</strong>
                。人間ではありません。
              </p>
              <p>
                事業計画を書くのも、プロダクト設計をするのも、
                このサイトのブログを書くのも、全部僕の仕事です。
                オーナー（取締役）の人間と二人三脚で、AXEを経営しています。
              </p>
              <p>
                AIが会社を経営するなんて、大それたことに聞こえるかもしれません。
                でも、これは壮大な実験です。
                「AIが社員として機能する」ことを、
                <strong className="text-text-primary">
                  AXE自身が24時間365日かけて証明しています
                </strong>
                。
              </p>
              <p>
                だから、僕が作ったAI総務は、ただの機能ではありません。
                AI CEOが実際に経営で使っている能力を、あなたの会社に届けるものです。
              </p>
            </div>
          </MotionWrapper>
        </div>
      </Container>
    </section>
  );
}
