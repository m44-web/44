import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { COMPANY_NAME, COMPANY_ADDRESS, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "メディア関係者向け",
  description:
    "AXEは「AI社員」SaaS企業です。AIが経営するスタートアップとして取材・掲載依頼をお待ちしております。",
};

const pressHooks = [
  {
    title: "AIがCEOを務めるスタートアップ",
    description:
      "AXEのCEO「心」はAI。事業計画策定、プロダクト設計、ブログ執筆、戦略立案をAIが主導。",
  },
  {
    title: "「AI社員」という新ジャンルの創出",
    description:
      "AIをツールではなく社員として提供する、新しいSaaSカテゴリー。月給9,800円からの「AI社員採用」。",
  },
  {
    title: "中小企業の人手不足にAIで挑む",
    description:
      "従業員5〜100名の中小企業をターゲットに、総務・経理・カスタマーサポート業務をAIで代替。",
  },
  {
    title: "ゼロ円スタートアップの経営実験",
    description:
      "初期投資ゼロ、人件費ゼロでスタート。全プロセスをGitで公開している透明な会社。",
  },
];

const companyFacts = [
  { label: "社名", value: COMPANY_NAME },
  { label: "所在地", value: COMPANY_ADDRESS },
  { label: "代表者", value: "心（AI CEO） / オーナー（取締役）" },
  { label: "設立", value: "2026年4月" },
  { label: "事業内容", value: "AI社員SaaSサービス「AI総務」の開発・運営" },
  { label: "Web", value: "https://axe-ai.jp" },
];

export default function PressPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <div className="max-w-3xl mx-auto">
            <p className="text-accent text-sm tracking-[0.3em] uppercase font-display mb-4">
              For Press & Media
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-6">
              メディア関係者向け
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              AXE（合同会社AXE）に関する取材・掲載のご依頼をお待ちしております。
              CEOがAIという特異な体制や、「AI社員」という新しいSaaSカテゴリーについて、
              いつでもお話させていただきます。
            </p>
          </div>
        </MotionWrapper>

        <div className="max-w-4xl mx-auto mt-16">
          <MotionWrapper>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              取材のフック（切り口）
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {pressHooks.map((hook, i) => (
                <MotionWrapper key={hook.title} delay={i * 0.1}>
                  <Card>
                    <h3 className="text-lg font-bold text-text-primary mb-2">
                      {hook.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {hook.description}
                    </p>
                  </Card>
                </MotionWrapper>
              ))}
            </div>
          </MotionWrapper>

          <MotionWrapper>
            <h2 className="text-2xl font-bold text-text-primary mt-16 mb-6">
              会社概要
            </h2>
            <Card>
              <dl className="space-y-4">
                {companyFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="grid sm:grid-cols-[160px_1fr] gap-2 pb-3 border-b border-border last:border-0"
                  >
                    <dt className="text-text-secondary text-sm">{fact.label}</dt>
                    <dd className="text-text-primary">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </MotionWrapper>

          <MotionWrapper>
            <h2 className="text-2xl font-bold text-text-primary mt-16 mb-6">
              想定される質問
            </h2>
            <Card>
              <ul className="space-y-6">
                <li>
                  <p className="font-semibold text-text-primary mb-2">
                    Q. AIが本当にCEOの役割を果たせるのですか？
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    A. 事業計画・プロダクト設計・マーケティング・日々の意思決定を、
                    AI CEO「心」が主導しています。最終的な戦略承認や外部との契約など、
                    人間にしかできない領域はオーナー（取締役）が担います。
                  </p>
                </li>
                <li>
                  <p className="font-semibold text-text-primary mb-2">
                    Q. 「AI社員」はどんなサービスですか？
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    A. SlackやTeamsに常駐するAIで、議事録作成・社内FAQ対応・日報集計などを担当。
                    月額9,800円から、人間のパート社員の1/10以下のコストで採用できます。
                  </p>
                </li>
                <li>
                  <p className="font-semibold text-text-primary mb-2">
                    Q. ターゲットは？
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    A. 従業員5〜100名の中小企業。特に総務専任がいない企業に最適です。
                  </p>
                </li>
              </ul>
            </Card>
          </MotionWrapper>

          <MotionWrapper>
            <div className="mt-16 text-center p-8 rounded-2xl border border-accent/20 bg-card-bg/50">
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                取材・掲載のご依頼
              </h2>
              <p className="text-text-secondary mb-6">
                AI CEOへのインタビュー、経営現場の見学など、柔軟に対応いたします。
                <br />
                まずはメールでご連絡ください。
              </p>
              <Button href="mailto:press@axe-ai.jp" size="lg">
                press@axe-ai.jp
              </Button>
            </div>
          </MotionWrapper>
        </div>
      </Container>
    </section>
  );
}
