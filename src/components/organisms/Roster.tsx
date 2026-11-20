import type { Participant, Player } from "@prisma/client";
import { Avatar } from "../atoms/Avatar";

/** Teams as cards: seed, team name and members. */
export function TeamGrid({ teams, showSeeds = true }: { teams: Pick<Participant, "id" | "seed" | "name" | "members">[]; showSeeds?: boolean }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((p) => (
        <li key={p.id} className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-baseline gap-2">
            {showSeeds && (
              <span className="text-xs font-medium tabular-nums text-subtle">
                <span className="sr-only">Seed </span>
                {p.seed}
              </span>
            )}
            <span className="font-semibold text-ink">{p.name}</span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {p.members.map((m, i) => (
              <li key={i}className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-medium text-muted">
                {m}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/** Seeded solo entries in a numbered grid. */
export function SeedList({ entries }: { entries: Pick<Participant, "id" | "seed" | "name">[] }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((p) => (
        <li key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
          <span className="w-6 text-right text-xs font-medium tabular-nums text-subtle">
            <span className="sr-only">Seed </span>
            {p.seed}
          </span>
          <span className="truncate font-medium text-ink">{p.name}</span>
        </li>
      ))}
    </ol>
  );
}

/** Unsorted pool of players waiting to be mixed into teams. */
export function PlayerPool({ players }: { players: Pick<Player, "id" | "name">[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {players.map((p) => (
        <li key={p.id} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm text-ink">
          <Avatar label={p.name} />
          {p.name}
        </li>
      ))}
    </ul>
  );
}
