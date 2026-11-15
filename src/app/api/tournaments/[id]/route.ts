import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateTournamentSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

// Edit name/game any time; format and the player list only while in DRAFT.
// Once started, `participants` may still be sent to rename players (same count, seed order).
export async function PATCH(req: Request, { params }: Ctx) {
  const db = getDb();
  const { id } = await params;
  const parsed = updateTournamentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, game, format, participants } = parsed.data;

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: { participants: { orderBy: { seed: "asc" } } },
  });
  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const draft = tournament.status === "DRAFT";
  if (format && format !== tournament.format && !draft) {
    return NextResponse.json({ error: "Reset the tournament to draft to change the format" }, { status: 409 });
  }
  if (participants && !draft && participants.length !== tournament.participants.length) {
    return NextResponse.json(
      { error: "Players can only be added or removed while the tournament is a draft" },
      { status: 409 },
    );
  }

  await db.$transaction(async (tx) => {
    await tx.tournament.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(game !== undefined && { game: game || null }),
        ...(format && draft && { format }),
      },
    });

    if (!participants) return;
    if (draft) {
      // No matches yet, so the list can simply be replaced.
      await tx.participant.deleteMany({ where: { tournamentId: id } });
      await tx.participant.createMany({
        data: participants.map((p, i) => ({ name: p, seed: i + 1, tournamentId: id })),
      });
    } else {
      // Started: rename in place so match references stay valid.
      for (const [i, p] of tournament.participants.entries()) {
        if (p.name !== participants[i]) {
          await tx.participant.update({ where: { id: p.id }, data: { name: participants[i] } });
        }
      }
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const db = getDb();
  const { id } = await params;
  // Participants and matches are removed by the cascade in the schema.
  const { count } = await db.tournament.deleteMany({ where: { id } });
  if (count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
