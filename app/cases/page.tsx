import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { CaseFilter } from "@/components/sections/cases/CaseFilter";

export const metadata: Metadata = {
  title: "導入事例",
  description:
    "AXEのAI導入事例。製造、金融、小売、医療など様々な業種でのAI活用シーンをご紹介します。",
};

export default function CasesPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="導入事例"
            subtitle="様々な業種でのAI活用シーンをご紹介します"
          />
        </MotionWrapper>
        <CaseFilter />
      </Container>
    </section>
  );
}
