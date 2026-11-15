import { Prisma, type PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getDb } from "./db";
import { EngineError, type EngineMatch } from "./engine";
import type { ChangeSet } from "./report";

type Tx = Prisma.TransactionClient;
type LoadedTournament = Awaited<ReturnType<typeof loadForMatch>>;

async function loadForMatch(tx: Tx, matchId: string) {
  const match = await tx.match.findUnique({ where: { id: matchId }, select: { tournamentId: true } });
  if (!match) throw new EngineError("Not found");
  return tx.tournament.findUniqueOrThrow({
    where: { id: match.tournamentId },
    include: { participants: { orderBy: { seed: "asc" }, select: { id: true } }, matches: true },
  });
}

/** Save an engine change set: deletes first (frees unique slots), then updates, then creates. */
async function saveChanges(tx: Tx, tournamentId: string, changes: ChangeSet) {
  if (changes.deletedIds.length > 0) {
    await tx.match.deleteMany({ where: { id: { in: changes.deletedIds }, tournamentId } });
  }
  for (const m of changes.updated) {
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
  if (changes.created.length > 0) {
    await tx.match.createMany({ data: changes.created.map((m: EngineMatch) => ({ ...m, tournamentId })) });
  }
  await tx.tournament.update({
    where: { id: tournamentId },
    data: { status: changes.tournamentCompleted ? "COMPLETED" : "IN_PROGRESS" },
  });
}

/**
 * Load a match's tournament, run an engine operation and save the result, all in one
 * serializable transaction so two organizers can't advance players from stale data.
 * Engine errors become 404/409 responses.
 */
export async function runMatchChange<T extends ChangeSet>(
  matchId: string,
  compute: (tournament: LoadedTournament) => T,
): Promise<NextResponse> {
  const db: PrismaClient = getDb();
  try {
    const result = await db.$transaction(
      async (tx) => {
        const tournament = await loadForMatch(tx, matchId);
        if (tournament.status === "DRAFT") throw new EngineError("Tournament hasn't started");
        const changes = compute(tournament);
        await saveChanges(tx, tournament.id, changes);
        return changes;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return NextResponse.json({ ok: true, tournamentCompleted: result.tournamentCompleted });
  } catch (err) {
    if (err instanceof EngineError) {
      return NextResponse.json({ error: err.message }, { status: err.message === "Not found" ? 404 : 409 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034") {
      return NextResponse.json({ error: "Someone else just changed this tournament. Please try again." }, { status: 409 });
    }
    throw err;
  }
}
