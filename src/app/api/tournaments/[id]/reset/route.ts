import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Throw away the bracket and all results, returning the tournament to DRAFT.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const tournament = await db.tournament.findUnique({ where: { id }, select: { id: true } });
  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.$transaction([
    db.match.deleteMany({ where: { tournamentId: id } }),
    db.tournament.update({ where: { id }, data: { status: "DRAFT" } }),
  ]);
  return NextResponse.json({ ok: true });
}
