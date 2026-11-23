import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { canView, currentUserId } from "@/lib/access";
import { formatLabel, visibilityLabel } from "@/lib/formats";
import { computeStandings, findChampion } from "@/lib/standings";
import { swissRoundCount } from "@/lib/swiss";
import { teamCount } from "@/lib/teams";
import { minPlayers } from "@/lib/validation";
import { ButtonLink } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { ActionButton } from "@/components/molecules/ActionButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ShareButton } from "@/components/molecules/ShareButton";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { Bracket } from "@/components/organisms/Bracket";
import { RegistrationPanel } from "@/components/organisms/RegistrationPanel";
import { PlayerPool, SeedList, TeamGrid } from "@/components/organisms/Roster";
import { SetupChecklist, type SetupStep } from "@/components/organisms/SetupChecklist";
import { Standings } from "@/components/organisms/Standings";
import { TournamentHero } from "@/components/organisms/TournamentHero";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getDb().tournament.findUnique({ where: { id }, select: { name: true, visibility: true, ownerId: true } });
  if (!t || !canView(t, await currentUserId())) return { title: "Tournament not found" };
  // Unlisted and private tournaments stay out of search engines.
  return { title: t.name, ...(t.visibility !== "PUBLIC" && { robots: { index: false, follow: false } }) };
}

export default async function TournamentPage({ params }: Props) {
  const db = getDb();
  const { id } = await params;
  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      participants: { orderBy: { seed: "asc" } },
      matches: { orderBy: [{ round: "asc" }, { position: "asc" }] },
      players: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!tournament) notFound();
  const userId = await currentUserId();
  if (!canView(tournament, userId)) notFound(); // private: don't reveal that it exists
  const canManage = tournament.ownerId !== null && tournament.ownerId === userId;

  const { format, matches, status, teamSize, players, participants } = tournament;
  const teams = teamSize > 1;
  const mixed = teams && participants.length > 0;
  const playerCount = teams ? players.length : participants.length;
  const needed = minPlayers(teamSize);
  const canStart = participants.length >= 2;
  const ids = participants.map((p) => p.id);
  const names = Object.fromEntries(participants.map((p) => [p.id, p.name]));
  const champion = status === "COMPLETED" ? findChampion(format, ids, matches) : null;
  const hasStandings = format === "ROUND_ROBIN" || format === "SWISS";
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const played = matches.filter((m) => m.status === "COMPLETED" && !m.bye).length;
  const total = matches.filter((m) => !m.bye).length;
  let progress: { value: number; label: string } | null = null;
  if (status === "IN_PROGRESS" && total > 0) {
    if (format === "SWISS") {
      // Swiss rounds are generated one at a time, so measure finished rounds plus the share of the current one.
      const rounds = swissRoundCount(ids.length);
      const round = Math.max(...matches.map((m) => m.round));
      const current = matches.filter((m) => m.round === round && !m.bye);
      const currentDone = current.filter((m) => m.status === "COMPLETED").length;
      const share = current.length > 0 ? currentDone / current.length : 0;
      progress = { value: Math.min(1, (round - 1 + share) / rounds), label: `Round ${round} of ${rounds}` };
    } else {
      progress = { value: played / total, label: `${played} of ${total} ${total === 1 ? "match" : "matches"} played` };
    }
  }

  const facts = [
    formatLabel(format),
    tournament.game ?? "Any game",
    teams ? `${teamSize}v${teamSize}` : "Solo",
    plural(playerCount, "player") + (mixed ? ` · ${plural(participants.length, "team")}` : ""),
    ...(tournament.visibility === "PUBLIC" ? [] : [visibilityLabel(tournament.visibility)]),
  ];

  const startButton = (
    <ActionButton url={`/api/tournaments/${tournament.id}/start`} label="Start tournament" busyLabel="Generating bracket…" variant="accent" align="start" />
  );
  const editLink = (label: string) => (
    <ButtonLink href={`/tournaments/${tournament.id}/edit`} variant="secondary" size="sm">
      {label}
    </ButtonLink>
  );

  const steps: SetupStep[] = teams
    ? [
        {
          label: `Gather at least ${needed} players`,
          detail: `${plural(players.length, "player")} so far${tournament.registrationOpen ? ", sign-ups are open" : ""}.`,
          done: players.length >= needed,
          action: tournament.registrationOpen ? undefined : editLink("Add players"),
        },
        {
          label: "Mix players into random teams",
          detail: mixed ? `${plural(participants.length, "team")} of ${teamSize}.` : `Makes ${teamCount(players.length, teamSize)} teams of ${teamSize}.`,
          done: mixed,
          action: <ActionButton url={`/api/tournaments/${tournament.id}/teams`} label="Mix teams" busyLabel="Mixing…" align="start" />,
        },
        { label: "Start the tournament", detail: "Sign-ups close and the bracket is generated.", done: false, action: startButton },
      ]
    : [
        {
          label: "Add at least 2 players",
          detail: `${plural(participants.length, "player")} so far${tournament.registrationOpen ? ", sign-ups are open" : ""}.`,
          done: canStart,
          action: tournament.registrationOpen ? undefined : editLink("Add players"),
        },
        {
          label: "Start the tournament",
          detail: `Sign-ups close and the ${formatLabel(format).toLowerCase()} bracket is generated.`,
          done: false,
          action: startButton,
        },
      ];

  return (
    <div className="space-y-10">
      <TournamentHero
        name={tournament.name}
        status={status}
        facts={facts}
        progress={progress}
        champion={champion ? names[champion] : null}
        back={canManage ? { href: "/dashboard", label: "My tournaments" } : undefined}
        actions={
          <>
            {/* Private tournaments can only be opened by the organizer, so there's nothing to share. */}
            {tournament.visibility !== "PRIVATE" && <ShareButton title={tournament.name} variant="inverse" />}
            {canManage && (
              <ButtonLink href={`/tournaments/${tournament.id}/edit`} variant="inverse">
                Edit
              </ButtonLink>
            )}
          </>
        }
      />

      {status === "DRAFT" ? (
        <>
          {canManage && (
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <SetupChecklist steps={steps} />
              <RegistrationPanel
                tournamentId={tournament.id}
                open={tournament.registrationOpen}
                isPrivate={tournament.visibility === "PRIVATE"}
              />
            </div>
          )}
          {!canManage && tournament.registrationOpen && (
            <Card tone="accent" className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Sign-ups are open</h2>
                <p className="mt-1 text-sm text-muted">Add your name to play in this tournament.</p>
              </div>
              <ButtonLink href={`/tournaments/${tournament.id}/join`} variant="accent">
                Join tournament
              </ButtonLink>
            </Card>
          )}

          {teams ? (
            <>
              <section>
                <SectionHeading
                  title="Teams"
                  count={mixed ? participants.length : undefined}
                  description={
                    mixed
                      ? `Random teams of ${teamSize}. Numbers are seeds.`
                      : players.length < needed
                        ? `Teams appear here once there are at least ${needed} players and they're mixed.`
                        : canManage
                          ? "Mix the players to make teams."
                          : "The organizer hasn’t mixed the teams yet."
                  }
                  actions={
                    canManage && mixed && (
                      <ActionButton url={`/api/tournaments/${tournament.id}/teams`} label="Re-mix teams" busyLabel="Mixing…" variant="secondary" />
                    )
                  }
                />
                {mixed && <TeamGrid teams={participants} />}
              </section>
              <section>
                <SectionHeading title="Players" count={players.length} />
                {players.length === 0 ? (
                  <EmptyState compact title="No one has signed up yet" body={canManage ? "Share the sign-up link or add names in Edit." : undefined} />
                ) : (
                  <PlayerPool players={players} />
                )}
              </section>
            </>
          ) : (
            <section>
              <SectionHeading title="Players" count={participants.length} description={participants.length > 0 ? "Numbers are seeds." : undefined} />
              {participants.length === 0 ? (
                <EmptyState compact title="No one has signed up yet" body={canManage ? "Share the sign-up link or add names in Edit." : undefined} />
              ) : (
                <SeedList entries={participants} />
              )}
            </section>
          )}
        </>
      ) : (
        <>
          {hasStandings && (
            <section>
              <SectionHeading title="Standings" />
              <Standings
                standings={computeStandings(ids, matches, format)}
                names={names}
                showBuchholz={format === "SWISS"}
                entryLabel={teams ? "Team" : "Player"}
              />
            </section>
          )}
          <div>
            <Bracket matches={matches} names={names} format={format} canManage={canManage} />
            {canManage && played > 0 && (
              <p className="mt-3 text-sm text-subtle">Tip: click a finished match to correct or undo its result.</p>
            )}
          </div>
          {teams && (
            <section>
              <SectionHeading title="Teams" count={participants.length} />
              <TeamGrid teams={participants} showSeeds={false} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
