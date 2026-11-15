import type { Match, TournamentFormat } from "@prisma/client";
import { MatchCard } from "./MatchCard";

type Props = {
  matches: Match[];
  names: Record<string, string>;
  format: TournamentFormat;
};

export function Bracket({ matches, names, format }: Props) {
  if (format === "DOUBLE_ELIMINATION") {
    const winners = matches.filter((m) => m.bracket === "WINNERS");
    // Byes inside the losers bracket resolve automatically; hiding them keeps it readable.
    const losers = matches.filter((m) => m.bracket === "LOSERS" && !m.bye);
    const finals = matches.filter((m) => m.bracket === "GRAND_FINAL");
    return (
      <div className="space-y-10">
        <Section title="Winners bracket">
          <Rounds matches={winners} names={names} aligned label={(i, n) => (i === n ? "Winners final" : `Round ${i}`)} />
        </Section>
        {losers.length > 0 && (
          <Section title="Losers bracket">
            <Rounds matches={losers} names={names} aligned label={(i, n) => (i === n ? "Losers final" : `Round ${i}`)} />
          </Section>
        )}
        <Section title="Grand final">
          <Rounds matches={finals} names={names} label={(i) => (i === 1 ? "Grand final" : "Bracket reset")} />
        </Section>
      </div>
    );
  }

  if (format === "SINGLE_ELIMINATION") {
    return (
      <Rounds
        matches={matches}
        names={names}
        aligned
        label={(i, n) =>
          i === n ? "Final" : i === n - 1 ? "Semifinals" : i === n - 2 ? "Quarterfinals" : `Round ${i}`
        }
      />
    );
  }

  return <Rounds matches={matches} names={names} label={(i) => `Round ${i}`} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** Matches laid out in columns by round. `label(index, total)` uses 1-based column index. */
function Rounds({
  matches,
  names,
  label,
  aligned = false,
}: {
  matches: Match[];
  names: Record<string, string>;
  label: (index: number, total: number) => string;
  aligned?: boolean;
}) {
  const rounds = new Map<number, Match[]>();
  for (const m of [...matches].sort((a, b) => a.round - b.round || a.position - b.position)) {
    rounds.set(m.round, [...(rounds.get(m.round) ?? []), m]);
  }
  const columns = [...rounds.values()];

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((ms, i) => (
        <div key={ms[0].round} className="flex min-w-56 flex-col">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {label(i + 1, columns.length)}
          </h3>
          {/* justify-around lines later rounds up between the matches that feed them */}
          <div className={`flex flex-1 flex-col gap-4 ${aligned ? "justify-around" : ""}`}>
            {ms.map((m) => (
              <MatchCard key={m.id} match={m} names={names} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
