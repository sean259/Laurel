"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorText } from "../atoms/Alert";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

/**
 * Organizer-only: a bracket entry's name with a pencil button that turns it into an inline field.
 * Enter saves, Escape cancels.
 */
export function EditableName({ participantId, name, className = "" }: { participantId: string; name: string; className?: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setEditing(false);
    setValue(name);
    setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const next = value.trim();
    if (next === name) return cancel();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/participants/${participantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: next }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not rename");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <span className={`group/name inline-flex min-w-0 items-center gap-1 ${className}`}>
        <span className="truncate" title={name}>
          {name}
        </span>
        <button
          type="button"
          onClick={() => {
            setValue(name);
            setEditing(true);
          }}
          aria-label={`Rename ${name}`}
          title="Rename"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M13.5 3.5 16.5 6.5 7 16H4v-3z" />
          </svg>
        </button>
      </span>
    );
  }

  return (
    <form onSubmit={save} className="w-full space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && cancel()}
          onFocus={(e) => e.currentTarget.select()}
          autoFocus
          required
          maxLength={60}
          aria-label={`New name for ${name}`}
          aria-invalid={error ? true : undefined}
          compact
          className="min-w-0 flex-1"
        />
        <Button type="submit" size="sm" disabled={busy || !value.trim()}>
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" size="sm" onClick={cancel} disabled={busy}>
          Cancel
        </Button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </form>
  );
}
