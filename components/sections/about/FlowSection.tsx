import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const steps = [
  {
    number: "01",
    title: "お試し採用（無料）",
    description:
      "まずは2週間、無料でAI社員を試せます。SlackワークスペースにAI社員を追加するだけ。特別な設定は不要です。",
  },
  {
    number: "02",
    title: "社内マニュアルを読み込ませる",
    description:
      "社内のマニュアルやFAQ資料をアップロード。AI社員がそれを理解し、社員からの質問に答えられるようになります。",
  },
  {
    number: "03",
    title: "Slackで話しかけて仕事を任せる",
    description:
      "「@AI総務 昨日の会議の議事録まとめて」のように話しかけるだけ。人間の同僚に頼むのと同じ感覚で使えます。",
  },
  {
    number: "04",
    title: "本採用（有料プラン）",
    description:
      "効果を実感できたら有料プランに切り替え。月額9,800円から。使い続けるほどAI社員があなたの会社に馴染んでいきます。",
  },
];

export function FlowSection() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="AI社員の採用フロー"
            subtitle="4ステップで、あなたの会社にAI社員がやってきます"
          />
        </MotionWrapper>

        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <MotionWrapper key={step.number} delay={index * 0.15}>
              <div className="relative flex gap-6 pb-12 last:pb-0">
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 w-px h-[calc(100%-3.5rem)] bg-gradient-to-b from-accent/50 to-accent/10" />
                )}

                <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold font-display text-sm">
                  {step.number}
                </div>

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
