"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Organizer-only: share the sign-up link and open or close registration. */
export function RegistrationPanel({ tournamentId, open }: { tournamentId: string; open: boolean }) {
  const router = useRouter();
  const path = `/tournaments/${tournamentId}/join`;
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setUrl(window.location.origin + path), [path]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Select the link and copy it yourself.");
    }
  }

  async function toggle() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationOpen: !open }),
    });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Could not update sign-ups");
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Sign-up link</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {open
              ? "Sign-ups are open. Share this link and players can add their own name, no account needed."
              : "Sign-ups are closed. Open them to let players add themselves with a link."}
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50 ${
            open ? "border border-zinc-300 hover:bg-zinc-50" : "bg-zinc-900 text-white hover:bg-zinc-700"
          }`}
        >
          {busy ? "Saving…" : open ? "Close sign-ups" : "Open sign-ups"}
        </button>
      </div>
      {open && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={url}
            aria-label="Sign-up link"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2.5 font-mono text-sm text-zinc-700 outline-none focus:border-amber-500"
          />
          <button
            onClick={copy}
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-300"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
