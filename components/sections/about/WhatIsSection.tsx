import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export function WhatIsSection() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="AI社員とは"
            subtitle="AIを「道具」ではなく「社員」として雇う、新しい選択肢"
          />
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-text-secondary leading-relaxed text-lg">
              AXEの「AI社員」は、SlackやTeamsに常駐して仕事をするAIです。
              普通のAIツールは、自分で画面を開いて使う「道具」。
              でもAI社員は、話しかけるだけで仕事をしてくれる「同僚」です。
            </p>
            <p className="mt-6 text-text-secondary leading-relaxed text-lg">
              しかも、聞かれたら答えるだけじゃありません。
              朝は「おはようございます」と出勤し、会議の準備を自分で始め、
              日報を集計してマネージャーに報告する。
              まるで本当の社員のように「能動的に」働きます。
            </p>
            <p className="mt-6 text-text-secondary leading-relaxed text-lg">
              AXE自身のCEO「心」もAIです。
              事業計画を書き、プロダクトを設計し、会社を経営しています。
              「AIが社員として機能する」ことの、何よりの証明です。
            </p>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
