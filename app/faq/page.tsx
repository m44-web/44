import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { faqs } from "@/lib/data/faqs";

export const metadata: Metadata = {
  title: "よくある質問",
  description:
    "AI社員・AI総務に関するよくある質問。料金、導入期間、セキュリティ、解約など、中小企業の疑問にお答えします。",
};

const extendedFaqs = [
  ...faqs,
  {
    question: "AI総務の回答が間違っていた場合はどうなりますか？",
    answer:
      "フィードバックボタンで「この回答は役に立たなかった」と伝えると、次回以降の回答精度が改善されます。重要な間違いを見つけた場合は、社内マニュアルを追加アップロードすることで根本改善できます。",
  },
  {
    question: "契約期間の縛りはありますか？",
    answer:
      "縛りはありません。月額プランは月次契約で、いつでも解約可能です。解約後は当月末までご利用いただけます。お試し採用（2週間無料）は期間終了で自動的に解約となり、課金は発生しません。",
  },
  {
    question: "複数の職種（AI総務とAI営業）を同時採用できますか？",
    answer:
      "「チーム採用プラン」（月額98,000円）で複数職種を同時に採用できます。パート・正社員プランは1職種限定です。なお、AI営業・AI経理・AIカスタマーサポートは順次リリース予定です（2026年10月以降）。",
  },
  {
    question: "海外拠点や英語対応はできますか？",
    answer:
      "現時点では日本語・日本の中小企業に特化しています。英語UIや海外展開は2027年以降の対応を検討しています。",
  },
  {
    question: "ボタンや管理画面はありますか？",
    answer:
      "最小限のWeb管理画面（契約プラン、使用量、マニュアル管理）を用意していますが、日常利用は基本的にSlack内で完結します。新しい画面を覚える必要はありません。",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: extendedFaqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function FAQPage() {
  return (
    <section className="py-24 pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="よくある質問"
            subtitle="AI社員・AI総務に関する疑問にお答えします"
          />
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <div className="max-w-3xl mx-auto mt-12">
            <Accordion items={extendedFaqs} />
          </div>
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <div className="max-w-2xl mx-auto text-center mt-16 p-8 rounded-2xl border border-accent/20 bg-card-bg/50">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              他にご質問がありますか？
            </h2>
            <p className="text-text-secondary mb-6">
              お気軽にお問い合わせください。AI CEO「心」が直接お答えします。
            </p>
            <Button href="/contact" size="lg">
              お問い合わせ
            </Button>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
