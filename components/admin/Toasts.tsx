"use client";

import { useEffect, useState } from "react";
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

interface NotifPrefs {
  soundEnabled: boolean;
  shiftAlerts: boolean;
  activityAlerts: boolean;
  geofenceAlerts: boolean;
}

function loadNotifPrefs(): NotifPrefs {
  try {
    const s = localStorage.getItem("notif_prefs");
    if (s) return { soundEnabled: true, shiftAlerts: true, activityAlerts: true, geofenceAlerts: true, ...JSON.parse(s) };
  } catch {}
  return { soundEnabled: true, shiftAlerts: true, activityAlerts: true, geofenceAlerts: true };
}

function shouldShow(event: AppEvent, prefs: NotifPrefs): boolean {
  if (event.type === "shift_start" || event.type === "shift_end") return prefs.shiftAlerts;
  if (event.type === "activity_alert") return prefs.activityAlerts;
  if (event.type === "geofence_alert") return prefs.geofenceAlerts;
  return true;
}

function playNotifSound(tone: "info" | "success" | "warning") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.1;
    osc.frequency.value = tone === "warning" ? 600 : tone === "success" ? 800 : 500;
    osc.type = "sine";
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    setTimeout(() => ctx.close(), 500);
  } catch {}
}

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
    case "activity_alert":
      return {
        id,
        type: event.type,
        message: `${event.userName}: ${event.message}`,
        icon: "⚠️",
        tone: "warning",
      };
    case "geofence_alert":
      return {
        id,
        type: event.type,
        message: `${event.userName}: ${event.message}`,
        icon: "🚫",
        tone: "warning",
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
    const prefs = loadNotifPrefs();
    if (!shouldShow(lastEvent, prefs)) return;

    const toast = toastFromEvent(lastEvent, Date.now() + Math.random());
    if (!toast) return;

    setToasts((prev) => [...prev, toast]);

    if (prefs.soundEnabled) {
      playNotifSound(toast.tone);
    }

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [lastEvent]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.tone === "warning" ? "alert" : "status"}
          className={`flex items-center gap-3 p-3 pr-4 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-in ${toneStyles[toast.tone]}`}
        >
          <span className="text-lg">{toast.icon}</span>
          <p className="text-sm flex-1">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
