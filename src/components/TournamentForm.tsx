"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Format } from "@/lib/engine";
import { FORMATS } from "@/lib/formats";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 disabled:bg-zinc-50 disabled:text-zinc-500";

const parse = (text: string) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

type Existing = {
  id: string;
  name: string;
  game: string | null;
  format: Format;
  started: boolean;
  participants: string[]; // seed order
};

/** Create a tournament, or edit an existing one (`tournament` given). */
export function TournamentForm({ tournament }: { tournament?: Existing }) {
  const router = useRouter();
  const editing = !!tournament;
  const locked = tournament?.started ?? false; // started: format and player count are fixed

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [players, setPlayers] = useState(tournament?.participants.join("\n") ?? "");
  const [renames, setRenames] = useState(tournament?.participants ?? []);
  const count = locked ? renames.length : parse(players).length;
  const renamesValid = renames.every((r) => r.trim().length > 0);

  function shuffle() {
    const list = parse(players);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setPlayers(list.join("\n"));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      game: editing ? String(form.get("game") ?? "") : form.get("game") || undefined,
      ...(!locked && { format: form.get("format") }),
      participants: locked ? renames.map((r) => r.trim()) : parse(players),
    };

    const res = await fetch(editing ? `/api/tournaments/${tournament.id}` : "/api/tournaments", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    const id = editing ? tournament.id : (await res.json()).id;
    router.push(`/tournaments/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            required
            maxLength={100}
            defaultValue={tournament?.name}
            className={inputClass}
            placeholder="Friday Night Smash"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">
            Game or sport <span className="font-normal text-zinc-400">(optional)</span>
          </span>
          <input
            name="game"
            maxLength={100}
            defaultValue={tournament?.game ?? ""}
            className={inputClass}
            placeholder="Chess, FIFA, Valorant…"
          />
        </label>
      </div>

      <fieldset disabled={locked}>
        <legend className="text-sm font-medium">Format</legend>
        {locked && (
          <p className="mt-1 text-xs text-zinc-500">Reset the tournament to draft to change the format.</p>
        )}
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {FORMATS.map((f) => (
            <label
              key={f.value}
              className="relative cursor-pointer rounded-2xl border border-zinc-200 p-4 transition hover:border-zinc-400 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 has-[:checked]:ring-4 has-[:checked]:ring-amber-500/10 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-amber-500/30"
            >
              <input
                type="radio"
                name="format"
                value={f.value}
                defaultChecked={(tournament?.format ?? "SINGLE_ELIMINATION") === f.value}
                className="peer sr-only"
              />
              <span className="absolute right-4 top-4 h-4 w-4 rounded-full border border-zinc-300 peer-checked:border-[5px] peer-checked:border-amber-500" />
              <span className="block pr-6 text-sm font-semibold">{f.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-zinc-500">{f.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {locked ? (
        <div>
          <p className="text-sm font-medium">Players</p>
          <p className="mt-1 text-xs text-zinc-500">
            Fix spelling here. To add, remove or reorder players, reset the tournament to draft.
          </p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {renames.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-6 text-right text-xs tabular-nums text-zinc-400">{i + 1}</span>
                <input
                  value={r}
                  maxLength={60}
                  aria-label={`Player ${i + 1}`}
                  onChange={(e) => setRenames(renames.map((x, j) => (j === i ? e.target.value : x)))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15"
                />
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div>
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="participants" className="text-sm font-medium">
              Players <span className="font-normal text-zinc-400">(one per line, best seed first)</span>
            </label>
            <button
              type="button"
              onClick={shuffle}
              disabled={count < 2}
              className="shrink-0 whitespace-nowrap text-xs font-medium text-amber-700 hover:text-amber-900 disabled:text-zinc-300"
            >
              Shuffle seeds
            </button>
          </div>
          <textarea
            id="participants"
            value={players}
            onChange={(e) => setPlayers(e.target.value)}
            required
            rows={8}
            className={`${inputClass} font-mono text-sm`}
            placeholder={"Aurora\nEmber\nNimbus\nVortex"}
          />
          <p className={`mt-1.5 text-xs ${count > 256 ? "text-red-600" : "text-zinc-500"}`}>
            {count} {count === 1 ? "player" : "players"}
            {count > 256 ? " (maximum is 256)" : count === 1 ? " (need at least 2)" : ""}
          </p>
        </div>
      )}

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {editing && (
          <button
            type="button"
            onClick={() => router.push(`/tournaments/${tournament.id}`)}
            className="rounded-full border border-zinc-300 px-6 py-3 font-medium hover:bg-zinc-50 sm:w-40"
          >
            Cancel
          </button>
        )}
        <button
          disabled={submitting || count < 2 || count > 256 || (locked && !renamesValid)}
          className="flex-1 rounded-full bg-zinc-900 py-3 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Saving…" : editing ? "Save changes" : "Create tournament"}
        </button>
      </div>
    </form>
  );
}
