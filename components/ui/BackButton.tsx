"use client";

import { useRouter } from "next/navigation";

export function BackButton({ fallbackHref = "/dashboard", label = "戻る" }: { fallbackHref?: string; label?: string }) {
  const router = useRouter();
  function handleClick() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }
  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors cursor-pointer py-1 -ml-1"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {label}
    </button>
  );
}
