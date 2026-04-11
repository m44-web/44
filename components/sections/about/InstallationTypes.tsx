import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { installationTypes } from "@/lib/data/installation-types";

const icons: Record<string, React.ReactNode> = {
  platform: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  custom: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  ),
  agent: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 1v3" />
      <path d="M15 1v3" />
      <path d="M9 20v3" />
      <path d="M15 20v3" />
      <path d="M20 9h3" />
      <path d="M20 15h3" />
      <path d="M1 9h3" />
      <path d="M1 15h3" />
    </svg>
  ),
};

export function InstallationTypes() {
  return (
    <section className="py-24">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="ソリューションタイプ"
            subtitle="課題とフェーズに合わせた最適なAIソリューション"
          />
        </MotionWrapper>

        <div className="grid gap-8 lg:grid-cols-3">
          {installationTypes.map((type, index) => (
            <MotionWrapper key={type.title} delay={index * 0.15}>
              <Card className="h-full">
                <div className="text-accent mb-4">{icons[type.icon]}</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  {type.title}
                </h3>
                <p className="text-text-secondary leading-relaxed mb-5">
                  {type.description}
                </p>
                <ul className="space-y-2">
                  {type.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            </MotionWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
