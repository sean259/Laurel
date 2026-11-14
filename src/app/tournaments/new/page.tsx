"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

      <label className="block">
        <span className="text-sm font-medium">Format</span>
        <select name="format" className="mt-1 w-full rounded border px-3 py-2">
          <option value="SINGLE_ELIMINATION">Single elimination</option>
          <option value="ROUND_ROBIN">Round robin</option>
        </select>
      </label>

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
