"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  name: string;
  email: string;
  isOnShift: boolean;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchEmployees();
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open, fetchEmployees]);

  const q = query.trim().toLowerCase();
  const actions: Array<{ label: string; href: string; hint: string }> = [
    { label: "ダッシュボード", href: "/admin", hint: "" },
    { label: "従業員管理", href: "/admin/employees", hint: "" },
    { label: "シフト履歴", href: "/admin/shifts", hint: "" },
    { label: "エリア管理", href: "/admin/geofences", hint: "" },
    { label: "監査ログ", href: "/admin/audit", hint: "" },
    { label: "設定", href: "/settings", hint: "" },
  ];

  const filteredEmployees = employees.filter(
    (e) =>
      q === "" ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
  );
  const filteredActions = actions.filter(
    (a) => q === "" || a.label.toLowerCase().includes(q)
  );

  const items: Array<{ type: "action" | "employee"; label: string; href: string; sub?: string }> = [
    ...filteredActions.map((a) => ({ type: "action" as const, label: a.label, href: a.href })),
    ...filteredEmployees.map((e) => ({
      type: "employee" as const,
      label: e.name,
      sub: e.email,
      href: `/admin/employees/${e.id}`,
    })),
  ];

  useEffect(() => {
    if (selectedIndex >= items.length) setSelectedIndex(0);
  }, [items.length, selectedIndex]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(items.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + items.length) % Math.max(items.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[selectedIndex];
      if (item) navigate(item.href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-surface rounded-xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-white/10">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="ページや従業員を検索... (↑↓ Enter)"
            className="w-full px-3 py-2 bg-transparent text-text placeholder-text-muted focus:outline-none"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-text-muted">
              一致する項目がありません
            </p>
          ) : (
            items.map((item, idx) => (
              <button
                key={`${item.type}-${item.href}`}
                onClick={() => navigate(item.href)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  idx === selectedIndex ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span className="text-sm">
                  {item.type === "employee" ? "👤" : "▸"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.label}</p>
                  {item.sub && (
                    <p className="text-xs text-text-muted truncate">
                      {item.sub}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-white/10 text-xs text-text-muted flex items-center justify-between">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
              ⌘K
            </kbd>{" "}
            で開閉
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
              Esc
            </kbd>{" "}
            で閉じる
          </span>
        </div>
      </div>
    </div>
  );
}
