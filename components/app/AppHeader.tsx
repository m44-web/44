"use client";

import { memo, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

function triggerCommandPalette() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true }));
}

export function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.toggle("dark");
  localStorage.setItem("lsecurity_theme", isDark ? "dark" : "light");
}

export function initTheme() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem("lsecurity_theme");
  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  }
}

export const AppHeader = memo(function AppHeader() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    initTheme();
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <header className="md:hidden sticky top-0 z-30 bg-card-bg/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <span className="text-lg font-bold">
          <span className="text-accent">L</span>security
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerCommandPalette}
            className="p-2 text-text-secondary hover:text-accent transition-colors cursor-pointer"
            aria-label="クイック検索"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button
            onClick={() => { toggleDarkMode(); setDark(!dark); }}
            className="p-2 text-text-secondary hover:text-accent transition-colors cursor-pointer"
            aria-label="テーマ切替"
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>
          <span className="text-xs text-text-secondary">{user?.name}</span>
          <button
            onClick={logout}
            className="p-2 text-text-secondary hover:text-danger transition-colors cursor-pointer"
            aria-label="ログアウト"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
});
