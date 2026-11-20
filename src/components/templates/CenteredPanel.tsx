import type { ReactNode } from "react";
import { Card } from "../atoms/Card";
import { LaurelMark } from "../atoms/LaurelMark";

/** Narrow centered card with the logo on top: sign-in, join, and "you need to sign in" pages. */
export function CenteredPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card padding="none" className="mx-auto max-w-md px-6 py-10 sm:px-10">
      <div className="text-center">
        <LaurelMark className="mx-auto h-10 w-10 text-amber-500" />
        {eyebrow && <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-subtle">{eyebrow}</p>}
        <h1 className={`font-display text-3xl font-semibold text-ink ${eyebrow ? "mt-1" : "mt-4"}`}>{title}</h1>
        {description && <div className="mt-2 text-muted">{description}</div>}
      </div>
      {children && <div className="mt-8">{children}</div>}
    </Card>
  );
}
