import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { ContactForm } from "@/components/sections/contact/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "AI社員の採用相談・お問い合わせ。お試し採用の申し込みや、料金・機能についてお気軽にご相談ください。",
};

export default function ContactPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="お問い合わせ"
            subtitle="AI社員のお試し採用・ご質問など、お気軽にご相談ください"
          />
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <ContactForm />
        </MotionWrapper>
      </Container>
    </section>
  );
}
