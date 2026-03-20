import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const specs = [
  { label: "ディスプレイサイズ", value: "横4m × 縦3m" },
  { label: "解像度", value: "フルHD（1920×1080）" },
  { label: "輝度", value: "6,000cd/m² 以上" },
  { label: "配信時間", value: "6:00〜24:00（18時間/日）" },
  { label: "ロール尺", value: "15秒 / 30秒" },
  { label: "更新頻度", value: "リアルタイム対応可能" },
];

export function SignageInfo() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="Route 36 沿線サイネージ"
            subtitle="札幌市内の主要幹線道路「国道36号線」沿いに設置された大型LEDビジョン"
          />
        </MotionWrapper>

        <div className="grid gap-8 lg:grid-cols-2">
          <MotionWrapper delay={0.1}>
            <Card className="h-full">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                設置概要
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                国道36号線は、札幌市中心部と千歳・苫小牧方面を結ぶ
                北海道有数の交通量を誇る幹線道路です。
                沿線の商業エリアに大型LEDビジョンを設置し、
                1日あたり数万台の通行車両と歩行者にリーチします。
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <p className="text-sm text-text-secondary mt-2">設置場所イメージ</p>
                </div>
              </div>
            </Card>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <Card className="h-full">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                スペック
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
