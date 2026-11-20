"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorText } from "../atoms/Alert";
import { Button } from "../atoms/Button";
import { Card } from "../atoms/Card";
import { CopyField } from "../molecules/CopyField";

/** Organizer-only: share the sign-up link and open or close registration. */
export function RegistrationPanel({ tournamentId, open }: { tournamentId: string; open: boolean }) {
  const router = useRouter();
  const path = `/tournaments/${tournamentId}/join`;
  const [url, setUrl] = useState(path);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setUrl(window.location.origin + path), [path]);

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
    <Card tone={open ? "outlined" : "default"}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
            Sign-up link
            <span
              className={`rounded-full px-2 py-0.5 font-sans text-xs font-medium ${
                open ? "bg-success-soft text-success" : "bg-surface-sunken text-muted"
              }`}
            >
              {open ? "Open" : "Closed"}
            </span>
          </h2>
          <p className="mt-1 text-sm text-muted">
            {open
              ? "Share this link and players can add their own name, no account needed."
              : "Open sign-ups to let players add themselves with a link."}
          </p>
        </div>
        <Button variant={open ? "secondary" : "primary"} onClick={toggle} disabled={busy}>
          {busy ? "Saving…" : open ? "Close sign-ups" : "Open sign-ups"}
        </Button>
      </div>
      {open && (
        <div className="mt-4">
          <CopyField value={url} label="Sign-up link" />
        </div>
      )}
      {error && (
        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>
      )}
    </Card>
  );
}
