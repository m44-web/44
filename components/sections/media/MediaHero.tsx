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
              AI Employee Pricing
            </p>
            <h1 className="text-4xl font-bold text-text-primary sm:text-5xl">
              AI社員の
              <span className="text-accent">採用プラン</span>
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              人間のパート社員を月10万円で雇うより安い。
              月額9,800円から、あなたの会社にAI社員を迎えられます。
            </p>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
