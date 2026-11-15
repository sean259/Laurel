"use client";

import type { Match } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MatchCard({ match, names }: { match: Match; names: Record<string, string> }) {
  const router = useRouter();
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isBye = match.bye;

  async function report(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score1: Number(s1), score2: Number(s2) }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    router.refresh();
  }

  const row = (pid: string | null, score: number | null) => (
    <div className={`flex justify-between px-3 py-1.5 text-sm ${pid && pid === match.winnerId ? "font-semibold" : ""}`}>
      <span className={pid ? "" : "text-zinc-400"}>{pid ? names[pid] : isBye ? "BYE" : "TBD"}</span>
      <span>{score ?? ""}</span>
    </div>
  );

  return (
    <div className="rounded border bg-white shadow-sm">
      {row(match.participant1Id, match.score1)}
      <div className="border-t" />
      {row(match.participant2Id, match.score2)}

      {match.status === "READY" && (
        <form onSubmit={report} className="flex items-center gap-1 border-t bg-zinc-50 px-2 py-1.5">
          <input value={s1} onChange={(e) => setS1(e.target.value)} type="number" min={0} required className="w-12 rounded border px-1 text-sm" />
          <span className="text-zinc-400">–</span>
          <input value={s2} onChange={(e) => setS2(e.target.value)} type="number" min={0} required className="w-12 rounded border px-1 text-sm" />
          <button className="ml-auto rounded bg-indigo-600 px-2 py-0.5 text-xs text-white">Save</button>
        </form>
      )}
      {error && <p className="px-3 pb-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
