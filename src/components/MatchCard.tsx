"use client";

import type { Match } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MatchCard({ match, names }: { match: Match; names: Record<string, string> }) {
  const router = useRouter();
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const ready = match.status === "READY";
  const done = match.status === "COMPLETED";

  async function report(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score1: Number(s1), score2: Number(s2) }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    router.refresh();
  }

  const row = (pid: string | null, score: number | null) => {
    const won = done && pid !== null && pid === match.winnerId;
    const lost = done && pid !== null && !won;
    return (
      <div className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${won ? "bg-amber-50/70" : ""}`}>
        <span
          className={`truncate ${won ? "font-semibold text-zinc-900" : lost ? "text-zinc-400" : pid ? "text-zinc-800" : "italic text-zinc-400"}`}
        >
          {pid ? names[pid] : match.bye ? "Bye" : "TBD"}
        </span>
        <span className={`tabular-nums ${won ? "font-semibold text-amber-700" : "text-zinc-400"}`}>{score ?? ""}</span>
      </div>
    );
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm ${
        ready ? "border-amber-300 ring-4 ring-amber-400/10" : "border-zinc-200"
      } ${match.bye ? "opacity-60" : ""}`}
    >
      {row(match.participant1Id, match.score1)}
      <div className="border-t border-zinc-100" />
      {row(match.participant2Id, match.score2)}

      {ready && (
        <form onSubmit={report} className="flex items-center gap-1.5 border-t border-zinc-100 bg-zinc-50 px-2 py-1.5">
          <input
            value={s1}
            onChange={(e) => setS1(e.target.value)}
            type="number"
            min={0}
            required
            aria-label={`Score for ${names[match.participant1Id!]}`}
            className="w-12 rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 text-sm outline-none focus:border-amber-500"
          />
          <span className="text-zinc-400">–</span>
          <input
            value={s2}
            onChange={(e) => setS2(e.target.value)}
            type="number"
            min={0}
            required
            aria-label={`Score for ${names[match.participant2Id!]}`}
            className="w-12 rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 text-sm outline-none focus:border-amber-500"
          />
          <button
            disabled={saving}
            className="ml-auto rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving ? "…" : "Save"}
          </button>
        </form>
      )}
      {error && <p className="px-3 pb-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
