"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const adminNav = [
  { href: "/dashboard", label: "ダッシュボード", icon: "home" },
  { href: "/guards", label: "警備員管理", icon: "users" },
  { href: "/sites", label: "現場管理", icon: "building" },
  { href: "/shifts", label: "シフト管理", icon: "calendar" },
  { href: "/attendance", label: "勤怠管理", icon: "clock" },
] as const;

const guardNav = [
  { href: "/dashboard", label: "ホーム", icon: "home" },
  { href: "/shifts", label: "シフト", icon: "calendar" },
  { href: "/attendance", label: "出退勤", icon: "clock" },
] as const;

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const nav = user?.role === "admin" ? adminNav : guardNav;

  return (
    <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-60 bg-card-bg border-r border-border flex-col z-40">
      <div className="p-5 border-b border-border">
        <Link href="/dashboard" className="text-xl font-bold">
          <span className="text-accent">L</span>security
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-sub-bg"
              }`}
            >
              <span className={active ? "text-accent" : ""}>{icons[item.icon]}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="px-3 py-2 text-sm">
          <p className="text-text-primary font-medium truncate">{user?.name}</p>
          <p className="text-text-secondary text-xs">{user?.role === "admin" ? "管理者" : "警備員"}</p>
        </div>
        <button
          onClick={logout}
          className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-danger hover:bg-sub-bg transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          ログアウト
        </button>
      </div>
    </aside>
  );
}
