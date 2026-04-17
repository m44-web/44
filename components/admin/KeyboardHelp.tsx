"use client";

import { useEffect, useState } from "react";

const shortcuts = [
  { keys: ["⌘/Ctrl", "K"], desc: "コマンドパレットを開く" },
  { keys: ["?"], desc: "このヘルプを表示" },
  { keys: ["g", "d"], desc: "ダッシュボードへ" },
  { keys: ["g", "e"], desc: "従業員管理へ" },
  { keys: ["g", "s"], desc: "シフト履歴へ" },
  { keys: ["g", "r"], desc: "レポートへ" },
  { keys: ["g", "a"], desc: "監査ログへ" },
  { keys: ["g", "f"], desc: "エリア管理へ" },
  { keys: ["Esc"], desc: "モーダル/フルスクリーンを閉じる" },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="キーボードショートカット"
    >
      <div
        className="w-full max-w-md bg-surface rounded-xl border border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">キーボードショートカット</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-text-muted hover:text-text text-sm"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-text-muted">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((key, j) => (
                  <span key={j}>
                    {j > 0 && <span className="text-text-muted text-xs mx-0.5">→</span>}
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-muted mt-4 text-center">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">?</kbd> で閉じる
        </p>
      </div>
    </div>
  );
}
