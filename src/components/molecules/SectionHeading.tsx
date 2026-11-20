import type { ReactNode } from "react";

/** Heading for a section of a page, with an optional count, description and actions. */
export function SectionHeading({
  title,
  count,
  description,
  actions,
  id,
}: {
  title: ReactNode;
  count?: number;
  description?: ReactNode;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 id={id} className="font-display text-2xl font-semibold text-ink">
          {title}
          {count !== undefined && <span className="ml-2 text-base font-normal tabular-nums text-subtle">({count})</span>}
        </h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
