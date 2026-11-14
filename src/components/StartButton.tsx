"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartButton({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    const res = await fetch(`/api/tournaments/${tournamentId}/start`, { method: "POST" });
    if (!res.ok) alert((await res.json().catch(() => ({}))).error ?? "Could not start");
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={start}
      disabled={busy}
      className="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {busy ? "Generating…" : "Start tournament"}
    </button>
  );
}
