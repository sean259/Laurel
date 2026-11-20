"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorText } from "../atoms/Alert";
import { Button } from "../atoms/Button";
import { SectionHeading } from "../molecules/SectionHeading";

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

  return (
    <section className="mt-12" aria-labelledby="danger-zone">
      <SectionHeading id="danger-zone" title="Danger zone" description="These can't be undone." />
      <div className="divide-y divide-danger-line rounded-3xl border border-danger-line bg-surface">
        {started && (
          <div className={row}>
            <div>
              <p className="font-medium text-ink">Reset to draft</p>
              <p className="mt-0.5 text-sm text-muted">
                Delete the bracket and all scores so you can change the format, players or seeding.
              </p>
            </div>
            <Button variant="danger" onClick={() => run("reset")} disabled={busy !== null}>
              {busy === "reset" ? "Resetting…" : "Reset tournament"}
            </Button>
          </div>
        )}
        <div className={row}>
          <div>
            <p className="font-medium text-ink">Delete tournament</p>
            <p className="mt-0.5 text-sm text-muted">Remove it and everything in it for good.</p>
          </div>
          <Button variant="danger" onClick={() => run("delete")} disabled={busy !== null}>
            {busy === "delete" ? "Deleting…" : "Delete tournament"}
          </Button>
        </div>
      </div>
      {error && (
        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>
      )}
    </section>
  );
}
