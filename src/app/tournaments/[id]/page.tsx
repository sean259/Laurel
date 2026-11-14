import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Bracket } from "@/components/Bracket";
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

  const names = Object.fromEntries(tournament.participants.map((p) => [p.id, p.name]));
  const champion = tournament.status === "COMPLETED" && tournament.format === "SINGLE_ELIMINATION"
    ? tournament.matches.at(-1)?.winnerId
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          <p className="text-sm text-zinc-500">
            {tournament.game ?? "Any game"} · {tournament.format.replace("_", " ").toLowerCase()} · {tournament.status.replace("_", " ").toLowerCase()}
          </p>
        </div>
        {tournament.status === "DRAFT" && <StartButton tournamentId={tournament.id} />}
      </div>

      {champion && (
        <p className="rounded border border-amber-300 bg-amber-50 px-4 py-3 font-medium">
          🏆 Champion: {names[champion]}
        </p>
      )}

      {tournament.status === "DRAFT" ? (
        <section className="rounded border bg-white p-4">
          <h2 className="mb-2 font-semibold">Participants ({tournament.participants.length})</h2>
          <ol className="list-decimal pl-6 text-sm">
            {tournament.participants.map((p) => <li key={p.id}>{p.name}</li>)}
          </ol>
        </section>
      ) : (
        <Bracket matches={tournament.matches} names={names} format={tournament.format} />
      )}
    </div>
  );
}
