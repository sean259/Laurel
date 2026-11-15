// Match engine: pure functions that move players through a bracket.
// No database access. API routes load matches, call these, then save what changed.

export type MatchBracket = "WINNERS" | "LOSERS" | "GRAND_FINAL";
export type MatchStatus = "PENDING" | "READY" | "COMPLETED";
export type Slot = 1 | 2;
export type Format = "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "ROUND_ROBIN" | "SWISS";

export type EngineMatch = {
  id: string;
  bracket: MatchBracket;
  round: number;
  position: number;
  participant1Id: string | null;
  participant2Id: string | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  status: MatchStatus;
  bye: boolean;
  nextMatchId: string | null;
  nextMatchSlot: number | null;
  loserNextMatchId: string | null;
  loserNextMatchSlot: number | null;
};

export class EngineError extends Error {}

export const newId = () => crypto.randomUUID(); // Web Crypto: works in Node and Workers

export function blankMatch(bracket: MatchBracket, round: number, position: number): EngineMatch {
  return {
    id: newId(),
    bracket,
    round,
    position,
    participant1Id: null,
    participant2Id: null,
    score1: null,
    score2: null,
    winnerId: null,
    status: "PENDING",
    bye: false,
    nextMatchId: null,
    nextMatchSlot: null,
    loserNextMatchId: null,
    loserNextMatchSlot: null,
  };
}

/** Tracks matches by id and which ones were modified. */
export class MatchSet {
  readonly byId = new Map<string, EngineMatch>();
  readonly changed = new Set<string>();

  constructor(matches: EngineMatch[]) {
    for (const m of matches) this.byId.set(m.id, m);
  }

  get(id: string): EngineMatch {
    const m = this.byId.get(id);
    if (!m) throw new EngineError(`Match ${id} not found`);
    return m;
  }

  /** Put a participant into a match slot. Byes resolve immediately and keep advancing. */
  place(matchId: string, slot: number, participantId: string) {
    const m = this.get(matchId);
    if (slot === 1) m.participant1Id = participantId;
    else m.participant2Id = participantId;
    this.changed.add(m.id);

    if (m.bye) this.finish(m, participantId, null);
    else if (m.participant1Id && m.participant2Id) m.status = "READY";
  }

  /** Complete a match and send the winner (and loser, if routed) onward. */
  finish(m: EngineMatch, winnerId: string, loserId: string | null) {
    m.winnerId = winnerId;
    m.status = "COMPLETED";
    this.changed.add(m.id);
    if (m.nextMatchId && m.nextMatchSlot) this.place(m.nextMatchId, m.nextMatchSlot, winnerId);
    if (loserId && m.loserNextMatchId && m.loserNextMatchSlot) {
      this.place(m.loserNextMatchId, m.loserNextMatchSlot, loserId);
    }
  }

  all(): EngineMatch[] {
    return [...this.byId.values()];
  }

  changedMatches(): EngineMatch[] {
    return [...this.changed].map((id) => this.get(id));
  }
}
