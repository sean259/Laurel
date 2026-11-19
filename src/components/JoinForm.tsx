"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinForm({ tournamentId, teams }: { tournamentId: string; teams: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not sign up");
      return;
    }
    setJoined(name.trim());
    router.refresh();
  }

  if (joined) {
    return (
      <div className="text-center">
        <p className="font-display text-2xl font-semibold">You&apos;re in, {joined}!</p>
        <p className="mt-2 text-zinc-600">
          {teams
            ? "The organizer will mix everyone into random teams before the start."
            : "You'll show up in the bracket when the organizer starts the tournament."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            View tournament
          </Link>
          <button
            onClick={() => {
              setJoined(null);
              setName("");
            }}
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50"
          >
            Sign up someone else
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-left">
        <span className="text-sm font-medium">Your name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          autoFocus
          autoComplete="name"
          placeholder="The name others will see"
          className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15"
        />
      </label>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-left text-sm text-red-700">{error}</p>}
      <button
        disabled={busy || !name.trim()}
        className="w-full rounded-full bg-amber-400 py-3 font-medium text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Signing up…" : "Sign me up"}
      </button>
    </form>
  );
}
