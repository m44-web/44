import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { installationTypes } from "@/lib/data/installation-types";

const icons: Record<string, React.ReactNode> = {
  outdoor: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 20h10" />
      <path d="M9 16v4" />
      <path d="M15 16v4" />
    </svg>
  ),
  store: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  vehicle: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 17h14v-5H5z" />
      <path d="M7 12V7h10v5" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
      <path d="M3 17h2" />
      <path d="M19 17h2" />
    </svg>
  ),
};

export function InstallationTypes() {
  return (
    <section className="py-24">
      <Container>
        <MotionWrapper>
          <SectionHeading
            title="設置タイプ"
            subtitle="あらゆる環境に最適なサイネージソリューション"
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
