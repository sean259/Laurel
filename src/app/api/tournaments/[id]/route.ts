import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { updateTournamentSchema } from "@/lib/validation";
import { denyUnlessOwner } from "@/lib/access";

type Ctx = { params: Promise<{ id: string }> };

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

// Edit name/game/registration any time; format, team size and the player list only while in DRAFT.
// Once started, `participants` may still be sent to rename entries (same count, seed order).
export async function PATCH(req: Request, { params }: Ctx) {
  const db = getDb();
  const { id } = await params;
  const denied = await denyUnlessOwner({ tournamentId: id });
  if (denied) return denied;
  const parsed = updateTournamentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name, game, format, teamSize, registrationOpen, participants } = parsed.data;

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      participants: { orderBy: { seed: "asc" } },
      players: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const draft = tournament.status === "DRAFT";
  if (format && format !== tournament.format && !draft) {
    return NextResponse.json({ error: "Reset the tournament to draft to change the format" }, { status: 409 });
  }
  if (teamSize && teamSize !== tournament.teamSize && !draft) {
    return NextResponse.json({ error: "Reset the tournament to draft to change the team size" }, { status: 409 });
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
        ...(registrationOpen !== undefined && { registrationOpen }),
        ...(draft && format && { format }),
        ...(draft && teamSize && { teamSize }),
      },
    });

    if (draft) {
      // The "player list" is the bracket entries for solo, or the pool to mix for teams.
      const wasTeams = tournament.teamSize > 1;
      const nowTeams = (teamSize ?? tournament.teamSize) > 1;
      const current = (wasTeams ? tournament.players : tournament.participants).map((p) => p.name);
      const list = participants ?? current;
      const sizeUnchanged = teamSize === undefined || teamSize === tournament.teamSize;
      if (sizeUnchanged && sameList(list, current)) return; // keep any mixed teams

      // No matches yet, so everything can simply be replaced. Any mixed teams are now stale.
      await tx.participant.deleteMany({ where: { tournamentId: id } });
      await tx.player.deleteMany({ where: { tournamentId: id } });
      if (nowTeams) {
        await tx.player.createMany({ data: list.map((p) => ({ name: p, tournamentId: id })) });
      } else {
        await tx.participant.createMany({
          data: list.map((p, i) => ({ name: p, seed: i + 1, tournamentId: id })),
        });
      }
    } else if (participants) {
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
  const denied = await denyUnlessOwner({ tournamentId: id });
  if (denied) return denied;
  // Participants, players and matches are removed by the cascade in the schema.
  const { count } = await db.tournament.deleteMany({ where: { id } });
  if (count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
