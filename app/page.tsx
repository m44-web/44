import { HeroSection } from "@/components/sections/top/HeroSection";
import { ServiceOverview } from "@/components/sections/top/ServiceOverview";
import { BenefitsSection } from "@/components/sections/top/BenefitsSection";
import { StatsSection } from "@/components/sections/top/StatsSection";
import { CTASection } from "@/components/sections/top/CTASection";
import { COMPANY_NAME, SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: `${SITE_NAME} AI社員`,
  applicationCategory: "BusinessApplication",
  description: SITE_DESCRIPTION,
  operatingSystem: "Web, Slack",
  offers: [
    {
      "@type": "Offer",
      name: "お試し採用",
      price: "0",
      priceCurrency: "JPY",
      description: "2週間無料トライアル",
    },
    {
      "@type": "Offer",
      name: "パート採用",
      price: "9800",
      priceCurrency: "JPY",
      description: "月額プラン・1職種・月1,000タスクまで",
    },
    {
      "@type": "Offer",
      name: "正社員採用",
      price: "29800",
      priceCurrency: "JPY",
      description: "月額プラン・1職種フル機能・タスク無制限",
    },
  ],
  publisher: {
    "@type": "Organization",
    name: COMPANY_NAME,
    url: SITE_URL,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <ServiceOverview />
      <BenefitsSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
