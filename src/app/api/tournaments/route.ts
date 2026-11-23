import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createTournamentSchema } from "@/lib/validation";
import { currentUserId, unauthorized } from "@/lib/access";

export async function GET() {
  const db = getDb();
  const tournaments = await db.tournament.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(tournaments);
}

export async function POST(req: Request) {
  const ownerId = await currentUserId();
  if (!ownerId) return unauthorized();
  const db = getDb();
  const parsed = createTournamentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, game, format, teamSize, registrationOpen, visibility, participants } = parsed.data;
  const teams = teamSize > 1;

  const tournament = await db.tournament.create({
    data: {
      name,
      game,
      format,
      teamSize,
      registrationOpen,
      visibility,
      ownerId,
      // Solo: players are the bracket entries. Teams: players wait in the pool to be mixed.
      ...(teams
        ? { players: { create: participants.map((p) => ({ name: p })) } }
        : { participants: { create: participants.map((p, i) => ({ name: p, seed: i + 1 })) } }),
    },
  });

  return NextResponse.json({ id: tournament.id }, { status: 201 });
}
