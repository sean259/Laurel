"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MixTeamsButton({ tournamentId, mixed }: { tournamentId: string; mixed: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mix() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/teams`, { method: "POST" });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Could not mix teams");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        onClick={mix}
        disabled={busy}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {busy ? "Mixing…" : mixed ? "Re-mix teams" : "Mix teams"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
