import { blankMatch, type EngineMatch } from "./engine";
import { computeStandings } from "./standings";

/** Enough rounds to separate a clear winner: ceil(log2(players)). */
export function swissRoundCount(players: number): number {
  return Math.max(1, Math.ceil(Math.log2(players)));
}

/**
 * Pair one Swiss round. `participantIds` must be in seed order.
 * Round 1: top half plays bottom half by seed. Later rounds: players are ranked by
 * standings and paired top-down, avoiding rematches where possible.
 * With an odd count, the lowest-ranked player who hasn't had a bye gets one (counts as a win).
 */
export function pairSwissRound(participantIds: string[], previous: EngineMatch[], round: number): EngineMatch[] {
  if (participantIds.length < 2) throw new Error("Need at least 2 participants");

  const ranked = round === 1
    ? [...participantIds]
    : computeStandings(participantIds, previous, "SWISS").map((s) => s.participantId);

  const played = new Map<string, Set<string>>(participantIds.map((id) => [id, new Set()]));
  const hadBye = new Set<string>();
  for (const m of previous) {
    if (m.bye && m.winnerId) hadBye.add(m.winnerId);
    if (m.participant1Id && m.participant2Id) {
      played.get(m.participant1Id)?.add(m.participant2Id);
      played.get(m.participant2Id)?.add(m.participant1Id);
    }
  }

  let byePlayer: string | null = null;
  if (ranked.length % 2 === 1) {
    byePlayer = [...ranked].reverse().find((id) => !hadBye.has(id)) ?? ranked[ranked.length - 1];
    ranked.splice(ranked.indexOf(byePlayer), 1);
  }

  let pairs: [string, string][];
  if (round === 1) {
    const half = ranked.length / 2;
    pairs = ranked.slice(0, half).map((id, i) => [id, ranked[half + i]]);
  } else {
    pairs = pairWithoutRematches(ranked, played) ?? adjacentPairs(ranked);
  }

  const matches = pairs.map(([a, b], i) => {
    const m = blankMatch("WINNERS", round, i);
    m.participant1Id = a;
    m.participant2Id = b;
    m.status = "READY";
    return m;
  });

  if (byePlayer) {
    const m = blankMatch("WINNERS", round, matches.length);
    m.participant1Id = byePlayer;
    m.winnerId = byePlayer;
    m.bye = true;
    m.status = "COMPLETED";
    matches.push(m);
  }
  return matches;
}

function adjacentPairs(ids: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < ids.length; i += 2) pairs.push([ids[i], ids[i + 1]]);
  return pairs;
}

/** Backtracking search for a pairing with no rematches. Gives up after a step budget. */
function pairWithoutRematches(ids: string[], played: Map<string, Set<string>>): [string, string][] | null {
  let budget = 20_000;
  const solve = (rest: string[]): [string, string][] | null => {
    if (rest.length === 0) return [];
    if (--budget < 0) return null;
    const [a, ...others] = rest;
    for (let i = 0; i < others.length; i++) {
      if (played.get(a)?.has(others[i])) continue;
      const sub = solve(others.filter((_, j) => j !== i));
      if (sub) return [[a, others[i]], ...sub];
      if (budget < 0) return null;
    }
    return null;
  };
  return solve(ids);
}
