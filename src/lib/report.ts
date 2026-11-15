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

export type UndoInput = Omit<ReportInput, "score1" | "score2">;

export type ChangeSet = {
  updated: EngineMatch[];
  created: EngineMatch[];
  deletedIds: string[];
  tournamentCompleted: boolean;
};

/**
 * Clear a match result, pulling the winner (and loser) back out of the matches they moved into.
 * Refuses if any of those later matches were already played. Swiss: also removes later,
 * unplayed rounds. Double elimination: also removes an unplayed bracket reset.
 */
export function undoResult(input: UndoInput): ChangeSet {
  const set = new MatchSet(input.matches.map((m) => ({ ...m })));
  const m = set.get(input.matchId);
  if (m.status !== "COMPLETED" || m.bye || !m.winnerId) {
    throw new EngineError("This match has no result to undo");
  }

  const deleted = new Set<string>();
  if (input.format === "SWISS") {
    const later = set.all().filter((x) => x.round > m.round);
    if (later.some((x) => x.status === "COMPLETED" && !x.bye)) {
      throw new EngineError("A later round has already started. Undo those results first.");
    }
    later.forEach((x) => deleted.add(x.id));
  }
  if (m.bracket === "GRAND_FINAL" && m.round === 1) {
    const reset = set.all().find((x) => x.bracket === "GRAND_FINAL" && x.round === 2);
    if (reset) {
      if (reset.status === "COMPLETED") throw new EngineError("Undo the bracket reset first.");
      deleted.add(reset.id);
    }
  }

  if (m.nextMatchId && m.nextMatchSlot) set.unplace(m.nextMatchId, m.nextMatchSlot);
  if (m.loserNextMatchId && m.loserNextMatchSlot) set.unplace(m.loserNextMatchId, m.loserNextMatchSlot);

  m.score1 = null;
  m.score2 = null;
  m.winnerId = null;
  m.status = "READY";
  set.changed.add(m.id);

  return {
    updated: set.changedMatches().filter((x) => !deleted.has(x.id)),
    created: [],
    deletedIds: [...deleted],
    tournamentCompleted: false,
  };
}

/**
 * Report a score for a ready match, or correct the score of a finished one.
 * Same winner: only the score changes. New winner: the old result is undone first
 * (so it fails if later matches already depend on it), then the new one is reported.
 */
export function submitScore(input: ReportInput): ChangeSet & { winnerId: string } {
  const m = input.matches.find((x) => x.id === input.matchId);
  if (!m) throw new EngineError("Not found");
  if (input.score1 === input.score2) throw new EngineError("Ties are not supported yet");

  if (m.status === "READY") return { ...reportResult(input), deletedIds: [] };
  if (m.status !== "COMPLETED" || m.bye || !m.participant1Id || !m.participant2Id) {
    throw new EngineError("This match can't be scored yet");
  }

  const winnerId = input.score1 > input.score2 ? m.participant1Id : m.participant2Id;
  if (winnerId === m.winnerId) {
    return {
      winnerId,
      updated: [{ ...m, score1: input.score1, score2: input.score2 }],
      created: [],
      deletedIds: [],
      tournamentCompleted: input.matches.every((x) => x.status === "COMPLETED"),
    };
  }

  const undo = undoResult(input);
  const state = new Map(input.matches.map((x) => [x.id, x]));
  for (const u of undo.updated) state.set(u.id, u);
  for (const id of undo.deletedIds) state.delete(id);

  const report = reportResult({ ...input, matches: [...state.values()] });
  const updated = new Map(undo.updated.map((x) => [x.id, x]));
  for (const u of report.updated) updated.set(u.id, u);
  return {
    winnerId: report.winnerId,
    updated: [...updated.values()],
    created: report.created,
    deletedIds: undo.deletedIds,
    tournamentCompleted: report.tournamentCompleted,
  };
}

/** Apply a change set to an in-memory list of matches (used by tests and previews). */
export function applyChanges(matches: EngineMatch[], changes: Omit<ChangeSet, "tournamentCompleted">): EngineMatch[] {
  const byId = new Map(matches.map((x) => [x.id, x]));
  for (const id of changes.deletedIds) byId.delete(id);
  for (const u of changes.updated) byId.set(u.id, u);
  for (const c of changes.created) byId.set(c.id, c);
  return [...byId.values()];
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
