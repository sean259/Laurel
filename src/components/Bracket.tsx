import type { Match, TournamentFormat } from "@prisma/client";
import { MatchCard } from "./MatchCard";

type Props = {
  matches: Match[];
  names: Record<string, string>;
  format: TournamentFormat;
};

export function Bracket({ matches, names, format }: Props) {
  const rounds = new Map<number, Match[]>();
  for (const m of matches) rounds.set(m.round, [...(rounds.get(m.round) ?? []), m]);
  const totalRounds = rounds.size;

  const roundLabel = (r: number) => {
    if (format === "ROUND_ROBIN") return `Round ${r}`;
    if (r === totalRounds) return "Final";
    if (r === totalRounds - 1) return "Semifinals";
    if (r === totalRounds - 2) return "Quarterfinals";
    return `Round ${r}`;
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {[...rounds.entries()].map(([round, ms]) => (
        <div key={round} className="flex min-w-56 flex-col">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{roundLabel(round)}</h3>
          {/* justify-around spaces later rounds so they line up between their feeder matches */}
          <div className={`flex flex-1 flex-col gap-4 ${format === "SINGLE_ELIMINATION" ? "justify-around" : ""}`}>
            {ms.map((m) => <MatchCard key={m.id} match={m} names={names} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
