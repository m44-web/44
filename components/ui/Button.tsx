"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "danger" | "ghost" | "success";

const variantStyles: Record<Variant, string> = {
  primary: "bg-primary hover:bg-primary-dark text-white",
  danger: "bg-danger hover:bg-red-600 text-white",
  ghost: "bg-transparent hover:bg-surface-light text-text-muted",
  success: "bg-success hover:bg-green-600 text-white",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, children, disabled, className = "", ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          処理中...
        </span>
      ) : (
        children
      )}
    </button>
  )
);
Button.displayName = "Button";
