import type { Metadata } from "next";
import type { TournamentStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { currentUserId } from "@/lib/access";
import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { TournamentCard } from "@/components/organisms/TournamentCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My tournaments", robots: { index: false } };

// Live first: those are the ones that need scores reported.
const GROUPS: { status: TournamentStatus; title: string }[] = [
  { status: "IN_PROGRESS", title: "Live" },
  { status: "DRAFT", title: "Drafts" },
  { status: "COMPLETED", title: "Completed" },
];

/** Every tournament the signed-in user organizes, including unlisted and private ones. */
export default async function DashboardPage() {
  const userId = await currentUserId();
  if (!userId) redirect("/sign-in?next=/dashboard");

  const tournaments = await getDb().tournament.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { participants: true, players: true } } },
  });

  const newButton = <ButtonLink href="/tournaments/new">New tournament</ButtonLink>;

  return (
    <div>
      <PageHeader title="My tournaments" description="Everything you organize, including unlisted and private ones." actions={newButton} />

      {tournaments.length === 0 ? (
        <EmptyState
          title="You haven't made a tournament yet"
          body="Create one in a minute, then share the link with your players."
          action={
            <ButtonLink href="/tournaments/new" variant="accent">
              Create a tournament
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-10">
          {GROUPS.map(({ status, title }) => {
            const group = tournaments.filter((t) => t.status === status);
            if (group.length === 0) return null;
            return (
              <section key={status}>
                <SectionHeading title={title} count={group.length} />
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((t) => (
                    <li key={t.id}>
                      <TournamentCard
                        tournament={t}
                        players={t.teamSize > 1 ? t._count.players : t._count.participants}
                        mine={false}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
