import type { Metadata } from "next";
import { MediaHero } from "@/components/sections/media/MediaHero";
import { SignageInfo } from "@/components/sections/media/SignageInfo";
import { ReachSection } from "@/components/sections/media/ReachSection";
import { PricingSection } from "@/components/sections/media/PricingSection";
import { ROICalculator } from "@/components/sections/media/ROICalculator";
import { PDFDownloadCTA } from "@/components/sections/media/PDFDownloadCTA";

export const metadata: Metadata = {
  title: "料金プラン",
  description:
    "AI社員の採用プラン。お試し採用0円、パート採用9,800円/月、正社員採用29,800円/月。人件費の1/10以下でAI社員を雇えます。",
};

export default function MediaPage() {
  return (
    <>
      <MediaHero />
      <SignageInfo />
      <ReachSection />
      <PricingSection />
      <ROICalculator />
      <PDFDownloadCTA />
    </>
  );
}
