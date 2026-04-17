"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Container } from "@/components/ui/Container";

const navItems = [
  { href: "/admin", label: "ダッシュボード", exact: true },
  { href: "/admin/employees", label: "従業員" },
  { href: "/admin/shifts", label: "シフト履歴" },
  { href: "/admin/geofences", label: "エリア" },
  { href: "/admin/audit", label: "監査ログ" },
];

export function AdminNav({ userName }: { userName?: string }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="bg-surface border-b border-white/10 sticky top-0 z-50">
      <Container className="flex items-center justify-between py-2">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {userName && (
            <span className="text-xs text-text-muted hidden md:inline">
              {userName}
            </span>
          )}
          <Link href="/settings">
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
    </header>
  );
}
