import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { denyUnlessOwner } from "@/lib/access";
import { mixTeams, teamNames } from "@/lib/teams";

// Shuffle the player pool into random teams (replacing any previous mix).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const denied = await denyUnlessOwner({ tournamentId: id });
  if (denied) return denied;
  const t = await db.tournament.findUnique({
    where: { id },
    include: {
      players: { select: { name: true } },
      participants: { orderBy: { seed: "asc" }, select: { name: true } },
    },
  });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (t.status !== "DRAFT") {
    return NextResponse.json({ error: "Reset the tournament to draft to mix new teams" }, { status: 409 });
  }
  if (t.teamSize < 2) return NextResponse.json({ error: "This is a solo tournament" }, { status: 400 });

  let teams: string[][];
  try {
    teams = mixTeams(t.players.map((p) => p.name), t.teamSize);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }

  // Re-mixing keeps any names the organizer gave, in seed order; new slots get "Team N".
  const names = teamNames(t.participants.map((p) => p.name), teams.length);
  await db.$transaction([
    db.participant.deleteMany({ where: { tournamentId: id } }),
    db.participant.createMany({
      data: teams.map((members, i) => ({ name: names[i], seed: i + 1, members, tournamentId: id })),
    }),
  ]);
  return NextResponse.json({ ok: true });
}
