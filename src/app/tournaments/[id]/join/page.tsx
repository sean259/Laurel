import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { formatLabel } from "@/lib/formats";
import { JoinForm } from "@/components/JoinForm";
import { LaurelMark } from "@/components/LaurelMark";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getDb().tournament.findUnique({ where: { id }, select: { name: true } });
  return { title: t ? `Join ${t.name}` : "Join tournament" };
}

export default async function JoinPage({ params }: Props) {
  const { id } = await params;
  const t = await getDb().tournament.findUnique({
    where: { id },
    include: { _count: { select: { participants: true, players: true } } },
  });
  if (!t) notFound();
  const teams = t.teamSize > 1;
  const signedUp = teams ? t._count.players : t._count.participants;
  const open = t.status === "DRAFT" && t.registrationOpen;

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white px-6 py-10 sm:px-10">
      <div className="text-center">
        <LaurelMark className="mx-auto h-10 w-10 text-amber-500" />
        <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">Sign up for</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{t.name}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {t.game ?? "Any game"} · {formatLabel(t.format)} · {teams ? `${t.teamSize}v${t.teamSize}, random teams` : "Solo"}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {signedUp} {signedUp === 1 ? "player" : "players"} signed up
        </p>
      </div>
      <div className="mt-8">
        {open ? (
          <JoinForm tournamentId={t.id} teams={teams} />
        ) : (
          <div className="text-center">
            <p className="text-zinc-600">
              {t.status === "DRAFT" ? "Sign-ups are closed right now." : "This tournament has already started."}
            </p>
            <Link
              href={`/tournaments/${t.id}`}
              className="mt-6 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              View tournament
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
