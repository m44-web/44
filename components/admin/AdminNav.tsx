"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Container } from "@/components/ui/Container";

const navItems = [
  { href: "/admin", label: "ダッシュボード", exact: true },
  { href: "/admin/employees", label: "従業員" },
  { href: "/admin/shifts", label: "シフト履歴" },
  { href: "/admin/reports", label: "レポート" },
  { href: "/admin/geofences", label: "エリア" },
  { href: "/admin/audit", label: "監査ログ" },
];

export function AdminNav({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="bg-surface border-b border-white/10 sticky top-0 z-50">
      <Container className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="sm:hidden p-1.5 rounded hover:bg-white/10 text-text-muted"
            aria-label="メニュー"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              {mobileOpen ? (
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              ) : (
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
          <nav aria-label="メインナビゲーション" className="hidden sm:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-text-muted hover:bg-white/5 hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {userName && (
            <span className="text-xs text-text-muted hidden md:inline">
              {userName}
            </span>
          )}
          <Link href="/settings" className="hidden sm:inline-flex">
            <Button variant="ghost" className="text-xs">
              設定
            </Button>
          </Link>
          <ThemeToggle />
          <Button variant="ghost" onClick={handleLogout} className="text-xs">
            ログアウト
          </Button>
        </div>
      </Container>

      {mobileOpen && (
        <div className="sm:hidden border-t border-white/10 bg-surface">
          <nav aria-label="モバイルナビゲーション" className="flex flex-col py-1">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-muted hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 text-sm text-text-muted hover:bg-white/5"
            >
              設定
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
