import type { Metadata } from "next";
import { WhatIsSection } from "@/components/sections/about/WhatIsSection";
import { MeetCEOSection } from "@/components/sections/about/MeetCEOSection";
import { FlowSection } from "@/components/sections/about/FlowSection";
import { InstallationTypes } from "@/components/sections/about/InstallationTypes";
import { FAQSection } from "@/components/sections/about/FAQSection";

export const metadata: Metadata = {
  title: "AI社員とは",
  description:
    "AI社員とは何か、採用フロー、プラン、よくある質問をご紹介。AIを道具ではなく社員として雇う新しい選択肢。",
};

export default function AboutPage() {
  return (
    <>
      <WhatIsSection />
      <MeetCEOSection />
      <FlowSection />
      <InstallationTypes />
      <FAQSection />
    </>
  );
}
