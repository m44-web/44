"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getGuards, getSites } from "@/lib/store";
import type { Guard, Site } from "@/lib/types";

type CommandItem = {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: string;
};

const ADMIN_SHORTCUTS: CommandItem[] = [
  { id: "nav-dashboard", label: "ダッシュボード", hint: "ホーム", href: "/dashboard", group: "ナビゲーション" },
  { id: "nav-shifts", label: "シフト管理", hint: "シフト一覧", href: "/shifts", group: "ナビゲーション" },
  { id: "nav-shift-new", label: "シフトを新規作成", hint: "新しいシフト", href: "/shifts/new", group: "アクション" },
  { id: "nav-guard-new", label: "警備員を新規登録", hint: "新しい警備員", href: "/guards/new", group: "アクション" },
  { id: "nav-site-new", label: "現場を新規登録", hint: "新しい現場", href: "/sites/new", group: "アクション" },
  { id: "nav-guards", label: "警備員名簿", hint: "", href: "/guards", group: "ナビゲーション" },
  { id: "nav-sites", label: "現場管理", hint: "", href: "/sites", group: "ナビゲーション" },
  { id: "nav-attendance", label: "勤怠管理", hint: "", href: "/attendance", group: "ナビゲーション" },
  { id: "nav-shift-requests", label: "シフト希望", hint: "", href: "/shift-requests", group: "ナビゲーション" },
  { id: "nav-reports", label: "日報管理", hint: "", href: "/reports", group: "ナビゲーション" },
  { id: "nav-handover", label: "引継ぎノート", hint: "", href: "/handover", group: "ナビゲーション" },
  { id: "nav-chat", label: "管制チャット", hint: "", href: "/chat", group: "ナビゲーション" },
  { id: "nav-locations", label: "位置確認", hint: "", href: "/locations", group: "ナビゲーション" },
  { id: "nav-equipment", label: "装備管理", hint: "", href: "/equipment", group: "ナビゲーション" },
  { id: "nav-csv", label: "CSV出力", hint: "", href: "/csv", group: "ナビゲーション" },
];

const GUARD_SHORTCUTS: CommandItem[] = [
  { id: "nav-dashboard", label: "ホーム", hint: "", href: "/dashboard", group: "ナビゲーション" },
  { id: "nav-shifts", label: "シフト", hint: "", href: "/shifts", group: "ナビゲーション" },
  { id: "nav-shift-requests", label: "シフト希望", hint: "", href: "/shift-requests", group: "ナビゲーション" },
  { id: "nav-attendance", label: "出退勤", hint: "", href: "/attendance", group: "ナビゲーション" },
  { id: "nav-reports", label: "日報", hint: "", href: "/reports", group: "ナビゲーション" },
  { id: "nav-handover", label: "引継ぎ", hint: "", href: "/handover", group: "ナビゲーション" },
  { id: "nav-chat", label: "チャット", hint: "", href: "/chat", group: "ナビゲーション" },
  { id: "nav-salary", label: "給与", hint: "", href: "/salary", group: "ナビゲーション" },
  { id: "nav-locations", label: "位置送信", hint: "", href: "/locations", group: "ナビゲーション" },
];

export function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const [shortcutHelp, setShortcutHelp] = useState(false);

  useEffect(() => {
    // g-prefix chord shortcuts: g then d = dashboard, g s = shifts, etc.
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        if (shortcutHelp) setShortcutHelp(false);
        else if (open) setOpen(false);
        return;
      }
      if (e.key === "?" && e.shiftKey && !open) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
        e.preventDefault();
        setShortcutHelp(true);
        return;
      }
      // chord: g then letter
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (!gPressed && e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 1000);
        return;
      }
      if (gPressed) {
        gPressed = false;
        if (gTimer) { clearTimeout(gTimer); gTimer = null; }
        const map: Record<string, string> = {
          d: "/dashboard",
          s: "/shifts",
          a: "/attendance",
          r: "/reports",
          c: "/chat",
          g: "/guards",
          l: "/locations",
          h: "/handover",
        };
        const href = map[e.key.toLowerCase()];
        if (href) {
          e.preventDefault();
          router.push(href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [open, shortcutHelp, router]);

  useEffect(() => {
    if (open) {
      setGuards(getGuards());
      setSites(getSites());
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    if (!user) return [];
    const shortcuts = user.role === "admin" ? ADMIN_SHORTCUTS : GUARD_SHORTCUTS;
    const q = query.trim();
    const matchShortcuts = shortcuts.filter((s) =>
      !q || s.label.includes(q) || (s.hint && s.hint.includes(q))
    );
    const matchGuards: CommandItem[] = user.role === "admin"
      ? guards
          .filter((g) => !q || g.name.includes(q) || g.nameKana.includes(q))
          .slice(0, 6)
          .map((g) => ({ id: `guard-${g.id}`, label: g.name, hint: g.nameKana, href: `/guards/${g.id}`, group: "警備員" }))
      : [];
    const matchSites: CommandItem[] = user.role === "admin"
      ? sites
          .filter((s) => !q || s.name.includes(q) || s.clientName.includes(q))
          .slice(0, 6)
          .map((s) => ({ id: `site-${s.id}`, label: s.name, hint: s.clientName, href: `/sites/${s.id}`, group: "現場" }))
      : [];
    return [...matchShortcuts, ...matchGuards, ...matchSites];
  }, [query, guards, sites, user]);

  useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(0);
  }, [items.length, activeIndex]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open && !shortcutHelp) return null;

  if (shortcutHelp && !open) {
    const shortcuts: { keys: string; label: string }[] = [
      { keys: "⌘ K / Ctrl K", label: "コマンドパレットを開く" },
      { keys: "g → d", label: "ダッシュボードへ" },
      { keys: "g → s", label: "シフト管理へ" },
      { keys: "g → a", label: "勤怠管理へ" },
      { keys: "g → r", label: "日報へ" },
      { keys: "g → c", label: "チャットへ" },
      { keys: "g → g", label: "警備員名簿へ" },
      { keys: "g → l", label: "位置確認へ" },
      { keys: "g → h", label: "引継ぎノートへ" },
      { keys: "?", label: "このヘルプを表示" },
      { keys: "ESC", label: "モーダルを閉じる" },
    ];
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/60" onClick={() => setShortcutHelp(false)} />
        <div className="relative w-full max-w-md bg-card-bg border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text-primary">キーボードショートカット</p>
            <kbd className="text-[10px] text-text-secondary bg-sub-bg rounded px-1.5 py-0.5 border border-border">ESC</kbd>
          </div>
          <div className="p-4 space-y-2">
            {shortcuts.map((s) => (
              <div key={s.keys} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-text-primary">{s.label}</span>
                <kbd className="text-[11px] text-text-secondary bg-sub-bg rounded px-2 py-0.5 border border-border font-mono">{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) navigate(item.href);
    }
  }

  // Group items by group for rendering
  const grouped: Record<string, CommandItem[]> = {};
  for (const item of items) {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  }

  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl mx-4 bg-card-bg border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="検索またはコマンド..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary/50 focus:outline-none text-sm"
          />
          <kbd className="text-[10px] text-text-secondary bg-sub-bg rounded px-1.5 py-0.5 border border-border">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {items.length === 0 ? (
            <p className="text-center text-sm text-text-secondary py-6">該当する項目がありません</p>
          ) : (
            Object.entries(grouped).map(([group, groupItems]) => (
              <div key={group} className="py-1">
                <p className="text-[10px] font-semibold text-text-secondary px-4 py-1 uppercase">{group}</p>
                {groupItems.map((item) => {
                  const idx = globalIndex++;
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-left text-sm cursor-pointer transition-colors ${
                        active ? "bg-accent/10 text-accent" : "text-text-primary hover:bg-sub-bg"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.hint && <span className="text-[11px] text-text-secondary shrink-0">{item.hint}</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border text-[10px] text-text-secondary flex items-center gap-3">
          <span><kbd className="bg-sub-bg rounded px-1 py-0.5 border border-border">↑↓</kbd> 移動</span>
          <span><kbd className="bg-sub-bg rounded px-1 py-0.5 border border-border">Enter</kbd> 選択</span>
          <button type="button" onClick={() => { setOpen(false); setShortcutHelp(true); }} className="ml-auto hover:text-accent cursor-pointer transition-colors">
            <kbd className="bg-sub-bg rounded px-1 py-0.5 border border-border">?</kbd> ショートカット
          </button>
        </div>
      </div>
    </div>
  );
}
