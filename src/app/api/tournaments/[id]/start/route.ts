import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateInitialMatches } from "@/lib/report";

// Generates the bracket and moves the tournament from DRAFT to IN_PROGRESS.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const tournament = await db.tournament.findUnique({
    where: { id },
    include: { participants: { orderBy: { seed: "asc" } } },
  });

  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (tournament.status !== "DRAFT") {
    return NextResponse.json({ error: "Tournament already started" }, { status: 409 });
  }

  const planned = generateInitialMatches(tournament.format, tournament.participants.map((p) => p.id));

  await db.$transaction([
    db.match.createMany({ data: planned.map((m) => ({ ...m, tournamentId: id })) }),
    db.tournament.update({ where: { id }, data: { status: "IN_PROGRESS" } }),
  ]);

  return NextResponse.json({ ok: true });
}
