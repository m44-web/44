"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const reachData = [
  { label: "月間API処理件数", value: 500, suffix: "万件+", prefix: "" },
  { label: "平均応答時間", value: 200, suffix: "ms", prefix: "" },
  { label: "顧客満足度", value: 96, suffix: "%", prefix: "" },
  { label: "データ処理精度", value: 99, suffix: "%", prefix: "" },
];

function CountUp({ target, prefix, suffix }: { target: number; prefix: string; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = performance.now();
    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function ReachSection() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          title="プラットフォーム実績"
          subtitle="AXE AIプラットフォームの稼働実績"
        />

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {reachData.map((item) => (
            <div
              key={item.label}
              className="text-center p-6 rounded-xl border border-border bg-card-bg"
            >
              <div className="text-3xl font-bold text-accent font-display sm:text-4xl">
                <CountUp target={item.value} prefix={item.prefix} suffix={item.suffix} />
              </div>
              <div className="mt-2 text-sm text-text-secondary">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
