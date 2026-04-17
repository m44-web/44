import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction, className = "" }: EmptyStateProps) {
  return (
    <div className={`bg-card-bg border border-border rounded-xl p-8 text-center space-y-3 ${className}`}>
      {icon && (
        <div className="w-16 h-16 mx-auto rounded-full bg-sub-bg flex items-center justify-center text-text-secondary">
          {icon}
        </div>
      )}
      <div>
        <p className="text-base font-medium text-text-primary">{title}</p>
        {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
