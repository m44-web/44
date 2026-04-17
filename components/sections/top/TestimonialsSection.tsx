import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { testimonials } from "@/lib/data/testimonials";

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="想定ユースケース"
            subtitle="AI社員が活きる企業像。ベータリリース後に実例と差し替え予定"
          />
        </MotionWrapper>

        <div className="grid gap-6 md:grid-cols-3 mt-12">
          {testimonials.map((t, i) => (
            <MotionWrapper key={t.id} delay={i * 0.15}>
              <Card className="h-full flex flex-col">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-accent/50 mb-4"
                >
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                </svg>
                <blockquote className="text-text-primary text-base leading-relaxed flex-1">
                  {t.quote}
                </blockquote>
                <footer className="mt-6 pt-4 border-t border-border">
                  <p className="text-text-primary font-medium text-sm">
                    {t.author}
                  </p>
                  <p className="text-text-secondary text-xs mt-1">{t.role}</p>
                  <p className="text-accent text-xs mt-1 font-display">
                    {t.industry}
                  </p>
                </footer>
              </Card>
            </MotionWrapper>
          ))}
        </div>

        <p className="text-center text-xs text-text-secondary mt-8">
          ※ 上記はAXE想定のユースケースです。実際の導入事例はベータリリース後に順次公開します。
        </p>
      </Container>
    </section>
  );
}
