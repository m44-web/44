import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { faqs } from "@/lib/data/faqs";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function FAQSection() {
  return (
    <section className="py-24 bg-sub-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
