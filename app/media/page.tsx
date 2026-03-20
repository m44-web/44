import type { Metadata } from "next";
import { MediaHero } from "@/components/sections/media/MediaHero";
import { SignageInfo } from "@/components/sections/media/SignageInfo";
import { ReachSection } from "@/components/sections/media/ReachSection";
import { PricingSection } from "@/components/sections/media/PricingSection";
import { PDFDownloadCTA } from "@/components/sections/media/PDFDownloadCTA";

export const metadata: Metadata = {
  title: "広告媒体資料",
  description:
    "LIFE VISIONのデジタルサイネージ広告媒体資料。Route 36沿線サイネージのリーチ数・料金プランをご紹介します。",
};

export default function MediaPage() {
  return (
    <>
      <MediaHero />
      <SignageInfo />
      <ReachSection />
      <PricingSection />
      <PDFDownloadCTA />
    </>
  );
}
