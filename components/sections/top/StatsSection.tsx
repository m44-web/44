"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { stats } from "@/lib/data/stats";

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    let animationFrame: number;

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      }
    }

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [started, target, duration]);

  return { count, start: () => setStarted(true) };
}

function StatItem({
  label,
  value,
  suffix,
  prefix,
  delay,
}: {
  label: string;
  value: number;
  suffix: string;
  prefix: string;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { count, start } = useCountUp(value);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(start, delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, start, delay]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-accent sm:text-5xl font-display">
        {prefix}
        {count.toLocaleString()}
        <span className="text-2xl sm:text-3xl">{suffix}</span>
      </div>
      <div className="mt-2 text-text-secondary">{label}</div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="py-24 bg-sub-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />

      <Container className="relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            導入実績
          </h2>
          <div className="mt-4 h-1 w-16 rounded bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              prefix={stat.prefix}
              delay={index * 200}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
