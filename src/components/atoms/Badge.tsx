import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "outline" | "inverse";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-muted",
  accent: "bg-amber-100 text-amber-900",
  success: "bg-emerald-100 text-emerald-900",
  outline: "border border-line text-muted",
  /** For dark surfaces. */
  inverse: "border border-white/20 text-zinc-200",
};

/** Small pill for a status or a fact (format, game, player count). */
export function Badge({ tone = "neutral", children, className = "" }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
