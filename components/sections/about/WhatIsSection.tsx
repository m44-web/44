import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export function WhatIsSection() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="AXEとは"
            subtitle="AIで企業の変革を支える総合AIカンパニー"
          />
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-text-secondary leading-relaxed text-lg">
              AXEは、合同会社AXE（東京都渋谷区）が運営するAIソリューションブランドです。
              AI SaaS・カスタム開発・AIエージェント自動化・画像動画生成の4つの事業領域で、
              あらゆる業種・規模の企業にAI活用を提供しています。
            </p>
            <p className="mt-6 text-text-secondary leading-relaxed text-lg">
              「知性に、刃を。」をコンセプトに、AIの力で企業の業務課題を鋭く切り拓きます。
              課題整理からAIモデル開発、システム実装、運用定着まで、すべてワンストップで対応。
              多様な業種への導入実績とAI技術への深い知見を活かし、
              お客様のビジネスに最適なAIソリューションをご提案します。
            </p>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
