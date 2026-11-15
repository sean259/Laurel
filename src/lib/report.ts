import { blankMatch, EngineError, MatchSet, type EngineMatch, type Format } from "./engine";
import { generateDoubleElimination, generateRoundRobin, generateSingleElimination } from "./bracket";
import { pairSwissRound, swissRoundCount } from "./swiss";

export type ReportInput = {
  format: Format;
  participantIds: string[]; // seed order
  matches: EngineMatch[];
  matchId: string;
  score1: number;
  score2: number;
};

export type ReportResult = {
  winnerId: string;
  updated: EngineMatch[]; // existing matches that changed
  created: EngineMatch[]; // new matches (Swiss next round, grand-final reset)
  tournamentCompleted: boolean;
};

/** Record a score and work out every consequence. Pure: the input array is not mutated. */
export function reportResult(input: ReportInput): ReportResult {
  const set = new MatchSet(input.matches.map((m) => ({ ...m })));
  const m = set.get(input.matchId);
  if (m.status !== "READY" || !m.participant1Id || !m.participant2Id) {
    throw new EngineError("Match is not ready to be reported");
  }
  if (input.score1 === input.score2) throw new EngineError("Ties are not supported yet");

  const p1Won = input.score1 > input.score2;
  const winnerId = p1Won ? m.participant1Id : m.participant2Id;
  const loserId = p1Won ? m.participant2Id : m.participant1Id;
  m.score1 = input.score1;
  m.score2 = input.score2;
  set.finish(m, winnerId, loserId);

  const created: EngineMatch[] = [];

  // Double elimination: if the losers-bracket player wins the grand final, both have one loss, so play again.
  if (m.bracket === "GRAND_FINAL" && m.round === 1 && winnerId === m.participant2Id) {
    const reset = blankMatch("GRAND_FINAL", 2, 0);
    reset.participant1Id = m.participant1Id;
    reset.participant2Id = m.participant2Id;
    reset.status = "READY";
    created.push(reset);
  }

  // Swiss: when a round is finished, pair the next one.
  if (input.format === "SWISS") {
    const all = set.all();
    const roundDone = all.filter((x) => x.round === m.round).every((x) => x.status === "COMPLETED");
    if (roundDone && m.round < swissRoundCount(input.participantIds.length)) {
      created.push(...pairSwissRound(input.participantIds, all, m.round + 1));
    }
  }

  const tournamentCompleted = [...set.all(), ...created].every((x) => x.status === "COMPLETED");
  return { winnerId, updated: set.changedMatches(), created, tournamentCompleted };
}

/** The matches created when a tournament starts. `participantIds` must be in seed order. */
export function generateInitialMatches(format: Format, participantIds: string[]): EngineMatch[] {
  switch (format) {
    case "SINGLE_ELIMINATION":
      return generateSingleElimination(participantIds);
    case "DOUBLE_ELIMINATION":
      return generateDoubleElimination(participantIds);
    case "ROUND_ROBIN":
      return generateRoundRobin(participantIds);
    case "SWISS":
      return pairSwissRound(participantIds, [], 1);
  }
}
