"use client";

import type { Match } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../atoms/Button";
import { ErrorText } from "../atoms/Alert";

const scoreInput =
  "h-9 w-14 rounded-lg border border-line-strong bg-surface px-2 text-center text-sm tabular-nums text-ink outline-none focus:border-accent-strong focus:ring-4 focus:ring-accent-strong/20";

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

  const ready = match.status === "READY";
  const done = match.status === "COMPLETED";
  const editable = done && !match.bye && canManage;
  const showForm = (ready && canManage) || editing;
  // Ties can't decide who advances; say so before the server has to.
  const tie = s1 !== "" && s2 !== "" && Number(s1) === Number(s2);

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
      <div className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${won ? "bg-accent-soft" : ""}`}>
        <span
          className={`flex min-w-0 items-center gap-1.5 ${
            won ? "font-semibold text-ink" : lost ? "text-subtle" : pid ? "text-ink" : "italic text-subtle"
          }`}
        >
          <span className="truncate">{pid ? names[pid] : match.bye ? "Bye" : "TBD"}</span>
          {won && (
            <>
              <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-accent-ink" fill="currentColor">
                <path d="M6.4 11.2 3.2 8l-1.1 1.1 4.3 4.3 8-8-1.1-1.1z" />
              </svg>
              <span className="sr-only">(winner)</span>
            </>
          )}
        </span>
        <span className={`tabular-nums ${won ? "font-semibold text-accent-ink" : "text-subtle"}`}>{score ?? ""}</span>
      </div>
    );
  };

  const players = (
    <>
      {row(match.participant1Id, match.score1)}
      <div className="border-t border-line" />
      {row(match.participant2Id, match.score2)}
    </>
  );

  const frame = match.bye
    ? "border-dashed border-line bg-canvas"
    : showForm || ready
      ? "border-amber-400 bg-surface ring-4 ring-amber-400/15"
      : "border-line bg-surface shadow-sm";

  return (
    <div className={`w-full overflow-hidden rounded-xl border text-left ${frame}`}>
      {editable && !editing ? (
        <button
          type="button"
          onClick={startEditing}
          aria-label={`Edit result: ${names[match.participant1Id!]} ${match.score1}, ${names[match.participant2Id!]} ${match.score2}`}
          title="Edit or undo this result"
          className="block w-full text-left transition-colors hover:bg-canvas focus-visible:outline-offset-[-2px]"
        >
          {players}
        </button>
      ) : (
        players
      )}

      {showForm && (
        <form onSubmit={save} className="border-t border-line bg-canvas px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <input
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              type="number"
              inputMode="numeric"
              min={0}
              required
              autoFocus={editing}
              aria-label={`Score for ${names[match.participant1Id!]}`}
              className={scoreInput}
            />
            <span aria-hidden className="text-subtle">
              –
            </span>
            <input
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              type="number"
              inputMode="numeric"
              min={0}
              required
              aria-label={`Score for ${names[match.participant2Id!]}`}
              className={scoreInput}
            />
            <Button type="submit" size="sm" disabled={busy || tie} className="ml-auto">
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
          {tie && <p className="mt-1.5 text-xs text-muted">Scores can&apos;t be tied: one side has to win.</p>}
          {editing && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <button type="button" onClick={undo} disabled={busy} className="rounded font-medium text-danger hover:underline">
                Undo result
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="rounded font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      )}
      {error && (
        <div className="px-3 pb-2 pt-1">
          <ErrorText>{error}</ErrorText>
        </div>
      )}
    </div>
  );
}
