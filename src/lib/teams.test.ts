import { describe, expect, it } from "vitest";
import { mixTeams, teamCount, teamNames } from "./teams";

const names = (n: number) => Array.from({ length: n }, (_, i) => `P${i + 1}`);

describe("mixTeams", () => {
  it("makes full teams when numbers divide evenly", () => {
    const teams = mixTeams(names(10), 5);
    expect(teams).toHaveLength(2);
    expect(teams.every((t) => t.length === 5)).toBe(true);
  });

  it("uses every player exactly once", () => {
    const teams = mixTeams(names(9), 2);
    expect(teams.flat().sort()).toEqual(names(9).sort());
  });

  it("spreads leftovers so team sizes differ by at most one", () => {
    const teams = mixTeams(names(7), 2);
    expect(teams).toHaveLength(3);
    expect(teams.map((t) => t.length).sort()).toEqual([2, 2, 3]);
  });

  it("needs enough players for two teams", () => {
    expect(() => mixTeams(names(3), 2)).toThrow(/at least 4/);
    expect(teamCount(3, 2)).toBe(1);
  });

  it("is random", () => {
    const seen = new Set(Array.from({ length: 20 }, () => JSON.stringify(mixTeams(names(8), 2))));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("teamNames", () => {
  it("names a first mix Team 1…N", () => {
    expect(teamNames([], 3)).toEqual(["Team 1", "Team 2", "Team 3"]);
  });
  it("keeps chosen names on a re-mix, in seed order", () => {
    expect(teamNames(["Red", "Blue", "Team 3"], 3)).toEqual(["Red", "Blue", "Team 3"]);
  });
  it("drops names when there are fewer teams, and adds Team N when there are more", () => {
    expect(teamNames(["Red", "Blue", "Green"], 2)).toEqual(["Red", "Blue"]);
    expect(teamNames(["Red", "Blue"], 4)).toEqual(["Red", "Blue", "Team 3", "Team 4"]);
  });
  it("never repeats a name already in use", () => {
    expect(teamNames(["Team 3", "Blue"], 3)).toEqual(["Team 3", "Blue", "Team 4"]);
  });
});
