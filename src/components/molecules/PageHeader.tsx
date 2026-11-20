import Link from "next/link";
import type { ReactNode } from "react";

/** Page title block: optional back link, title, description and actions on the right. */
export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="text-sm font-medium text-muted hover:text-ink">
            <span aria-hidden>← </span>
            {back.label}
          </Link>
        )}
        <h1 className={`font-display text-3xl font-semibold text-ink sm:text-4xl ${back ? "mt-3" : ""}`}>{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
