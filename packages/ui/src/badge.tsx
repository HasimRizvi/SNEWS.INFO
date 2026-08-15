import type { HTMLAttributes } from "react";

type BadgeVariant = "accent" | "navy" | "teal" | "success" | "warning" | "danger" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANTS: Record<BadgeVariant, string> = {
  accent: "bg-[var(--accent)]/10 text-[var(--accent-dark)]",
  navy: "bg-[var(--navy)] text-white",
  teal: "bg-[var(--teal)]/10 text-[var(--teal-dark)]",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  neutral: "bg-[var(--surface)] text-[var(--muted)]",
};

export function Badge({ variant = "neutral", className = "", children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
