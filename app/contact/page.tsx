import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { ContactForm } from "@/components/sections/contact/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "AXEへのお問い合わせ。AI導入相談、料金、カスタム開発についてお気軽にご連絡ください。",
};

export default function ContactPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="お問い合わせ"
            subtitle="AI導入・開発について、お気軽にご相談ください"
          />
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
          <ContactForm />
        </MotionWrapper>
      </Container>
    </section>
  );
}
