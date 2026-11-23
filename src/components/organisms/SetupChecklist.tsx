import type { ReactNode } from "react";
import { Card } from "../atoms/Card";

export type SetupStep = { label: string; detail?: ReactNode; done: boolean; action?: ReactNode };

/** Organizer-only: what's left before the tournament can start. The first unfinished step is highlighted. */
export function SetupChecklist({ steps }: { steps: SetupStep[] }) {
  const current = steps.findIndex((s) => !s.done);
  return (
    <Card role="region" aria-labelledby="setup-heading">
      <h2 id="setup-heading" className="font-display text-xl font-semibold text-ink">
        Get ready to start
      </h2>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => {
          const active = i === current;
          return (
            <li
              key={s.label}
              aria-current={active ? "step" : undefined}
              className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 ${
                active ? "border-accent-line bg-accent-soft" : "border-line"
              }`}
            >
              <span
                aria-hidden
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  s.done ? "bg-success text-on-ink" : active ? "bg-ink text-on-ink" : "bg-surface-sunken text-muted"
                }`}
              >
                {s.done ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M6.4 11.2 3.2 8l-1.1 1.1 4.3 4.3 8-8-1.1-1.1z" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${s.done ? "text-muted" : "text-ink"}`}>
                  {s.label}
                  <span className="sr-only">{s.done ? " (done)" : active ? " (next)" : ""}</span>
                </p>
                {s.detail && <p className="mt-0.5 text-sm text-muted">{s.detail}</p>}
              </div>
              {s.action && active && <div className="w-full sm:w-auto">{s.action}</div>}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
