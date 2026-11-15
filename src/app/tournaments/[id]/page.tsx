import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { currentUserId } from "@/lib/access";
import { formatLabel } from "@/lib/formats";
import { computeStandings, findChampion } from "@/lib/standings";
import { swissRoundCount } from "@/lib/swiss";
import { Bracket } from "@/components/Bracket";
import { LaurelMark } from "@/components/LaurelMark";
import { Standings } from "@/components/Standings";
import { StartButton } from "@/components/StartButton";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      participants: { orderBy: { seed: "asc" } },
      matches: { orderBy: [{ round: "asc" }, { position: "asc" }] },
    },
  });
  if (!tournament) notFound();
  const canManage = tournament.ownerId !== null && tournament.ownerId === (await currentUserId());

  const { format, matches, status } = tournament;
  const ids = tournament.participants.map((p) => p.id);
  const names = Object.fromEntries(tournament.participants.map((p) => [p.id, p.name]));
  const champion = status === "COMPLETED" ? findChampion(format, ids, matches) : null;
  const hasStandings = format === "ROUND_ROBIN" || format === "SWISS";

  const played = matches.filter((m) => m.status === "COMPLETED" && !m.bye).length;
  const total = matches.filter((m) => !m.bye).length;
  let progress = total > 0 ? `${played} of ${total} matches played` : null;
  if (format === "SWISS" && matches.length > 0) {
    progress = `Round ${Math.max(...matches.map((m) => m.round))} of ${swissRoundCount(ids.length)}`;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-8 text-white sm:px-10 sm:py-10">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <Link href="/tournaments" className="text-sm text-zinc-400 hover:text-white">
              ← All tournaments
            </Link>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{tournament.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
              <StatusBadge status={status} />
              <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs">{formatLabel(format)}</span>
              <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs">{tournament.game ?? "Any game"}</span>
              <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-xs">{ids.length} players</span>
              {progress && status === "IN_PROGRESS" && <span className="text-xs text-zinc-400">{progress}</span>}
            </div>
          </div>
          {canManage && (
            <div className="flex items-start gap-2">
              <Link
                href={`/tournaments/${tournament.id}/edit`}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium hover:bg-white/10"
              >
                Edit
              </Link>
              {status === "DRAFT" && <StartButton tournamentId={tournament.id} />}
            </div>
          )}
        </div>

        {champion && (
          <div className="relative mt-8 flex items-center gap-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4">
            <LaurelMark className="h-10 w-10 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-300">Champion</p>
              <p className="font-display text-2xl font-semibold">{names[champion]}</p>
            </div>
          </div>
        )}
      </section>

      {status === "DRAFT" ? (
        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold">Players</h2>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tournament.participants.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5">
                <span className="w-6 text-right text-xs tabular-nums text-zinc-400">{p.seed}</span>
                <span className="truncate font-medium">{p.name}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-zinc-500">
            Numbers are seeds.{canManage && <> Start the tournament to generate the {formatLabel(format).toLowerCase()} bracket.</>}
          </p>
        </section>
      ) : (
        <>
          {hasStandings && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-semibold">Standings</h2>
              <Standings standings={computeStandings(ids, matches, format)} names={names} showBuchholz={format === "SWISS"} />
            </section>
          )}
          <Bracket matches={matches} names={names} format={format} canManage={canManage} />
          {canManage && played > 0 && (
            <p className="-mt-6 text-sm text-zinc-500">Tip: click a finished match to correct or undo its result.</p>
          )}
        </>
      )}
    </div>
  );
}
