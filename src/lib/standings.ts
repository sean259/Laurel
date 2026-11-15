import type { EngineMatch, Format } from "./engine";

export type Standing = {
  participantId: string;
  seed: number;
  played: number;
  wins: number;
  losses: number;
  scoreFor: number;
  scoreAgainst: number;
  /** Swiss tiebreak: total wins of everyone you played. */
  buchholz: number;
};

type MatchLike = Pick<
  EngineMatch,
  "participant1Id" | "participant2Id" | "score1" | "score2" | "winnerId" | "status" | "bye" | "bracket" | "round" | "nextMatchId"
>;

/**
 * Standings for round robin and Swiss. `participantIds` must be in seed order.
 * Sorted by wins, then Buchholz (Swiss only), score difference, points scored, seed.
 * A bye counts as a win.
 */
export function computeStandings(participantIds: string[], matches: MatchLike[], format: Format): Standing[] {
  const table = new Map<string, Standing>(
    participantIds.map((id, i) => [
      id,
      { participantId: id, seed: i + 1, played: 0, wins: 0, losses: 0, scoreFor: 0, scoreAgainst: 0, buchholz: 0 },
    ]),
  );
  const opponents = new Map<string, string[]>(participantIds.map((id) => [id, []]));

  for (const m of matches) {
    if (m.status !== "COMPLETED" || !m.winnerId) continue;
    if (m.bye) {
      const s = table.get(m.winnerId);
      if (s) {
        s.played++;
        s.wins++;
      }
      continue;
    }
    const p1 = m.participant1Id && table.get(m.participant1Id);
    const p2 = m.participant2Id && table.get(m.participant2Id);
    if (!p1 || !p2) continue;
    for (const [me, them, myScore, theirScore] of [
      [p1, p2, m.score1 ?? 0, m.score2 ?? 0],
      [p2, p1, m.score2 ?? 0, m.score1 ?? 0],
    ] as const) {
      me.played++;
      me.scoreFor += myScore;
      me.scoreAgainst += theirScore;
      if (m.winnerId === me.participantId) me.wins++;
      else me.losses++;
      opponents.get(me.participantId)!.push(them.participantId);
    }
  }

  for (const s of table.values()) {
    s.buchholz = opponents.get(s.participantId)!.reduce((sum, o) => sum + table.get(o)!.wins, 0);
  }

  const swiss = format === "SWISS";
  return [...table.values()].sort(
    (a, b) =>
      b.wins - a.wins ||
      (swiss ? b.buchholz - a.buchholz : 0) ||
      b.scoreFor - b.scoreAgainst - (a.scoreFor - a.scoreAgainst) ||
      b.scoreFor - a.scoreFor ||
      a.seed - b.seed,
  );
}

/** The champion of a completed tournament, or null if it isn't finished. */
export function findChampion(format: Format, participantIds: string[], matches: MatchLike[]): string | null {
  if (matches.length === 0 || matches.some((m) => m.status !== "COMPLETED")) return null;
  switch (format) {
    case "SINGLE_ELIMINATION":
      return matches.find((m) => m.bracket === "WINNERS" && !m.nextMatchId)?.winnerId ?? null;
    case "DOUBLE_ELIMINATION": {
      const finals = matches.filter((m) => m.bracket === "GRAND_FINAL").sort((a, b) => b.round - a.round);
      return finals[0]?.winnerId ?? null;
    }
    default:
      return computeStandings(participantIds, matches, format)[0]?.participantId ?? null;
  }
}
