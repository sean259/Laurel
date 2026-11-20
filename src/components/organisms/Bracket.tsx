import type { Match, TournamentFormat } from "@prisma/client";
import { Card } from "../atoms/Card";
import { SectionHeading } from "../molecules/SectionHeading";
import { MatchCard } from "./MatchCard";

type Props = {
  matches: Match[];
  names: Record<string, string>;
  format: TournamentFormat;
  /** Show score entry and correction controls (organizer only). */
  canManage?: boolean;
};

export function Bracket({ matches, names, format, canManage = false }: Props) {
  if (format === "DOUBLE_ELIMINATION") {
    const winners = matches.filter((m) => m.bracket === "WINNERS");
    // Byes inside the losers bracket resolve automatically; hiding them keeps it readable.
    const losers = matches.filter((m) => m.bracket === "LOSERS" && !m.bye);
    const finals = matches.filter((m) => m.bracket === "GRAND_FINAL");
    return (
      <div className="space-y-10">
        <Section title="Winners bracket">
          <Rounds canManage={canManage} matches={winners} names={names} connected label={(i, n) => (i === n ? "Winners final" : `Round ${i}`)} />
        </Section>
        {losers.length > 0 && (
          <Section title="Losers bracket">
            <Rounds canManage={canManage} matches={losers} names={names} label={(i, n) => (i === n ? "Losers final" : `Round ${i}`)} />
          </Section>
        )}
        <Section title="Grand final">
          <Rounds canManage={canManage} matches={finals} names={names} label={(i) => (i === 1 ? "Grand final" : "Bracket reset")} />
        </Section>
      </div>
    );
  }

  if (format === "SINGLE_ELIMINATION") {
    return (
      <Section title="Bracket">
        <Rounds
          canManage={canManage}
          matches={matches}
          names={names}
          connected
          label={(i, n) =>
            i === n ? "Final" : i === n - 1 ? "Semifinals" : i === n - 2 ? "Quarterfinals" : `Round ${i}`
          }
        />
      </Section>
    );
  }

  return (
    <Section title="Matches">
      <Rounds canManage={canManage} matches={matches} names={names} label={(i) => `Round ${i}`} />
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionHeading title={title} />
      {/* Wide brackets scroll sideways; the region is focusable so keyboard users can scroll it too. */}
      <Card padding="none" className="overflow-x-auto p-5 sm:p-6" tabIndex={0} role="region" aria-label={title}>
        {children}
      </Card>
    </section>
  );
}

/**
 * Matches in columns by round. `label(index, total)` uses the 1-based column index.
 * `connected` draws bracket lines; it needs every position present in each round
 * (true for single elimination and the double-elimination winners bracket).
 */
function Rounds({
  matches,
  names,
  label,
  connected = false,
  canManage,
}: {
  matches: Match[];
  names: Record<string, string>;
  label: (index: number, total: number) => string;
  connected?: boolean;
  canManage: boolean;
}) {
  const rounds = new Map<number, Match[]>();
  for (const m of [...matches].sort((a, b) => a.round - b.round || a.position - b.position)) {
    rounds.set(m.round, [...(rounds.get(m.round) ?? []), m]);
  }
  const columns = [...rounds.values()];

  return (
    <div className="bk w-max min-w-full">
      {columns.map((ms, i) => {
        const classes = connected
          ? `${i < columns.length - 1 ? "bk-has-next" : ""} ${i > 0 ? "bk-has-prev" : ""}`
          : "";
        return (
          <div key={ms[0].round} className="flex w-56 shrink-0 flex-col">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-subtle">
              {label(i + 1, columns.length)}
            </h3>
            <div className={`bk-cells ${classes} ${connected ? "" : "justify-start gap-3"}`}>
              {ms.map((m) =>
                connected ? (
                  <div key={m.id} className="bk-cell">
                    <MatchCard match={m} names={names} canManage={canManage} />
                  </div>
                ) : (
                  <MatchCard key={m.id} match={m} names={names} canManage={canManage} />
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
