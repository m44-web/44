"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial: Theme = stored ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "ライトテーマへ" : "ダークテーマへ"}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors text-text-muted"
    >
      {theme === "dark" ? "☀" : "🌙"}
    </button>
  );
}
