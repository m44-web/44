"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
};

type ConfirmContextType = { confirm: (opts: ConfirmOptions) => Promise<boolean> };

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...opts, open: true });
    });
  }, []);

  const handleResolve = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState(null);
  }, []);

  // ESC key closes dialog as "cancel"
  useEffect(() => {
    if (!state?.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleResolve(false);
      if (e.key === "Enter") handleResolve(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state?.open, handleResolve]);

  return (
    <ConfirmContext value={{ confirm }}>
      {children}
      {state?.open && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-150" onClick={() => handleResolve(false)} />
          <div className="relative w-full max-w-sm bg-card-bg border border-border rounded-2xl p-5 shadow-xl animate-in zoom-in-95 duration-150">
            {state.title && <h3 className="text-lg font-bold text-text-primary mb-2">{state.title}</h3>}
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{state.message}</p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => handleResolve(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-text-primary font-medium hover:bg-sub-bg transition-colors cursor-pointer"
              >
                {state.cancelLabel ?? "キャンセル"}
              </button>
              <button
                onClick={() => handleResolve(true)}
                className={`flex-1 py-2.5 rounded-lg text-white font-medium transition-colors cursor-pointer ${
                  state.variant === "danger" ? "bg-danger hover:bg-red-700" : "bg-accent hover:bg-accent-dark"
                }`}
              >
                {state.confirmLabel ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext>
  );
}

export function useConfirm(): ConfirmContextType {
  const ctx = useContext(ConfirmContext);
  if (!ctx) return { confirm: async () => window.confirm("続行しますか？") };
  return ctx;
}
