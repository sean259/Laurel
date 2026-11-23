import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { denyUnlessOwner } from "@/lib/access";
import { renameSchema } from "@/lib/validation";

// Rename one bracket entry (a team or a solo player). Allowed at any stage: matches refer to
// entries by id, so the bracket and standings pick up the new name.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const denied = await denyUnlessOwner({ participantId: id });
  if (denied) return denied;
  const parsed = renameSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name } = parsed.data;

  const entry = await db.participant.findUnique({ where: { id }, select: { tournamentId: true } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Two entries with the same name would be impossible to tell apart in the bracket.
  const taken = await db.participant.count({
    where: { tournamentId: entry.tournamentId, id: { not: id }, name: { equals: name, mode: "insensitive" } },
  });
  if (taken) return NextResponse.json({ error: `Another entry is already called “${name}”` }, { status: 409 });

  await db.participant.update({ where: { id }, data: { name } });
  return NextResponse.json({ ok: true });
}
