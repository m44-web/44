import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "スタンダード",
    duration: "15秒",
    frequency: "1時間あたり4回",
    price: "月額 150,000円〜",
    features: [
      "15秒スポット配信",
      "基本レポート（月次）",
      "コンテンツ制作サポート",
      "最低契約期間：3ヶ月",
    ],
    popular: false,
  },
  {
    name: "プレミアム",
    duration: "30秒",
    frequency: "1時間あたり6回",
    price: "月額 280,000円〜",
    features: [
      "30秒スポット配信",
      "詳細レポート（週次）",
      "コンテンツ制作込み",
      "時間帯指定可能",
      "最低契約期間：1ヶ月",
    ],
    popular: true,
  },
  {
    name: "エクスクルーシブ",
    duration: "60秒",
    frequency: "独占枠",
    price: "月額 500,000円〜",
    features: [
      "60秒独占枠配信",
      "リアルタイムレポート",
      "コンテンツ制作・更新無制限",
      "全時間帯対応",
      "専任担当者",
      "契約期間：応相談",
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
            title="料金イメージ"
            subtitle="Route 36沿線大型LEDビジョンの広告掲載プラン"
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
