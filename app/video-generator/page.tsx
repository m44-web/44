import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { VideoGeneratorForm } from "@/components/sections/video-generator/VideoGeneratorForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "AI動画ジェネレーター",
  description:
    "Seedance 2.0を活用して、CM・求人動画を映画風に自動生成。デジタルサイネージに最適な映像コンテンツを作成できます。",
};

export default function VideoGeneratorPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="AI動画ジェネレーター"
            subtitle="CM・求人動画を映画のようなクオリティで自動生成。テンプレートを選んで、プロ品質の映像をワンクリックで作成できます。"
          />
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <VideoGeneratorForm />
        </MotionWrapper>

        <MotionWrapper delay={0.4}>
          <Card hover={false} className="max-w-3xl mx-auto mt-12">
            <h3 className="font-semibold text-text-primary mb-2">
              ご利用について
            </h3>
            <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
              <li>
                Seedance 2.0（ByteDance社）のAI動画生成技術を使用しています。
              </li>
              <li>生成には通常30〜120秒かかります。</li>
              <li>
                生成された動画はダウンロードしてサイネージコンテンツとしてご利用いただけます。
              </li>
              <li>
                商用利用や大量生成をご希望の場合は、お問い合わせください。
              </li>
            </ul>
          </Card>
        </MotionWrapper>
      </Container>
    </section>
  );
}
