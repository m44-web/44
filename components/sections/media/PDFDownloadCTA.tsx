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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 18 15 15" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              サービス資料をダウンロード
            </h2>
            <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto">
              AIソリューションの詳細・料金・導入事例をまとめた
              サービスガイドをPDFでご用意しています。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" size="lg">
                資料請求・お問い合わせ
              </Button>
              <Button
                href="/docs/media-guide.pdf"
                variant="outline"
                size="lg"
              >
                PDFをダウンロード
              </Button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  );
}
