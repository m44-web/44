"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = {
  videoUrl: string;
  onReset: () => void;
};

export function VideoResult({ videoUrl, onReset }: Props) {
  const handleDownload = async () => {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifevision-${Date.now()}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card hover={false} className="max-w-3xl mx-auto text-center">
      <div className="rounded-lg overflow-hidden mb-6 border border-border">
        <video
          src={videoUrl}
          controls
          autoPlay
          muted
          loop
          className="w-full"
          playsInline
        />
      </div>
      <p className="text-text-secondary mb-6">
        生成された動画をプレビューしています。ダウンロードしてサイネージでご利用いただけます。
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleDownload}>ダウンロード</Button>
        <Button variant="outline" onClick={onReset}>
          もう一度生成する
        </Button>
      </div>
    </Card>
  );
}
