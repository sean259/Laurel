import Link from "next/link";
import type { Tournament } from "@prisma/client";
import { formatLabel, visibilityLabel } from "@/lib/formats";
import { Badge } from "../atoms/Badge";
import { StatusBadge } from "../molecules/StatusBadge";

const dateFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

/** One tournament in the list. The whole card is a link. */
export function TournamentCard({
  tournament: t,
  players,
  mine,
}: {
  tournament: Pick<Tournament, "id" | "name" | "game" | "status" | "format" | "teamSize" | "createdAt" | "visibility">;
  players: number;
  mine: boolean;
}) {
  return (
    <Link
      href={`/tournaments/${t.id}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg hover:shadow-zinc-200/60 motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 break-words font-display text-xl font-semibold leading-snug text-ink group-hover:text-accent-ink">
          {t.name}
        </h2>
        <StatusBadge status={t.status} />
      </div>
      <p className="mt-1 text-sm text-muted">
        {t.game ?? "Any game"}
        {mine && <span className="ml-2 font-medium text-accent-ink">· Yours</span>}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6 text-xs text-subtle">
        <Badge tone="outline">{formatLabel(t.format)}</Badge>
        {t.teamSize > 1 && <Badge tone="outline">{`${t.teamSize}v${t.teamSize}`}</Badge>}
        {t.visibility !== "PUBLIC" && <Badge tone="neutral">{visibilityLabel(t.visibility)}</Badge>}
        <span className="ml-auto tabular-nums">
          {players} {players === 1 ? "player" : "players"} · <time dateTime={t.createdAt.toISOString()}>{dateFmt.format(t.createdAt)}</time>
        </span>
      </div>
    </Link>
  );
}
