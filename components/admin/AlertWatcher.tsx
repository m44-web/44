"use client";

import { useEffect, useRef, useState } from "react";

interface Location {
  userId: string;
  userName: string;
  activity: {
    status: "active" | "idle" | "stale" | "no_gps";
    message: string;
  };
}

// Short "ding" sound generated with Web Audio API (no asset needed)
function playDing() {
  try {
    type AC = typeof AudioContext;
    const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext) as AC | undefined;
    if (!Ctor) return;
    const ctx = new Ctor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // ignore
  }
}

export function AlertWatcher() {
  const [enabled, setEnabled] = useState(false);
  const alerted = useRef<Set<string>>(new Set());

  // Persist preference
  useEffect(() => {
    const stored = localStorage.getItem("alert_enabled");
    if (stored === "1") setEnabled(true);
  }, []);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("alert_enabled", next ? "1" : "0");

    if (next && "Notification" in window && Notification.permission !== "granted") {
      try {
        await Notification.requestPermission();
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const check = async () => {
      try {
        const res = await fetch("/api/gps/latest");
        if (!res.ok) return;
        const data: { locations: Location[] } = await res.json();

        // Update tab title with alert count
        const alertCount = data.locations.filter(
          (l) => l.activity.status === "idle" || l.activity.status === "stale"
        ).length;
        document.title = alertCount > 0
          ? `(${alertCount}) 営業監視システム`
          : "営業監視システム";

        const currentIds = new Set<string>();
        for (const loc of data.locations) {
          if (loc.activity.status === "idle" || loc.activity.status === "stale") {
            const key = `${loc.userId}:${loc.activity.status}`;
            currentIds.add(key);
            if (!alerted.current.has(key)) {
              alerted.current.add(key);

              // Browser notification
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                const title =
                  loc.activity.status === "idle"
                    ? "⚠️ 停滞検知"
                    : "⚠️ GPS未更新";
                new Notification(title, {
                  body: `${loc.userName} - ${loc.activity.message}`,
                  icon: "/icon.svg",
                  tag: key,
                });
              }

              playDing();
            }
          }
        }

        // Clear alerts that are no longer active so they can re-trigger later
        for (const key of Array.from(alerted.current)) {
          if (!currentIds.has(key)) alerted.current.delete(key);
        }
      } catch {
        // ignore
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [enabled]);

  return (
    <button
      onClick={toggle}
      title={enabled ? "アラート通知ON" : "アラート通知OFF"}
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors ${
        enabled
          ? "bg-warning/20 text-warning hover:bg-warning/30"
          : "bg-white/5 text-text-muted hover:bg-white/10"
      }`}
    >
      {enabled ? "🔔" : "🔕"}
      <span className="hidden sm:inline">アラート通知</span>
    </button>
  );
}
