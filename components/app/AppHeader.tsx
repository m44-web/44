"use client";

import { memo } from "react";
import { useAuth } from "@/lib/auth-context";

export const AppHeader = memo(function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-card-bg/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <span className="text-lg font-bold">
          <span className="text-accent">L</span>security
        </span>
        <div className="flex items-center gap-3">
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
