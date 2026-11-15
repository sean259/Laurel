"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FORMATS } from "@/lib/formats";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15";

const parse = (text: string) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export default function NewTournamentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [players, setPlayers] = useState("");
  const count = parse(players).length;

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
    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        game: form.get("game") || undefined,
        format: form.get("format"),
        participants: parse(players),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/tournaments/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl font-semibold">New tournament</h1>
      <p className="mt-2 text-zinc-600">Set it up in a minute. You can start it whenever you&apos;re ready.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-7 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input name="name" required maxLength={100} className={inputClass} placeholder="Friday Night Smash" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">
              Game or sport <span className="font-normal text-zinc-400">(optional)</span>
            </span>
            <input name="game" maxLength={100} className={inputClass} placeholder="Chess, FIFA, Valorant…" />
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Format</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {FORMATS.map((f, i) => (
              <label
                key={f.value}
                className="relative cursor-pointer rounded-2xl border border-zinc-200 p-4 transition hover:border-zinc-400 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 has-[:checked]:ring-4 has-[:checked]:ring-amber-500/10 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-amber-500/30"
              >
                <input type="radio" name="format" value={f.value} defaultChecked={i === 0} className="peer sr-only" />
                <span className="absolute right-4 top-4 h-4 w-4 rounded-full border border-zinc-300 peer-checked:border-[5px] peer-checked:border-amber-500" />
                <span className="block pr-6 text-sm font-semibold">{f.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-zinc-500">{f.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

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

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          disabled={submitting || count < 2 || count > 256}
          className="w-full rounded-full bg-zinc-900 py-3 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Creating…" : "Create tournament"}
        </button>
      </form>
    </div>
  );
}
