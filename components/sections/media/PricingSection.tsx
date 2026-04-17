import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "お試し採用",
    duration: "2週間無料",
    frequency: "無料",
    price: "0円",
    features: [
      "AI社員1名（1職種）",
      "基本機能が使える",
      "Slack連携",
      "メールサポート",
      "クレジットカード不要",
    ],
    popular: false,
  },
  {
    name: "パート採用",
    duration: "1職種・基本機能",
    frequency: "月額制",
    price: "月額 9,800円",
    features: [
      "AI社員1名（1職種）",
      "月1,000タスクまで",
      "社内FAQ対応",
      "議事録自動作成",
      "日報集計",
      "メールサポート",
    ],
    popular: false,
  },
  {
    name: "正社員採用",
    duration: "1職種・フル機能",
    frequency: "月額制",
    price: "月額 29,800円",
    features: [
      "AI社員1名（1職種フル機能）",
      "タスク無制限",
      "全機能利用可能",
      "優先対応",
      "カスタマイズ対応",
      "チャット＋メールサポート",
    ],
    popular: true,
  },
  {
    name: "チーム採用",
    duration: "複数職種・全機能",
    frequency: "月額制",
    price: "月額 98,000円",
    features: [
      "AI社員複数名（複数職種）",
      "タスク無制限",
      "全機能＋専用カスタマイズ",
      "専任サポート担当",
      "導入コンサルティング",
      "月次活用レビュー",
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
            title="採用プラン"
            subtitle="AI社員の「月給」として。人間のパート社員より圧倒的に安い。"
          />
        </MotionWrapper>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <MotionWrapper key={plan.name} delay={index * 0.15}>
              <Card
                className={`h-full flex flex-col ${
                  plan.popular ? "border-accent/50 relative" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary text-xs font-bold px-4 py-1 rounded-full">
                    おすすめ
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
                    {plan.price === "0円" ? "無料で試す" : "お問い合わせ"}
                  </Button>
                </div>
              </Card>
            </MotionWrapper>
          ))}
        </div>

        <p className="text-center text-sm text-text-secondary mt-8">
          ※ すべてのプランで解約はいつでも可能です。お試し採用はクレジットカード不要。
        </p>
      </Container>
    </section>
  );
}
