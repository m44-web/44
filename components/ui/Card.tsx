import { memo } from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = memo(function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl bg-card-bg border border-border p-6 ${className}`}>
      {children}
    </div>
  );
});
