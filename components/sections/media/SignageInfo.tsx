import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const comparison = [
  { label: "月額コスト", human: "10〜30万円", ai: "9,800円〜" },
  { label: "稼働時間", human: "1日8時間", ai: "24時間365日" },
  { label: "教育期間", human: "1〜3ヶ月", ai: "即日" },
  { label: "退職リスク", human: "あり", ai: "なし" },
  { label: "対応スピード", human: "数分〜数時間", ai: "数秒" },
  { label: "同時対応数", human: "1件ずつ", ai: "無制限" },
];

export function SignageInfo() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="人間の社員 vs AI社員"
            subtitle="コスト・稼働時間・教育すべてにおいて、AI社員が圧倒的"
          />
        </MotionWrapper>

        <div className="grid gap-8 lg:grid-cols-2">
          <MotionWrapper delay={0.1}>
            <Card className="h-full">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                AI社員の1日
              </h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                朝9時に「おはようございます」と出勤メッセージ。
                今日のタスク予定と昨日の積み残しを報告。
                会議の準備を自分で始め、終了後は議事録を作成。
                17時に日報を自動集計してマネージャーに報告。
                夜間も社員からの質問には即回答。
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <p className="text-sm text-text-secondary mt-2">AI社員イメージ</p>
                </div>
              </div>
            </Card>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <Card className="h-full">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                比較表
              </h3>
              <div className="space-y-4">
                {comparison.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-3 items-center py-2 border-b border-border last:border-0"
                  >
                    <span className="text-text-secondary text-sm">
                      {item.label}
                    </span>
                    <span className="text-text-secondary text-sm text-center">
                      {item.human}
                    </span>
                    <span className="text-accent font-medium text-sm text-center">
                      {item.ai}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-3 items-center pt-2 text-xs text-text-secondary">
                  <span></span>
                  <span className="text-center">人間の社員</span>
                  <span className="text-center text-accent">AI社員</span>
                </div>
              </div>
            </Card>
          </MotionWrapper>
        </div>
      </Container>
    </section>
  );
}
