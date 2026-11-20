import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { currentUserId } from "@/lib/access";
import { PageHeader } from "@/components/molecules/PageHeader";
import { DangerZone } from "@/components/organisms/DangerZone";
import { TournamentForm } from "@/components/organisms/TournamentForm";

export const dynamic = "force-dynamic";

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const t = await db.tournament.findUnique({
    where: { id },
    include: {
      participants: { orderBy: { seed: "asc" }, select: { name: true } },
      players: { orderBy: { createdAt: "asc" }, select: { name: true } },
    },
  });
  if (!t) notFound();
  // Only the organizer can edit; everyone else just sees the tournament.
  if (!t.ownerId || t.ownerId !== (await currentUserId())) redirect(`/tournaments/${t.id}`);
  const started = t.status !== "DRAFT";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Edit tournament"
        back={{ href: `/tournaments/${t.id}`, label: t.name }}
        description={
          started
            ? "The bracket is already running, so only names can change here."
            : "Change anything you like before you start."
        }
      />
      <TournamentForm
        tournament={{
          id: t.id,
          name: t.name,
          game: t.game,
          format: t.format,
          teamSize: t.teamSize,
          registrationOpen: t.registrationOpen,
          started,
          // Draft team tournaments edit the player pool; otherwise the bracket entries.
          participants: (!started && t.teamSize > 1 ? t.players : t.participants).map((p) => p.name),
        }}
      />
      <DangerZone id={t.id} name={t.name} started={started} />
    </div>
  );
}
