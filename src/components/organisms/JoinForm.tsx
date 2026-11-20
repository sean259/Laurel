"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "../atoms/Alert";
import { Button, ButtonLink } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Spinner } from "../atoms/Spinner";
import { Field } from "../molecules/Field";

export function JoinForm({ tournamentId, teams }: { tournamentId: string; teams: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not sign up");
      return;
    }
    setJoined(name.trim());
    router.refresh();
  }

  if (joined) {
    return (
      <div role="status" className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success-soft text-success">
          <svg aria-hidden viewBox="0 0 16 16" className="h-6 w-6" fill="currentColor">
            <path d="M6.4 11.2 3.2 8l-1.1 1.1 4.3 4.3 8-8-1.1-1.1z" />
          </svg>
        </div>
        <p className="mt-4 font-display text-2xl font-semibold text-ink">You&apos;re in, {joined}!</p>
        <p className="mt-2 text-muted">
          {teams
            ? "The organizer will mix everyone into random teams before the start."
            : "You'll show up in the bracket when the organizer starts the tournament."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`/tournaments/${tournamentId}`}>View tournament</ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              setJoined(null);
              setName("");
            }}
          >
            Sign up someone else
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Your name" hint="This is how you'll appear in the bracket.">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          autoFocus
          autoComplete="nickname"
          placeholder="e.g. Aurora"
        />
      </Field>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" variant="accent" size="lg" block disabled={busy || !name.trim()}>
        {busy && <Spinner />}
        {busy ? "Signing up…" : "Sign me up"}
      </Button>
    </form>
  );
}
