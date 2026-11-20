import Link from "next/link";
import type { ReactNode } from "react";
import type { TournamentStatus } from "@prisma/client";
import { Badge } from "../atoms/Badge";
import { LaurelMark } from "../atoms/LaurelMark";
import { StatusBadge } from "../molecules/StatusBadge";

/** Dark header at the top of a tournament page: name, facts, organizer actions, and the champion when done. */
export function TournamentHero({
  name,
  status,
  facts,
  progress,
  champion,
  actions,
}: {
  name: string;
  status: TournamentStatus;
  facts: string[];
  /** 0–1 share of matches played, plus a label. */
  progress?: { value: number; label: string } | null;
  champion?: string | null;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-inverse px-6 py-8 text-white sm:px-10 sm:py-10">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <Link href="/tournaments" className="text-sm font-medium text-zinc-300 hover:text-white">
            <span aria-hidden>← </span>All tournaments
          </Link>
          <h1 className="mt-3 break-words font-display text-4xl font-semibold sm:text-5xl">{name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            {facts.map((f) => (
              <Badge key={f} tone="inverse">
                {f}
              </Badge>
            ))}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-start gap-2">{actions}</div>}
      </div>

      {progress && (
        <div className="relative mt-6 max-w-md">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>{progress.label}</span>
            <span className="tabular-nums">{Math.round(progress.value * 100)}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Tournament progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.value * 100)}
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15"
          >
            <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress.value * 100}%` }} />
          </div>
        </div>
      )}

      {champion && (
        <div className="relative mt-8 flex items-center gap-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4">
          <LaurelMark className="h-10 w-10 shrink-0 text-amber-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Champion</p>
            <p className="font-display text-2xl font-semibold">{champion}</p>
          </div>
        </div>
      )}
    </section>
  );
}
