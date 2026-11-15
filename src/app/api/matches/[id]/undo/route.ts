import { runMatchChange } from "@/lib/persist";
import { undoResult } from "@/lib/report";

// Clear a match result. Refuses if later matches already depend on it.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return runMatchChange(id, (t) =>
    undoResult({
      format: t.format,
      participantIds: t.participants.map((p) => p.id),
      matches: t.matches,
      matchId: id,
    }),
  );
}
