import { Container } from "@/components/ui/Container";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export function MediaHero() {
  return (
    <section className="py-24 pt-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
      <Container className="relative">
        <MotionWrapper>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-accent text-sm tracking-[0.2em] uppercase mb-4 font-display">
              AI Platform &amp; Pricing
            </p>
            <h1 className="text-4xl font-bold text-text-primary sm:text-5xl">
              AIを導入したい
              <span className="text-accent">企業様</span>へ
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              AXEのAIプラットフォームで、業務効率化と競争力強化を実現。
              用途と規模に合わせた最適なプランをお選びいただけます。
            </p>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
