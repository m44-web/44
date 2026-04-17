import { memo } from "react";

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

// Stable palette — deterministic by name hash so avatars stay consistent.
const COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-indigo-500",
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // Japanese name: take first char of first word (family name)
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return trimmed.slice(0, 2);
}

export const Avatar = memo(function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const color = COLORS[hashString(name) % COLORS.length];
  const initials = getInitials(name);
  return (
    <div
      className={`${SIZES[size]} ${color} ${className} rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none`}
      aria-label={name}
    >
      {initials}
    </div>
  );
});
