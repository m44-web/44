import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import type { CaseStudy } from "@/lib/data/cases";

type CaseGridProps = {
  cases: CaseStudy[];
};

export function CaseGrid({ cases }: CaseGridProps) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-16 text-text-secondary">
        該当する事例はありません
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cases.map((caseStudy, index) => (
        <MotionWrapper key={caseStudy.id} delay={index * 0.1}>
          <Card className="h-full flex flex-col">
            {/* Thumbnail placeholder */}
            <div className="relative aspect-video rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 mb-4 overflow-hidden flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-accent/30"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>

            {/* Industry badge */}
            <span className="inline-block self-start text-xs font-medium text-accent bg-accent/10 rounded-full px-3 py-1 mb-3">
              {caseStudy.industry}
            </span>

            <h3 className="text-lg font-bold text-text-primary mb-1">
              {caseStudy.title}
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              {caseStudy.location}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
              {caseStudy.summary}
            </p>

            {/* Effect highlight */}
            <div className="pt-3 border-t border-border">
              <p className="text-sm font-medium text-accent">
                {caseStudy.effect}
              </p>
            </div>
          </Card>
        </MotionWrapper>
      ))}
    </div>
  );
}
