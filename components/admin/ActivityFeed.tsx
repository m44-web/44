"use client";

import { useEffect, useState, useRef } from "react";
import { useRealtime } from "./RealtimeProvider";
import { Card } from "@/components/ui/Card";
import { AppEvent } from "@/lib/event-bus";

interface FeedItem {
  id: number;
  time: number;
  type: string;
  message: string;
  icon: string;
  tone: "info" | "success" | "warning";
}

function feedFromEvent(event: AppEvent): Omit<FeedItem, "id" | "time"> | null {
  switch (event.type) {
    case "shift_start":
      return { type: "shift_start", message: `${event.userName} が勤務を開始`, icon: "▶", tone: "success" };
    case "shift_end":
      return { type: "shift_end", message: `${event.userName} が勤務を終了`, icon: "■", tone: "info" };
    case "audio_upload":
      return { type: "audio_upload", message: `${event.userName} の録音をアップロード`, icon: "🎤", tone: "info" };
    case "activity_alert":
      return { type: "activity_alert", message: `${event.userName}: ${event.message}`, icon: "⚠️", tone: "warning" };
    case "geofence_alert":
      return { type: "geofence_alert", message: `${event.userName}: ${event.message}`, icon: "🚫", tone: "warning" };
    case "gps_update":
      return { type: "gps_update", message: `${event.userName} のGPS更新`, icon: "📍", tone: "info" };
    default:
      return null;
  }
}

const MAX_ITEMS = 50;

export function ActivityFeed() {
  const { lastEvent } = useRealtime();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [paused, setPaused] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastEvent || paused) return;
    const mapped = feedFromEvent(lastEvent);
    if (!mapped) return;
    if (mapped.type === "gps_update") return;

    const item: FeedItem = {
      ...mapped,
      id: Date.now() + Math.random(),
      time: Date.now(),
    };

    setItems((prev) => [item, ...prev].slice(0, MAX_ITEMS));
  }, [lastEvent, paused]);

  const toneColors = {
    info: "border-l-primary/50",
    success: "border-l-success/50",
    warning: "border-l-warning/50",
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">リアルタイムフィード</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">{items.length}件</span>
          <button
            onClick={() => setPaused((p) => !p)}
            className={`text-[10px] px-2 py-0.5 rounded ${
              paused ? "bg-warning/20 text-warning" : "bg-white/5 text-text-muted hover:bg-white/10"
            }`}
            aria-label={paused ? "フィード再開" : "フィード一時停止"}
          >
            {paused ? "⏸ 停止中" : "⏵ 動作中"}
          </button>
          {items.length > 0 && (
            <button
              onClick={() => setItems([])}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-text-muted hover:bg-white/10"
            >
              クリア
            </button>
          )}
        </div>
      </div>
      <div ref={listRef} className="space-y-1 max-h-[250px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-text-muted text-xs text-center py-4">
            イベントはまだありません
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs border-l-2 ${toneColors[item.tone]} bg-white/[0.02] rounded-r`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1 min-w-0 truncate">{item.message}</span>
              <span className="text-text-muted flex-shrink-0 text-[10px]">
                {new Date(item.time).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
