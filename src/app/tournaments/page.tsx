import { getDb } from "@/lib/db";
import { currentUserId } from "@/lib/access";
import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TournamentCard } from "@/components/organisms/TournamentCard";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const db = getDb();
  const userId = await currentUserId();
  const tournaments = await db.tournament.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true, players: true } } },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Tournaments"
        description="Every public bracket on Laurel, newest first."
        actions={<ButtonLink href="/tournaments/new">New tournament</ButtonLink>}
      />

      {tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments yet"
          body="Be the first to crown a champion."
          action={
            <ButtonLink href="/tournaments/new" variant="accent">
              Create a tournament
            </ButtonLink>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <li key={t.id}>
              <TournamentCard
                tournament={t}
                players={t.teamSize > 1 ? t._count.players : t._count.participants}
                mine={!!userId && t.ownerId === userId}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
