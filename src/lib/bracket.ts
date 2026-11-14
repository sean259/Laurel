// Pure bracket-generation logic: no database access, so it is easy to unit test.
const randomUUID = () => crypto.randomUUID(); // Web Crypto: works in Node and Workers

export type PlannedMatch = {
  id: string;
  round: number;
  position: number;
  participant1Id: string | null;
  participant2Id: string | null;
  winnerId: string | null;
  status: "PENDING" | "READY" | "COMPLETED";
  nextMatchId: string | null;
  nextMatchSlot: 1 | 2 | null;
};

/** Standard seed order so top seeds meet as late as possible, e.g. 8 → [1,8,4,5,2,7,3,6]. */
export function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const len = order.length * 2;
    order = order.flatMap((s) => [s, len + 1 - s]);
  }
  return order;
}

/**
 * Single elimination. `participantIds` must be sorted by seed (index 0 = seed 1).
 * Pads to the next power of two; top seeds get byes and advance automatically.
 */
export function generateSingleElimination(participantIds: string[]): PlannedMatch[] {
  if (participantIds.length < 2) throw new Error("Need at least 2 participants");

  const rounds = Math.ceil(Math.log2(participantIds.length));
  const size = 2 ** rounds;
  const slots = seedOrder(size).map((seed) => participantIds[seed - 1] ?? null);

  const byRound: PlannedMatch[][] = [];
  for (let r = 1; r <= rounds; r++) {
    byRound.push(
      Array.from({ length: size / 2 ** r }, (_, i) => ({
        id: randomUUID(),
        round: r,
        position: i,
        participant1Id: null,
        participant2Id: null,
        winnerId: null,
        status: "PENDING" as const,
        nextMatchId: null,
        nextMatchSlot: null,
      })),
    );
  }

  // Link each match to the one its winner feeds into.
  for (let r = 0; r < rounds - 1; r++) {
    byRound[r].forEach((m, i) => {
      m.nextMatchId = byRound[r + 1][Math.floor(i / 2)].id;
      m.nextMatchSlot = i % 2 === 0 ? 1 : 2;
    });
  }

  // Fill round 1 and resolve byes.
  byRound[0].forEach((m, i) => {
    m.participant1Id = slots[i * 2];
    m.participant2Id = slots[i * 2 + 1];
    const solo = m.participant1Id && !m.participant2Id ? m.participant1Id
      : !m.participant1Id && m.participant2Id ? m.participant2Id
      : null;
    if (solo) {
      m.winnerId = solo;
      m.status = "COMPLETED";
      const next = byRound[1]?.[Math.floor(i / 2)];
      if (next) {
        if (m.nextMatchSlot === 1) next.participant1Id = solo;
        else next.participant2Id = solo;
      }
    } else {
      m.status = "READY";
    }
  });

  // Round 2 matches whose both feeders were byes are already playable.
  byRound[1]?.forEach((m) => {
    if (m.participant1Id && m.participant2Id) m.status = "READY";
  });

  return byRound.flat();
}

/** Round robin via the circle method: everyone plays everyone once. */
export function generateRoundRobin(participantIds: string[]): PlannedMatch[] {
  if (participantIds.length < 2) throw new Error("Need at least 2 participants");

  const players: (string | null)[] = [...participantIds];
  if (players.length % 2 === 1) players.push(null); // null = sits out that round

  const n = players.length;
  const matches: PlannedMatch[] = [];

  for (let r = 0; r < n - 1; r++) {
    let position = 0;
    for (let i = 0; i < n / 2; i++) {
      const a = players[i];
      const b = players[n - 1 - i];
      if (a && b) {
        matches.push({
          id: randomUUID(),
          round: r + 1,
          position: position++,
          participant1Id: a,
          participant2Id: b,
          winnerId: null,
          status: "READY",
          nextMatchId: null,
          nextMatchSlot: null,
        });
      }
    }
    // Rotate everyone except the first player.
    players.splice(1, 0, players.pop()!);
  }

  return matches;
}
