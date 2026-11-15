import Link from "next/link";
import { getDb } from "@/lib/db";
import { currentUserId } from "@/lib/access";
import { formatLabel } from "@/lib/formats";
import { LaurelMark } from "@/components/LaurelMark";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

export default async function TournamentsPage() {
  const db = getDb();
  const userId = await currentUserId();
  const tournaments = await db.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } } },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Tournaments</h1>
          <p className="mt-2 text-zinc-600">Every bracket on Laurel, newest first.</p>
        </div>
        <Link
          href="/tournaments/new"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          New tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <LaurelMark className="mx-auto h-10 w-10 text-amber-500" />
          <h2 className="mt-4 font-display text-2xl font-semibold">No tournaments yet</h2>
          <p className="mt-2 text-zinc-600">Be the first to crown a champion.</p>
          <Link
            href="/tournaments/new"
            className="mt-6 inline-block rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-300"
          >
            Create a tournament
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tournaments/${t.id}`}
                className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold leading-snug group-hover:text-amber-700">{t.name}</h2>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-1 text-sm text-zinc-500">{t.game ?? "Any game"}
                  {userId && t.ownerId === userId && <span className="ml-2 font-medium text-amber-700">· Yours</span>}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6 text-xs text-zinc-500">
                  <span className="rounded-full border border-zinc-200 px-2.5 py-0.5">{formatLabel(t.format)}</span>
                  <span>
                    {t._count.participants} players · {dateFmt.format(t.createdAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
