import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export function PDFDownloadCTA() {
  return (
    <section className="py-24">
      <Container>
        <MotionWrapper>
          <div className="text-center rounded-2xl border border-accent/20 bg-card-bg/50 backdrop-blur-sm p-12 sm:p-16 gradient-border">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-6">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              AI社員を採用してみませんか？
            </h2>
            <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto">
              2週間無料のお試し採用で、AI社員がどう働くか体験できます。
              合わなければいつでも解約OK。まずはお気軽にご相談ください。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                無料でAI社員を試す
              </Button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
