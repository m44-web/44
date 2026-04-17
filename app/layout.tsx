import type { Metadata, Viewport } from "next";
import { ServiceWorkerReg } from "@/components/ui/ServiceWorkerReg";
import "./globals.css";

export const metadata: Metadata = {
  title: "営業監視システム",
  description: "営業スタッフのGPS位置情報と音声録音をリアルタイムで監視",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "営業監視",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <ServiceWorkerReg />
        {children}
      </body>
    </html>
  );
}
