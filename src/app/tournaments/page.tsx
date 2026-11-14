import Link from "next/link";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const db = getDb();
  const tournaments = await db.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } } },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tournaments</h1>
      {tournaments.length === 0 ? (
        <p className="text-zinc-600">
          No tournaments yet. <Link href="/tournaments/new" className="text-indigo-600 underline">Create one</Link>.
        </p>
      ) : (
        <ul className="divide-y rounded border bg-white">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Link href={`/tournaments/${t.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50">
                <span>
                  <span className="font-medium">{t.name}</span>
                  {t.game && <span className="ml-2 text-sm text-zinc-500">{t.game}</span>}
                </span>
                <span className="text-sm text-zinc-500">
                  {t._count.participants} players · {t.format.replace("_", " ").toLowerCase()} · {t.status.replace("_", " ").toLowerCase()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
