// Pure bracket generators: no database access, so they are easy to unit test.
import { blankMatch, MatchSet, type EngineMatch } from "./engine";

/** Standard seed order so top seeds meet as late as possible, e.g. 8 → [1,8,4,5,2,7,3,6]. */
export function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const len = order.length * 2;
    order = order.flatMap((s) => [s, len + 1 - s]);
  }
  return order;
}

/** Single elimination. `participantIds` must be sorted by seed (index 0 = seed 1). */
export function generateSingleElimination(participantIds: string[]): EngineMatch[] {
  return buildElimination(participantIds, false);
}

/**
 * Double elimination: winners bracket, losers bracket, grand final.
 * Losing once drops you to the losers bracket; losing twice knocks you out.
 * A bracket-reset match is added at runtime if the losers-bracket player wins the grand final.
 */
export function generateDoubleElimination(participantIds: string[]): EngineMatch[] {
  return buildElimination(participantIds, true);
}

function buildElimination(participantIds: string[], double: boolean): EngineMatch[] {
  if (participantIds.length < 2) throw new Error("Need at least 2 participants");

  const k = Math.ceil(Math.log2(participantIds.length)); // winners-bracket rounds
  const size = 2 ** k;
  const seeds = seedOrder(size).map((s) => participantIds[s - 1] ?? null);

  const setNext = (from: EngineMatch, to: EngineMatch, slot: number) => {
    from.nextMatchId = to.id;
    from.nextMatchSlot = slot;
  };
  const setLoser = (from: EngineMatch, to: EngineMatch, slot: number) => {
    from.loserNextMatchId = to.id;
    from.loserNextMatchSlot = slot;
  };

  // Winners bracket
  const wb: EngineMatch[][] = [];
  for (let r = 1; r <= k; r++) {
    wb.push(Array.from({ length: size / 2 ** r }, (_, i) => blankMatch("WINNERS", r, i)));
  }
  for (let r = 0; r < k - 1; r++) {
    wb[r].forEach((m, i) => setNext(m, wb[r + 1][Math.floor(i / 2)], (i % 2) + 1));
  }
  const all: EngineMatch[] = wb.flat();

  if (double) {
    const gf = blankMatch("GRAND_FINAL", 1, 0);
    setNext(wb[k - 1][0], gf, 1);

    if (k === 1) {
      setLoser(wb[0][0], gf, 2); // 2 players: the loser goes straight to the grand final
    } else {
      // Losers bracket: 2(k-1) rounds. Odd rounds halve the field; even rounds take in
      // players dropping down from the winners bracket.
      const lbRounds = 2 * (k - 1);
      const lb: EngineMatch[][] = [];
      for (let L = 1; L <= lbRounds; L++) {
        const count = size / 2 ** (Math.ceil(L / 2) + 1);
        lb.push(Array.from({ length: count }, (_, i) => blankMatch("LOSERS", L, i)));
      }

      wb[0].forEach((m, i) => setLoser(m, lb[0][Math.floor(i / 2)], (i % 2) + 1));
      for (let r = 2; r <= k; r++) {
        const target = lb[2 * (r - 1) - 1];
        const c = wb[r - 1].length;
        // Reverse order on alternate rounds to avoid immediate rematches.
        wb[r - 1].forEach((m, i) => setLoser(m, target[r % 2 === 0 ? c - 1 - i : i], 2));
      }
      for (let l = 1; l < lbRounds; l++) {
        const evenNext = (l + 1) % 2 === 0;
        lb[l - 1].forEach((m, i) =>
          evenNext ? setNext(m, lb[l][i], 1) : setNext(m, lb[l][Math.floor(i / 2)], (i % 2) + 1),
        );
      }
      setNext(lb[lbRounds - 1][0], gf, 2);
      all.push(...lb.flat());
    }
    all.push(gf);
  }

  // Work out which slots can never be filled (because of byes), so those matches resolve automatically.
  const seeded = new Map(wb[0].map((m, i) => [m.id, [seeds[2 * i], seeds[2 * i + 1]] as const]));
  const feeder = new Map<string, { from: EngineMatch; kind: "W" | "L" }>();
  for (const m of all) {
    if (m.nextMatchId) feeder.set(`${m.nextMatchId}:${m.nextMatchSlot}`, { from: m, kind: "W" });
    if (m.loserNextMatchId) feeder.set(`${m.loserNextMatchId}:${m.loserNextMatchSlot}`, { from: m, kind: "L" });
  }
  const deadMemo = new Map<string, boolean>();
  const slotDead = (m: EngineMatch, slot: 1 | 2): boolean => {
    const key = `${m.id}:${slot}`;
    const cached = deadMemo.get(key);
    if (cached !== undefined) return cached;
    let dead: boolean;
    const seed = seeded.get(m.id);
    if (seed) dead = seed[slot - 1] === null;
    else {
      const f = feeder.get(key);
      dead = !f || (f.kind === "W" ? isVoid(f.from) : isBye(f.from) || isVoid(f.from));
    }
    deadMemo.set(key, dead);
    return dead;
  };
  const isVoid = (m: EngineMatch) => slotDead(m, 1) && slotDead(m, 2);
  const isBye = (m: EngineMatch) => slotDead(m, 1) !== slotDead(m, 2);

  for (const m of all) m.bye = isBye(m);
  const voidIds = new Set(all.filter(isVoid).map((m) => m.id));
  const kept = all.filter((m) => !voidIds.has(m.id));
  for (const m of kept) {
    if (m.nextMatchId && voidIds.has(m.nextMatchId)) [m.nextMatchId, m.nextMatchSlot] = [null, null];
    if (m.loserNextMatchId && voidIds.has(m.loserNextMatchId)) {
      [m.loserNextMatchId, m.loserNextMatchSlot] = [null, null];
    }
  }

  // Seed round 1. Byes complete instantly and their winners move on.
  const set = new MatchSet(kept);
  wb[0].forEach((m) => {
    const [a, b] = seeded.get(m.id)!;
    if (a) set.place(m.id, 1, a);
    if (b) set.place(m.id, 2, b);
  });

  return kept;
}

/** Round robin via the circle method: everyone plays everyone once. */
export function generateRoundRobin(participantIds: string[]): EngineMatch[] {
  if (participantIds.length < 2) throw new Error("Need at least 2 participants");

  const players: (string | null)[] = [...participantIds];
  if (players.length % 2 === 1) players.push(null); // null = sits out that round

  const n = players.length;
  const matches: EngineMatch[] = [];

  for (let r = 0; r < n - 1; r++) {
    let position = 0;
    for (let i = 0; i < n / 2; i++) {
      const a = players[i];
      const b = players[n - 1 - i];
      if (a && b) {
        const m = blankMatch("WINNERS", r + 1, position++);
        m.participant1Id = a;
        m.participant2Id = b;
        m.status = "READY";
        matches.push(m);
      }
    }
    // Rotate everyone except the first player.
    players.splice(1, 0, players.pop()!);
  }

  return matches;
}
