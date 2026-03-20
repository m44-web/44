import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const steps = [
  {
    number: "01",
    title: "お問い合わせ・ヒアリング",
    description:
      "ご要望・設置場所・予算感などをヒアリング。最適なサイネージプランをご提案します。",
  },
  {
    number: "02",
    title: "現地調査・プランニング",
    description:
      "設置場所を実際に確認し、サイネージのサイズ・配置・電源・通信環境などを調査。詳細なお見積りを作成します。",
  },
  {
    number: "03",
    title: "設置・コンテンツ制作",
    description:
      "サイネージの設置工事とコンテンツの制作を並行して進行。テスト配信で品質を確認します。",
  },
  {
    number: "04",
    title: "運用開始・サポート",
    description:
      "運用開始後も、コンテンツ更新・メンテナンス・効果測定レポートなど継続的にサポートします。",
  },
];

export function FlowSection() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="サービスの流れ"
            subtitle="お問い合わせから運用開始まで、スムーズにサポートします"
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
