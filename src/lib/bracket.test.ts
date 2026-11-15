import { describe, expect, it } from "vitest";
import { seedOrder } from "./bracket";
import type { EngineMatch, Format } from "./engine";
import { applyChanges, generateInitialMatches, reportResult, submitScore, undoResult } from "./report";
import { computeStandings, findChampion } from "./standings";
import { swissRoundCount } from "./swiss";

const players = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);

/** Deterministic pseudo-random numbers so failures are reproducible. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
}

/** Play a whole tournament with random results, applying updates like the API route does. */
function simulate(format: Format, n: number, seed = n) {
  const ids = players(n);
  const rand = rng(seed);
  let matches: EngineMatch[] = generateInitialMatches(format, ids);
  let completed = false;
  let reports = 0;

  while (!completed) {
    const ready = matches.filter((m) => m.status === "READY");
    expect(ready.length, `${format} n=${n}: stuck with no playable match`).toBeGreaterThan(0);
    const m = ready[Math.floor(rand() * ready.length)];
    const p1Wins = rand() < 0.5;
    const res = reportResult({
      format,
      participantIds: ids,
      matches,
      matchId: m.id,
      score1: p1Wins ? 2 : 1,
      score2: p1Wins ? 1 : 2,
    });
    const byId = new Map(matches.map((x) => [x.id, x]));
    for (const u of res.updated) byId.set(u.id, u);
    for (const c of res.created) byId.set(c.id, c);
    matches = [...byId.values()];
    completed = res.tournamentCompleted;
    if (++reports > 10_000) throw new Error("runaway");
  }
  return { ids, matches, champion: findChampion(format, ids, matches) };
}

const sizes = [2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 16, 17, 31, 32, 33, 64];

describe("seedOrder", () => {
  it("keeps top seeds apart", () => {
    expect(seedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });
});

describe("single elimination", () => {
  it.each(sizes)("%i players: finishes with one champion and n-1 losses", (n) => {
    const { matches, champion } = simulate("SINGLE_ELIMINATION", n);
    expect(champion).toBeTruthy();
    const played = matches.filter((m) => !m.bye);
    expect(played.length).toBe(n - 1);
  });

  it("gives byes to the top seeds", () => {
    const ms = generateInitialMatches("SINGLE_ELIMINATION", players(5));
    const byes = ms.filter((m) => m.bye).map((m) => m.winnerId).sort();
    expect(byes).toEqual(["p1", "p2", "p3"]);
  });
});

describe("double elimination", () => {
  it.each(sizes)("%i players: everyone but the champion loses exactly twice", (n) => {
    for (const seed of [1, 2, 3]) {
      const { ids, matches, champion } = simulate("DOUBLE_ELIMINATION", n, n * 10 + seed);
      expect(champion).toBeTruthy();
      const losses = new Map(ids.map((id) => [id, 0]));
      for (const m of matches) {
        if (m.bye || !m.winnerId) continue;
        const loser = m.winnerId === m.participant1Id ? m.participant2Id! : m.participant1Id!;
        losses.set(loser, losses.get(loser)! + 1);
      }
      for (const [id, l] of losses) {
        if (id === champion) expect(l).toBeLessThanOrEqual(1);
        else expect(l, `${id} in ${n}-player bracket`).toBe(2);
      }
    }
  });

  it("adds a bracket reset when the losers-bracket player wins the grand final", () => {
    const ids = players(2);
    let ms = generateInitialMatches("DOUBLE_ELIMINATION", ids);
    const apply = (id: string, s1: number, s2: number) => {
      const r = reportResult({ format: "DOUBLE_ELIMINATION", participantIds: ids, matches: ms, matchId: id, score1: s1, score2: s2 });
      const byId = new Map(ms.map((x) => [x.id, x]));
      for (const u of [...r.updated, ...r.created]) byId.set(u.id, u);
      ms = [...byId.values()];
      return r;
    };
    apply(ms.find((m) => m.bracket === "WINNERS")!.id, 2, 0); // p1 wins winners final
    const gf = ms.find((m) => m.bracket === "GRAND_FINAL")!;
    const r = apply(gf.id, 0, 2); // p2 (from losers bracket) wins
    expect(r.created).toHaveLength(1);
    expect(r.tournamentCompleted).toBe(false);
    apply(r.created[0].id, 0, 2);
    expect(findChampion("DOUBLE_ELIMINATION", ids, ms)).toBe("p2");
  });
});

describe("round robin", () => {
  it.each([2, 3, 4, 5, 8, 9])("%i players: everyone plays everyone once", (n) => {
    const { matches, champion } = simulate("ROUND_ROBIN", n);
    expect(matches).toHaveLength((n * (n - 1)) / 2);
    expect(champion).toBeTruthy();
  });
});

describe("swiss", () => {
  it.each(sizes)("%i players: plays the right number of rounds", (n) => {
    const { ids, matches, champion } = simulate("SWISS", n);
    const rounds = swissRoundCount(n);
    expect(Math.max(...matches.map((m) => m.round))).toBe(rounds);
    expect(champion).toBe(computeStandings(ids, matches, "SWISS")[0].participantId);
    for (const id of ids) {
      expect(matches.filter((m) => m.participant1Id === id || m.participant2Id === id)).toHaveLength(rounds);
    }
  });

  it("avoids rematches", () => {
    const { matches } = simulate("SWISS", 16);
    const seen = new Set<string>();
    for (const m of matches.filter((x) => !x.bye)) {
      const key = [m.participant1Id, m.participant2Id].sort().join("-");
      expect(seen.has(key), `rematch ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it("never gives anyone two byes", () => {
    const { matches } = simulate("SWISS", 7);
    const byes = matches.filter((m) => m.bye).map((m) => m.winnerId);
    expect(new Set(byes).size).toBe(byes.length);
  });
});

// ---------- Undo and corrections ----------

/** Comparable view of a bracket, independent of generated ids. */
function snapshot(ms: EngineMatch[]) {
  return ms
    .map((m) => ({
      key: `${m.bracket}:${m.round}:${m.position}`,
      p1: m.participant1Id,
      p2: m.participant2Id,
      s: [m.score1, m.score2],
      w: m.winnerId,
      st: m.status,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

describe("undo", () => {
  const formats: Format[] = ["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "ROUND_ROBIN", "SWISS"];
  it.each(formats.flatMap((f) => [3, 5, 8, 13].map((n) => [f, n] as const)))(
    "%s %i players: undoing every result in reverse restores each earlier state",
    (format, n) => {
      const ids = players(n);
      const rand = rng(n * 7);
      let ms = generateInitialMatches(format, ids);
      const history: { before: ReturnType<typeof snapshot>; key: string }[] = [];

      for (;;) {
        const ready = ms.filter((m) => m.status === "READY");
        if (!ready.length) break;
        const m = ready[Math.floor(rand() * ready.length)];
        history.push({ before: snapshot(ms), key: `${m.bracket}:${m.round}:${m.position}` });
        const p1 = rand() < 0.5;
        ms = applyChanges(ms, submitScore({ format, participantIds: ids, matches: ms, matchId: m.id, score1: p1 ? 2 : 0, score2: p1 ? 0 : 2 }));
      }
      expect(findChampion(format, ids, ms)).toBeTruthy();

      for (const step of history.reverse()) {
        const m = ms.find((x) => `${x.bracket}:${x.round}:${x.position}` === step.key)!;
        ms = applyChanges(ms, undoResult({ format, participantIds: ids, matches: ms, matchId: m.id }));
        expect(snapshot(ms)).toEqual(step.before);
      }
    },
  );

  it("refuses when a later match depends on the result", () => {
    const ids = players(4);
    let ms = generateInitialMatches("SINGLE_ELIMINATION", ids);
    const [a, b] = ms.filter((m) => m.round === 1);
    for (const m of [a, b]) {
      ms = applyChanges(ms, submitScore({ format: "SINGLE_ELIMINATION", participantIds: ids, matches: ms, matchId: m.id, score1: 1, score2: 0 }));
    }
    const final = ms.find((m) => m.round === 2)!;
    ms = applyChanges(ms, submitScore({ format: "SINGLE_ELIMINATION", participantIds: ids, matches: ms, matchId: final.id, score1: 1, score2: 0 }));
    expect(() => undoResult({ format: "SINGLE_ELIMINATION", participantIds: ids, matches: ms, matchId: a.id })).toThrow(/later match/);
  });
});

describe("score corrections", () => {
  const ids = players(4);
  const start = () => generateInitialMatches("SINGLE_ELIMINATION", ids);
  const score = (ms: EngineMatch[], id: string, s1: number, s2: number) =>
    applyChanges(ms, submitScore({ format: "SINGLE_ELIMINATION", participantIds: ids, matches: ms, matchId: id, score1: s1, score2: s2 }));

  it("same winner: only the score changes", () => {
    let ms = start();
    const m = ms.find((x) => x.round === 1)!;
    ms = score(ms, m.id, 2, 1);
    ms = score(ms, m.id, 5, 0);
    const after = ms.find((x) => x.id === m.id)!;
    expect([after.score1, after.score2, after.winnerId]).toEqual([5, 0, m.participant1Id]);
  });

  it("new winner: the right player moves on instead", () => {
    let ms = start();
    const m = ms.find((x) => x.round === 1)!;
    ms = score(ms, m.id, 2, 1);
    ms = score(ms, m.id, 0, 3);
    const final = ms.find((x) => x.round === 2)!;
    expect([final.participant1Id, final.participant2Id]).toContain(m.participant2Id);
    expect([final.participant1Id, final.participant2Id]).not.toContain(m.participant1Id);
  });
});
