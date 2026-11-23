import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { joinSchema, MAX_ENTRIES } from "@/lib/validation";

// Public: anyone with the registration link can add themselves while sign-ups are open.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const parsed = joinSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { name } = parsed.data;

  const t = await db.tournament.findUnique({
    where: { id },
    select: { status: true, registrationOpen: true, teamSize: true, visibility: true },
  });
  // Private tournaments look the same as missing ones to everyone else.
  if (!t || t.visibility === "PRIVATE") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (t.status !== "DRAFT" || !t.registrationOpen) {
    return NextResponse.json({ error: "Sign-ups for this tournament are closed" }, { status: 409 });
  }
  const teams = t.teamSize > 1;
  const where = { tournamentId: id, name: { equals: name, mode: "insensitive" as const } };
  const [taken, count] = teams
    ? await Promise.all([db.player.count({ where }), db.player.count({ where: { tournamentId: id } })])
    : await Promise.all([db.participant.count({ where }), db.participant.count({ where: { tournamentId: id } })]);
  if (taken) return NextResponse.json({ error: `“${name}” has already signed up. Try adding a last initial.` }, { status: 409 });
  if (count >= MAX_ENTRIES) return NextResponse.json({ error: "This tournament is full" }, { status: 409 });

  if (teams) {
    // New player: any teams already mixed no longer include everyone, so they're cleared to re-mix.
    await db.$transaction([
      db.player.create({ data: { name, tournamentId: id } }),
      db.participant.deleteMany({ where: { tournamentId: id } }),
    ]);
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Solo: join the bottom of the seed list. Retry if two people grab the same seed at once.
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await db.participant.aggregate({ where: { tournamentId: id }, _max: { seed: true } });
    try {
      await db.participant.create({ data: { name, seed: (last._max.seed ?? 0) + 1, tournamentId: id } });
      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  return NextResponse.json({ error: "Lots of people are signing up right now. Try again." }, { status: 503 });
}
