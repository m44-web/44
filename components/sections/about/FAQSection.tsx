import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { faqs } from "@/lib/data/faqs";

export function FAQSection() {
  return (
    <section className="py-24 bg-sub-bg">
      <Container>
        <MotionWrapper>
          <SectionHeading title="よくある質問" />
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <Accordion items={[...faqs]} />
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
