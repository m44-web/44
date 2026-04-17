"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

type Props = {
  requestId: string;
  endpoint: string;
  onComplete: (videoUrl: string) => void;
  onError: (message: string) => void;
};

export function VideoGenerationStatus({
  requestId,
  endpoint,
  onComplete,
  onError,
}: Props) {
  const [statusText, setStatusText] = useState("キューに追加しています...");
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    pollRef.current = setInterval(async () => {
      try {
        const params = new URLSearchParams({ requestId, endpoint });
        const res = await fetch(`/api/video/status?${params}`);
        const data = await res.json();

        if (!data.success) {
          clearIntervals();
          onError(data.error || "ステータスの確認に失敗しました");
          return;
        }

        if (data.status === "COMPLETED") {
          clearIntervals();
          if (data.videoUrl) {
            onComplete(data.videoUrl);
          } else {
            onError("動画URLの取得に失敗しました");
          }
          return;
        }

        if (data.status === "IN_QUEUE") {
          setStatusText(
            data.position != null
              ? `キュー待機中（位置: ${data.position}）`
              : "キュー待機中..."
          );
        } else if (data.status === "IN_PROGRESS") {
          setStatusText("動画を生成中...");
        }
      } catch {
        // Network errors during polling are retried silently
      }
    }, 3000);

    return clearIntervals;
  }, [requestId, endpoint, onComplete, onError]);

  useEffect(() => {
    if (elapsed >= 180) {
      clearIntervals();
      onError("生成がタイムアウトしました。もう一度お試しください。");
    }
  }, [elapsed, onError]);

  function clearIntervals() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  return (
    <Card hover={false} className="max-w-3xl mx-auto text-center py-16">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full border-2 border-accent/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 w-20 h-20 rounded-full border-t-2 border-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div>
          <p className="text-lg font-semibold text-text-primary">
            {statusText}
          </p>
          <p className="text-text-secondary mt-2">
            経過時間: {elapsed}秒
          </p>
          <p className="text-sm text-text-secondary/70 mt-1">
            通常30〜120秒ほどかかります
          </p>
        </div>

        <motion.div
          className="flex gap-1"
          initial="hidden"
          animate="visible"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </motion.div>
      </div>
    </Card>
  );
}
