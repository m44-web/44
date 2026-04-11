import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5" />
      <Container className="relative">
        <MotionWrapper>
          <div className="text-center rounded-2xl border border-accent/20 bg-card-bg/50 backdrop-blur-sm p-12 sm:p-16 gradient-border">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              AIの導入を
              <br />
              ご検討ですか？
            </h2>
            <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto">
              課題の整理からAI実装・運用定着まで、まずはお気軽にご相談ください。
              専門チームが最適なAI活用プランをご提案いたします。
            </p>
            <div className="mt-8">
              <Button href="/contact" size="lg">
                無料相談はこちら
              </Button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
