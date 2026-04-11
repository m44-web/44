import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "スターター",
    duration: "SaaS基本プラン",
    frequency: "月額制",
    price: "月額 50,000円〜",
    features: [
      "AIチャットボット（1ボット）",
      "文書自動生成（月500件）",
      "基本データ分析",
      "メールサポート",
      "最低契約期間：なし",
    ],
    popular: false,
  },
  {
    name: "ビジネス",
    duration: "SaaS＋カスタマイズ",
    frequency: "月額制",
    price: "月額 200,000円〜",
    features: [
      "AIチャットボット（無制限）",
      "文書自動生成（無制限）",
      "高度なデータ分析・可視化",
      "AIエージェント（3ワークフロー）",
      "専任サポート担当",
      "API連携対応",
    ],
    popular: true,
  },
  {
    name: "エンタープライズ",
    duration: "フルカスタム",
    frequency: "個別見積",
    price: "お問い合わせ",
    features: [
      "全機能無制限",
      "カスタムAIモデル開発",
      "オンプレミス・VPC対応",
      "SLA 99.9%保証",
      "専任開発チーム",
      "24時間サポート",
    ],
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="料金プラン"
            subtitle="AIの活用レベルに合わせた3つのプラン"
          />
        </MotionWrapper>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <MotionWrapper key={plan.name} delay={index * 0.15}>
              <Card
                className={`h-full flex flex-col ${
                  plan.popular ? "border-accent/50 relative" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary text-xs font-bold px-4 py-1 rounded-full">
                    人気
                  </span>
                )}
                <h3 className="text-xl font-bold text-text-primary">
                  {plan.name}
                </h3>
                <p className="text-text-secondary text-sm mt-1">
                  {plan.duration} / {plan.frequency}
                </p>
                <div className="my-6 pb-6 border-b border-border">
                  <span className="text-3xl font-bold text-accent font-display">
                    {plan.price}
                  </span>
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-accent shrink-0 mt-0.5"
                      >
                        <path
                          d="M3 8l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button
                    href="/contact"
                    variant={plan.popular ? "primary" : "outline"}
                    className="w-full"
                  >
                    お問い合わせ
                  </Button>
                </div>
              </Card>
            </MotionWrapper>
          ))}
        </div>

        <p className="text-center text-sm text-text-secondary mt-8">
          ※ 料金は目安です。詳細はお問い合わせください。
        </p>
      </Container>
    </section>
  );
}
