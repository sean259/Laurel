/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** How many teams a pool of `players` makes at `teamSize` per team. */
export const teamCount = (players: number, teamSize: number) => Math.floor(players / teamSize);

/**
 * Shuffle players into random teams of `teamSize`. When the numbers don't divide evenly,
 * the leftover players are spread one each over the teams, so no one is left out
 * (e.g. 7 players in teams of 2 → 3 teams: 3, 2, 2).
 */
export function mixTeams<T>(players: readonly T[], teamSize: number, random: () => number = Math.random): T[][] {
  const count = teamCount(players.length, teamSize);
  if (count < 2) throw new Error(`Need at least ${teamSize * 2} players to make 2 teams`);
  const pool = shuffle(players, random);
  const teams: T[][] = Array.from({ length: count }, () => []);
  pool.forEach((p, i) => teams[i % count].push(p));
  return shuffle(teams, random); // so the bigger teams don't always get the top seeds
}

/**
 * Names for `count` freshly mixed teams: keep the previous names in seed order (so names the
 * organizer chose survive a re-mix), and call any extra teams "Team N", skipping names in use.
 */
export function teamNames(previous: readonly string[], count: number): string[] {
  const names = previous.slice(0, count);
  const used = new Set(names.map((n) => n.toLowerCase()));
  let n = names.length;
  while (names.length < count) {
    n++;
    const name = `Team ${n}`;
    if (used.has(name.toLowerCase())) continue;
    used.add(name.toLowerCase());
    names.push(name);
  }
  return names;
}
