import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { reportScoreSchema } from "@/lib/validation";

// Report a score: records the winner and advances them to the next match.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const parsed = reportScoreSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { score1, score2 } = parsed.data;

  const match = await db.match.findUnique({ where: { id } });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (match.status !== "READY" || !match.participant1Id || !match.participant2Id) {
    return NextResponse.json({ error: "Match is not ready to be reported" }, { status: 409 });
  }

  const winnerId = score1 > score2 ? match.participant1Id : match.participant2Id;

  await db.$transaction(async (tx) => {
    await tx.match.update({
      where: { id },
      data: { score1, score2, winnerId, status: "COMPLETED" },
    });

    if (match.nextMatchId) {
      const next = await tx.match.update({
        where: { id: match.nextMatchId },
        data: match.nextMatchSlot === 1 ? { participant1Id: winnerId } : { participant2Id: winnerId },
      });
      if (next.participant1Id && next.participant2Id) {
        await tx.match.update({ where: { id: next.id }, data: { status: "READY" } });
      }
    }

    const remaining = await tx.match.count({
      where: { tournamentId: match.tournamentId, status: { not: "COMPLETED" } },
    });
    if (remaining === 0) {
      await tx.tournament.update({ where: { id: match.tournamentId }, data: { status: "COMPLETED" } });
    }
  });

  return NextResponse.json({ ok: true, winnerId });
}
