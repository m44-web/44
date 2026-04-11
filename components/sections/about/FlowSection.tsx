import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const steps = [
  {
    number: "01",
    title: "ヒアリング・課題整理",
    description:
      "現在の業務フローや課題をヒアリング。AI導入による効果を試算し、最適なアプローチをご提案します。",
  },
  {
    number: "02",
    title: "PoC・プロトタイプ開発",
    description:
      "実際のデータを用いた概念実証（PoC）で、AIの効果を検証。2〜4週間で成果を可視化します。",
  },
  {
    number: "03",
    title: "本開発・システム実装",
    description:
      "PoCの結果をもとに本番システムを開発。既存システムとの連携やUIの構築を行い、テスト環境で品質を確認します。",
  },
  {
    number: "04",
    title: "運用開始・継続改善",
    description:
      "本番リリース後も、AIモデルのチューニング・精度改善・新機能追加など、継続的にサポートします。",
  },
];

export function FlowSection() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="サービスの流れ"
            subtitle="お問い合わせからAI運用定着まで、スムーズにサポートします"
          />
        </MotionWrapper>

        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <MotionWrapper key={step.number} delay={index * 0.15}>
              <div className="relative flex gap-6 pb-12 last:pb-0">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 w-px h-[calc(100%-3.5rem)] bg-gradient-to-b from-accent/50 to-accent/10" />
                )}

                {/* Step number */}
                <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold font-display text-sm">
                  {step.number}
                </div>

                {/* Content */}
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </MotionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
