type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-card-bg border border-border p-6 ${
        hover
          ? "transition-all duration-300 hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
