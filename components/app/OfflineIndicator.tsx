"use client";

import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOffline(!navigator.onLine);
    const onOnline = () => {
      setIsOffline(false);
      setReconnecting(true);
      setTimeout(() => setReconnecting(false), 2500);
    };
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!mounted) return null;

  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[90] bg-warning text-white px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
        オフラインです — 一部の機能が制限されます
      </div>
    );
  }

  if (reconnecting) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[90] bg-success text-white px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        オンラインに復帰しました
      </div>
    );
  }

  return null;
}
