import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { formatLabel } from "@/lib/formats";
import { Badge } from "@/components/atoms/Badge";
import { ButtonLink } from "@/components/atoms/Button";
import { JoinForm } from "@/components/organisms/JoinForm";
import { CenteredPanel } from "@/components/templates/CenteredPanel";

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
    <CenteredPanel
      eyebrow="Sign up for"
      title={t.name}
      description={
        <>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <Badge tone="outline">{t.game ?? "Any game"}</Badge>
            <Badge tone="outline">{formatLabel(t.format)}</Badge>
            <Badge tone="outline">{teams ? `${t.teamSize}v${t.teamSize}, random teams` : "Solo"}</Badge>
          </div>
          <p className="mt-3 text-sm">
            <span className="font-semibold text-ink tabular-nums">{signedUp}</span> {signedUp === 1 ? "player has" : "players have"}{" "}
            signed up
          </p>
        </>
      }
    >
      {open ? (
        <JoinForm tournamentId={t.id} teams={teams} />
      ) : (
        <div className="text-center">
          <p className="rounded-xl bg-surface-sunken px-4 py-3 text-sm text-muted">
            {t.status === "DRAFT" ? "Sign-ups are closed right now." : "This tournament has already started."}
          </p>
          <ButtonLink href={`/tournaments/${t.id}`} className="mt-6">
            View tournament
          </ButtonLink>
        </div>
      )}
    </CenteredPanel>
  );
}
