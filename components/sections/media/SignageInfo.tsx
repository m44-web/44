import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const specs = [
  { label: "対応AIモデル", value: "GPT-4o / Claude / Gemini 他" },
  { label: "データ連携", value: "API / CSV / DB直接接続" },
  { label: "セキュリティ", value: "SOC2準拠・データ暗号化" },
  { label: "稼働率", value: "99.9% SLA保証" },
  { label: "対応言語", value: "日本語・英語・中国語 他" },
  { label: "サポート", value: "チャット・メール・オンライン" },
];

export function SignageInfo() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="AXE AIプラットフォーム"
            subtitle="企業のAI活用を加速するオールインワンプラットフォーム"
          />
        </MotionWrapper>

        <div className="grid gap-8 lg:grid-cols-2">
          <MotionWrapper delay={0.1}>
            <Card className="h-full">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                プラットフォーム概要
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                AXE AIプラットフォームは、チャットボット・文書生成・データ分析・
                画像生成などの機能を統合したクラウドAI基盤です。
                ノーコードで操作でき、既存システムとのAPI連携にも対応。
                企業規模を問わず、すぐにAI活用を始められます。
              </p>
              <div className="aspect-video rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-accent/40 mx-auto"
                  >
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M9 9h6v6H9z" />
                    <path d="M9 1v3" />
                    <path d="M15 1v3" />
                    <path d="M9 20v3" />
                    <path d="M15 20v3" />
                    <path d="M20 9h3" />
                    <path d="M20 15h3" />
                    <path d="M1 9h3" />
                    <path d="M1 15h3" />
                  </svg>
                  <p className="text-sm text-text-secondary mt-2">プラットフォームイメージ</p>
                </div>
              </div>
            </Card>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <Card className="h-full">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                プラットフォーム仕様
              </h3>
              <div className="space-y-4">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <span className="text-text-secondary text-sm">
                      {spec.label}
                    </span>
                    <span className="text-text-primary font-medium text-sm">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </MotionWrapper>
        </div>
      </Container>
    </section>
  );
}
