"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FORMATS } from "@/lib/formats";

export default function NewTournamentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const participants = String(form.get("participants"))
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        game: form.get("game") || undefined,
        format: form.get("format"),
        participants,
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
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-5 rounded border bg-white p-6">
      <h1 className="text-2xl font-bold">New tournament</h1>

      <label className="block">
        <span className="text-sm font-medium">Name</span>
        <input name="name" required className="mt-1 w-full rounded border px-3 py-2" placeholder="Friday Night Smash" />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Game / sport (optional)</span>
        <input name="game" className="mt-1 w-full rounded border px-3 py-2" placeholder="Chess, FIFA, Valorant…" />
      </label>

      <fieldset>
        <legend className="text-sm font-medium">Format</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {FORMATS.map((f, i) => (
            <label
              key={f.value}
              className="cursor-pointer rounded-lg border border-zinc-200 p-3 hover:border-zinc-400 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50"
            >
              <input type="radio" name="format" value={f.value} defaultChecked={i === 0} className="sr-only" />
              <span className="block text-sm font-medium">{f.label}</span>
              <span className="mt-1 block text-xs text-zinc-500">{f.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium">Participants (one per line, in seed order)</span>
        <textarea name="participants" required rows={8} className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm" />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={submitting}
        className="w-full rounded bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create tournament"}
      </button>
    </form>
  );
}
