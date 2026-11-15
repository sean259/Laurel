import type { TournamentStatus } from "@prisma/client";

const styles: Record<TournamentStatus, { label: string; className: string; dot: string }> = {
  DRAFT: { label: "Draft", className: "bg-zinc-100 text-zinc-600", dot: "bg-zinc-400" },
  IN_PROGRESS: { label: "Live", className: "bg-amber-100 text-amber-800", dot: "bg-amber-500 animate-pulse" },
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
};

export function StatusBadge({ status }: { status: TournamentStatus }) {
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
