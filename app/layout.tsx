import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "営業監視システム",
  description: "営業スタッフのGPS位置情報と音声録音をリアルタイムで監視",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
