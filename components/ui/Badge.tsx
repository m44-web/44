type BadgeProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function Badge({ label, active = false, onClick }: BadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
        active
          ? "bg-accent text-primary shadow-[0_0_12px_rgba(0,212,255,0.3)]"
          : "bg-sub-bg text-text-secondary border border-border hover:border-accent/30 hover:text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}
