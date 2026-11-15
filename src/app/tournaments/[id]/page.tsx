import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { formatLabel } from "@/lib/formats";
import { computeStandings, findChampion } from "@/lib/standings";
import { swissRoundCount } from "@/lib/swiss";
import { Bracket } from "@/components/Bracket";
import { Standings } from "@/components/Standings";
import { StartButton } from "@/components/StartButton";

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

  const { format, matches } = tournament;
  const ids = tournament.participants.map((p) => p.id);
  const names = Object.fromEntries(tournament.participants.map((p) => [p.id, p.name]));
  const champion = tournament.status === "COMPLETED" ? findChampion(format, ids, matches) : null;
  const hasStandings = format === "ROUND_ROBIN" || format === "SWISS";

  let progress: string | null = null;
  if (format === "SWISS" && matches.length > 0) {
    progress = `Round ${Math.max(...matches.map((m) => m.round))} of ${swissRoundCount(ids.length)}`;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{tournament.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {[tournament.game ?? "Any game", formatLabel(format), progress, tournament.status.replace("_", " ").toLowerCase()]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {tournament.status === "DRAFT" && <StartButton tournamentId={tournament.id} />}
      </div>

      {champion && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 font-medium">
          🏆 Champion: <span className="font-display text-lg">{names[champion]}</span>
        </p>
      )}

      {tournament.status === "DRAFT" ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-2 font-semibold">Participants ({tournament.participants.length})</h2>
          <ol className="list-decimal pl-6 text-sm">
            {tournament.participants.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ol>
        </section>
      ) : (
        <>
          {hasStandings && (
            <Standings standings={computeStandings(ids, matches, format)} names={names} showBuchholz={format === "SWISS"} />
          )}
          <Bracket matches={matches} names={names} format={format} />
        </>
      )}
    </div>
  );
}
