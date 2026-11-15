"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartButton({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/start`, { method: "POST" });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Could not start");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={start}
        disabled={busy}
        className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-300 disabled:opacity-50"
      >
        {busy ? "Generating bracket…" : "Start tournament"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
