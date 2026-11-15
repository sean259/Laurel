import { NextResponse } from "next/server";
import { currentUser } from "./auth/server";
import { getDb } from "./db";

/** The signed-in user's id, or null. */
export async function currentUserId(): Promise<string | null> {
  return (await currentUser())?.id ?? null;
}

export const unauthorized = () => NextResponse.json({ error: "Sign in to do that" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "Only the organizer can manage this tournament" }, { status: 403 });
const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

/**
 * Check the signed-in user owns a tournament (looked up by tournament or match id).
 * Returns an error response to send back, or null if allowed.
 */
export async function denyUnlessOwner(ref: { tournamentId: string } | { matchId: string }): Promise<NextResponse | null> {
  const userId = await currentUserId();
  if (!userId) return unauthorized();
  const db = getDb();
  let tournamentId: string;
  if ("matchId" in ref) {
    const match = await db.match.findUnique({ where: { id: ref.matchId }, select: { tournamentId: true } });
    if (!match) return notFound();
    tournamentId = match.tournamentId;
  } else {
    tournamentId = ref.tournamentId;
  }
  const t = await db.tournament.findUnique({ where: { id: tournamentId }, select: { ownerId: true } });
  if (!t) return notFound();
  return t.ownerId === userId ? null : forbidden();
}
