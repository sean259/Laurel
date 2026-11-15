import { denyUnlessOwner } from "@/lib/access";
import { runMatchChange } from "@/lib/persist";
import { undoResult } from "@/lib/report";

// Clear a match result. Refuses if later matches already depend on it.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const denied = await denyUnlessOwner({ matchId: id });
  if (denied) return denied;
  return runMatchChange(id, (t) =>
    undoResult({
      format: t.format,
      participantIds: t.participants.map((p) => p.id),
      matches: t.matches,
      matchId: id,
    }),
  );
}
