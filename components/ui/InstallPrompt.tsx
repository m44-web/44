"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    const wasDismissed = sessionStorage.getItem("install_dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("install_dismissed", "1");
  };

  if (isStandalone || dismissed || !deferredPrompt) return null;

  return (
    <div className="w-full max-w-sm mx-auto p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-primary">ホーム画面に追加</p>
          <p className="text-xs text-primary/70 mt-0.5">
            アプリとしてインストールすると素早くアクセスできます
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="px-2 py-1 text-xs text-text-muted hover:text-text"
          >
            後で
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
