"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DangerZone({ id, name, started }: { id: string; name: string; started: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"reset" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "reset" | "delete") {
    const question =
      kind === "reset"
        ? `Reset "${name}" to draft? The bracket and every reported score will be deleted.`
        : `Delete "${name}" permanently? This can't be undone.`;
    if (!window.confirm(question)) return;

    setBusy(kind);
    setError(null);
    const res = await fetch(kind === "reset" ? `/api/tournaments/${id}/reset` : `/api/tournaments/${id}`, {
      method: kind === "reset" ? "POST" : "DELETE",
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Something went wrong");
      setBusy(null);
      return;
    }
    router.push(kind === "reset" ? `/tournaments/${id}/edit` : "/tournaments");
    router.refresh();
    if (kind === "reset") setBusy(null);
  }

  const row = "flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6";
  const button =
    "shrink-0 rounded-full border border-red-300 px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50";

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">Danger zone</h2>
      <div className="mt-4 divide-y divide-red-100 rounded-3xl border border-red-200 bg-white">
        {started && (
          <div className={row}>
            <div>
              <p className="font-medium">Reset to draft</p>
              <p className="text-sm text-zinc-500">
                Delete the bracket and all scores so you can change the format, players or seeding.
              </p>
            </div>
            <button onClick={() => run("reset")} disabled={busy !== null} className={button}>
              {busy === "reset" ? "Resetting…" : "Reset tournament"}
            </button>
          </div>
        )}
        <div className={row}>
          <div>
            <p className="font-medium">Delete tournament</p>
            <p className="text-sm text-zinc-500">Remove it and everything in it for good.</p>
          </div>
          <button onClick={() => run("delete")} disabled={busy !== null} className={button}>
            {busy === "delete" ? "Deleting…" : "Delete tournament"}
          </button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
