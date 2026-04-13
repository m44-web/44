import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface rounded-xl border border-white/10 p-6 ${className}`}>
      {children}
    </div>
  );
}
