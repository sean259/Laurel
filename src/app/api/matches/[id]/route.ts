import { NextResponse } from "next/server";
import { denyUnlessOwner } from "@/lib/access";
import { runMatchChange } from "@/lib/persist";
import { submitScore } from "@/lib/report";
import { reportScoreSchema } from "@/lib/validation";

// Report a score for a ready match, or correct the score of a finished one.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const denied = await denyUnlessOwner({ matchId: id });
  if (denied) return denied;
  const parsed = reportScoreSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { score1, score2 } = parsed.data;

  return runMatchChange(id, (t) =>
    submitScore({
      format: t.format,
      participantIds: t.participants.map((p) => p.id),
      matches: t.matches,
      matchId: id,
      score1,
      score2,
    }),
  );
}
