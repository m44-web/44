import type { Metadata } from "next";
import { WhatIsSection } from "@/components/sections/about/WhatIsSection";
import { FlowSection } from "@/components/sections/about/FlowSection";
import { InstallationTypes } from "@/components/sections/about/InstallationTypes";
import { FAQSection } from "@/components/sections/about/FAQSection";

export const metadata: Metadata = {
  title: "サービス紹介",
  description:
    "AXEのAIサービスについて。ソリューションタイプ、導入の流れ、よくある質問をご紹介します。",
};

export default function AboutPage() {
  return (
    <>
      <WhatIsSection />
      <FlowSection />
      <InstallationTypes />
      <FAQSection />
    </>
  );
}
