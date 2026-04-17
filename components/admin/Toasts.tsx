"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtime } from "./RealtimeProvider";
import { AppEvent } from "@/lib/event-bus";

interface Toast {
  id: number;
  type: AppEvent["type"] | "idle_alert";
  message: string;
  icon: string;
  tone: "info" | "success" | "warning";
}

const TOAST_DURATION_MS = 4000;

function toastFromEvent(event: AppEvent, id: number): Toast | null {
  switch (event.type) {
    case "shift_start":
      return {
        id,
        type: event.type,
        message: `${event.userName} が勤務を開始しました`,
        icon: "▶",
        tone: "success",
      };
    case "shift_end":
      return {
        id,
        type: event.type,
        message: `${event.userName} が勤務を終了しました`,
        icon: "■",
        tone: "info",
      };
    case "audio_upload":
      return {
        id,
        type: event.type,
        message: `${event.userName} の録音をアップロードしました`,
        icon: "🎤",
        tone: "info",
      };
    default:
      return null;
  }
}

const toneStyles = {
  info: "bg-primary/20 border-primary/40 text-primary",
  success: "bg-success/20 border-success/40 text-success",
  warning: "bg-warning/20 border-warning/40 text-warning",
};

export function Toasts() {
  const { lastEvent } = useRealtime();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!lastEvent) return;
    const toast = toastFromEvent(lastEvent, Date.now() + Math.random());
    if (!toast) return;

    setToasts((prev) => [...prev, toast]);

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [lastEvent]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-3 pr-4 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-in ${toneStyles[toast.tone]}`}
        >
          <span className="text-lg">{toast.icon}</span>
          <p className="text-sm flex-1">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
