"use client";

import type { Match } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const scoreInput =
  "w-12 rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 text-sm outline-none focus:border-amber-500";

export function MatchCard({
  match,
  names,
  canManage,
}: {
  match: Match;
  names: Record<string, string>;
  canManage: boolean;
}) {
  const router = useRouter();
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ready = match.status === "READY" && canManage;
  const done = match.status === "COMPLETED";
  const editable = done && !match.bye && canManage;
  const showForm = ready || editing;

  function startEditing() {
    setS1(String(match.score1 ?? ""));
    setS2(String(match.score2 ?? ""));
    setError(null);
    setEditing(true);
  }

  async function send(url: string, init: RequestInit) {
    setError(null);
    setBusy(true);
    const res = await fetch(url, init);
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    setEditing(false);
    setS1("");
    setS2("");
    router.refresh();
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    send(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score1: Number(s1), score2: Number(s2) }),
    });
  }

  const undo = () => send(`/api/matches/${match.id}/undo`, { method: "POST" });

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

  const players = (
    <>
      {row(match.participant1Id, match.score1)}
      <div className="border-t border-zinc-100" />
      {row(match.participant2Id, match.score2)}
    </>
  );

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm ${
        showForm || (match.status === "READY" && !canManage) ? "border-amber-300 ring-4 ring-amber-400/10" : "border-zinc-200"
      } ${match.bye ? "opacity-60" : ""}`}
    >
      {editable && !editing ? (
        <button
          type="button"
          onClick={startEditing}
          title="Edit or undo this result"
          className="block w-full text-left transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500"
        >
          {players}
        </button>
      ) : (
        players
      )}

      {showForm && (
        <form onSubmit={save} className="border-t border-zinc-100 bg-zinc-50 px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <input
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              type="number"
              min={0}
              required
              autoFocus={editing}
              aria-label={`Score for ${names[match.participant1Id!]}`}
              className={scoreInput}
            />
            <span className="text-zinc-400">–</span>
            <input
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              type="number"
              min={0}
              required
              aria-label={`Score for ${names[match.participant2Id!]}`}
              className={scoreInput}
            />
            <button
              disabled={busy}
              className="ml-auto rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {busy ? "…" : "Save"}
            </button>
          </div>
          {editing && (
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <button type="button" onClick={undo} disabled={busy} className="font-medium text-red-600 hover:text-red-800">
                Undo result
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="text-zinc-500 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      )}
      {error && <p className="px-3 pb-2 pt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
