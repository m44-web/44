import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { CaseFilter } from "@/components/sections/cases/CaseFilter";

export const metadata: Metadata = {
  title: "導入事例",
  description:
    "AI社員の導入事例。IT、製造、小売、医療など様々な業種でAI社員がどう活躍しているかをご紹介します。",
};

export default function CasesPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="想定事例"
            subtitle="AI社員が活躍できる業種と効果の想定例"
          />
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <div className="max-w-3xl mx-auto mb-12 p-4 rounded-lg bg-accent/5 border border-accent/20 text-sm text-text-secondary text-center">
            本ページは「AI社員がどう機能するか」のユースケース集です。
            実際の導入事例はベータリリース後に順次差し替え・追加していきます。
          </div>
        </MotionWrapper>

        <CaseFilter />
      </Container>
    </section>
  );
}
