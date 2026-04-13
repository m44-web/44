"use client";

export function StatusIndicator({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          active ? "bg-success animate-pulse" : "bg-text-muted"
        }`}
      />
      <span className="text-sm text-text-muted">{label}</span>
    </div>
  );
}
