import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createTournamentSchema } from "@/lib/validation";

export async function GET() {
  const db = getDb();
  const tournaments = await db.tournament.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(tournaments);
}

export async function POST(req: Request) {
  const db = getDb();
  const parsed = createTournamentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, game, format, participants } = parsed.data;

  const tournament = await db.tournament.create({
    data: {
      name,
      game,
      format,
      participants: { create: participants.map((p, i) => ({ name: p, seed: i + 1 })) },
    },
  });

  return NextResponse.json({ id: tournament.id }, { status: 201 });
}
