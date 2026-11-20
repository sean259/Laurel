import type { ReactNode } from "react";
import { LaurelMark } from "../atoms/LaurelMark";

/** Friendly placeholder for "nothing here yet". */
export function EmptyState({
  title,
  body,
  action,
  compact = false,
}: {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-line-strong bg-surface text-center ${compact ? "px-6 py-8" : "px-6 py-16"}`}
    >
      {!compact && <LaurelMark className="mx-auto h-10 w-10 text-amber-500" />}
      <h2 className={`font-display font-semibold text-ink ${compact ? "text-lg" : "mt-4 text-2xl"}`}>{title}</h2>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
