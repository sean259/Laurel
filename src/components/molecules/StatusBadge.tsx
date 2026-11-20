import type { TournamentStatus } from "@prisma/client";
import { Badge, type BadgeTone } from "../atoms/Badge";

const styles: Record<TournamentStatus, { label: string; tone: BadgeTone; dot: string }> = {
  DRAFT: { label: "Draft", tone: "neutral", dot: "bg-zinc-500" },
  IN_PROGRESS: { label: "Live", tone: "accent", dot: "bg-amber-600 motion-safe:animate-pulse" },
  COMPLETED: { label: "Completed", tone: "success", dot: "bg-emerald-600" },
};

export function StatusBadge({ status }: { status: TournamentStatus }) {
  const s = styles[status];
  return (
    <Badge tone={s.tone}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </Badge>
  );
}
