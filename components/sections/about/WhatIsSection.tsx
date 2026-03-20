import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export function WhatIsSection() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="LIFE VISIONとは"
            subtitle="北海道発のデジタルサイネージソリューション"
          />
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-text-secondary leading-relaxed text-lg">
              LIFE VISIONは、合同会社LIT（札幌市）が運営するデジタルサイネージブランドです。
              北海道内の店舗・施設・公共空間にデジタルサイネージを設置し、
              情報発信と広告配信のインフラを構築しています。
            </p>
            <p className="mt-6 text-text-secondary leading-relaxed text-lg">
              「街に、動きを。」をコンセプトに、従来の静的な看板や掲示物を
              ダイナミックなデジタルコンテンツに置き換え、
              地域のコミュニケーションを活性化します。
              設置からコンテンツ制作、運用、広告配信まで、すべてワンストップで対応。
              北海道の商圏と立地を熟知した私たちだからこそ、
              最適なサイネージ活用をご提案できます。
            </p>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
