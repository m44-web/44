export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white/5 rounded animate-pulse ${className}`}
      {...props}
    />
  );
}
