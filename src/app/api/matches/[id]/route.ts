import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { EngineError } from "@/lib/engine";
import { reportResult } from "@/lib/report";
import { reportScoreSchema } from "@/lib/validation";

// Report a score. The engine works out who advances (and any new matches);
// this route loads the tournament and saves the result in one transaction.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const parsed = reportScoreSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { score1, score2 } = parsed.data;

  try {
    const winnerId = await db.$transaction(
      async (tx) => {
        const match = await tx.match.findUnique({ where: { id }, select: { tournamentId: true } });
        if (!match) throw new EngineError("Not found");

        const tournament = await tx.tournament.findUniqueOrThrow({
          where: { id: match.tournamentId },
          include: { participants: { orderBy: { seed: "asc" }, select: { id: true } }, matches: true },
        });

        const result = reportResult({
          format: tournament.format,
          participantIds: tournament.participants.map((p) => p.id),
          matches: tournament.matches,
          matchId: id,
          score1,
          score2,
        });

        for (const m of result.updated) {
          await tx.match.update({
            where: { id: m.id },
            data: {
              participant1Id: m.participant1Id,
              participant2Id: m.participant2Id,
              score1: m.score1,
              score2: m.score2,
              winnerId: m.winnerId,
              status: m.status,
            },
          });
        }
        if (result.created.length > 0) {
          await tx.match.createMany({ data: result.created.map((m) => ({ ...m, tournamentId: tournament.id })) });
        }
        if (result.tournamentCompleted) {
          await tx.tournament.update({ where: { id: tournament.id }, data: { status: "COMPLETED" } });
        }
        return result.winnerId;
      },
      // Serializable: two people reporting at once can't both advance players from stale data.
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return NextResponse.json({ ok: true, winnerId });
  } catch (err) {
    if (err instanceof EngineError) {
      const status = err.message === "Not found" ? 404 : 409;
      return NextResponse.json({ error: err.message }, { status });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034") {
      return NextResponse.json({ error: "Someone else just reported a score. Please try again." }, { status: 409 });
    }
    throw err;
  }
}
