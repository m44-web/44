import { HeroSection } from "@/components/sections/top/HeroSection";
import { ServiceOverview } from "@/components/sections/top/ServiceOverview";
import { BenefitsSection } from "@/components/sections/top/BenefitsSection";
import { StatsSection } from "@/components/sections/top/StatsSection";
import { CTASection } from "@/components/sections/top/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServiceOverview />
      <BenefitsSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
