"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Format } from "@/lib/engine";
import { FORMATS } from "@/lib/formats";
import { teamCount } from "@/lib/teams";
import { MAX_ENTRIES, MAX_TEAM_SIZE, minPlayers } from "@/lib/validation";
import { Alert } from "../atoms/Alert";
import { Button } from "../atoms/Button";
import { Card } from "../atoms/Card";
import { Input, Select, Textarea } from "../atoms/Input";
import { Spinner } from "../atoms/Spinner";
import { Field } from "../molecules/Field";

/** Selectable card used for the format radios and the sign-up checkbox. */
const choiceCard =
  "relative cursor-pointer rounded-2xl border border-line bg-surface p-4 transition hover:border-zinc-400 has-[:checked]:border-amber-500 has-[:checked]:bg-accent-soft has-[:checked]:ring-4 has-[:checked]:ring-amber-500/15 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-amber-600 has-[:focus-visible]:[outline-style:solid]";

const parse = (text: string) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

type Existing = {
  id: string;
  name: string;
  game: string | null;
  format: Format;
  teamSize: number;
  registrationOpen: boolean;
  started: boolean;
  participants: string[]; // draft: seed order (solo) or the player pool (teams); started: bracket entries
};

const TEAM_SIZES = Array.from({ length: MAX_TEAM_SIZE }, (_, i) => i + 1);

/** Create a tournament, or edit an existing one (`tournament` given). */
export function TournamentForm({ tournament }: { tournament?: Existing }) {
  const router = useRouter();
  const editing = !!tournament;
  const locked = tournament?.started ?? false; // started: format and player count are fixed

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [players, setPlayers] = useState(tournament?.participants.join("\n") ?? "");
  const [renames, setRenames] = useState(tournament?.participants ?? []);
  const [teamSize, setTeamSize] = useState(tournament?.teamSize ?? 1);
  const [registrationOpen, setRegistrationOpen] = useState(tournament?.registrationOpen ?? false);
  const teams = teamSize > 1;
  const count = locked ? renames.length : parse(players).length;
  const renamesValid = renames.every((r) => r.trim().length > 0);
  const enough = locked || registrationOpen || count >= minPlayers(teamSize);
  const tooMany = !locked && count > MAX_ENTRIES;

  function shuffle() {
    const list = parse(players);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setPlayers(list.join("\n"));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const list = locked ? renames.map((r) => r.trim()) : parse(players);
    const original = tournament?.participants ?? [];
    const listChanged = !editing || list.length !== original.length || list.some((p, i) => p !== original[i]);
    const body = {
      name: form.get("name"),
      game: editing ? String(form.get("game") ?? "") : form.get("game") || undefined,
      ...(!locked && { format: form.get("format"), teamSize }),
      registrationOpen,
      // Only send the list when it was edited, along with the list it was edited from, so the
      // server can refuse instead of silently dropping anyone who signed up in the meantime.
      ...(listChanged && { participants: list }),
      ...(editing && listChanged && { previousParticipants: original }),
    };

    const res = await fetch(editing ? `/api/tournaments/${tournament.id}` : "/api/tournaments", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    const id = editing ? tournament.id : (await res.json()).id;
    router.push(`/tournaments/${id}`);
    router.refresh();
  }

  const countSummary = (
    <span aria-live="polite">
      <span className="font-medium text-ink">
        {count} {count === 1 ? "player" : "players"}
      </span>
      {teams && teamCount(count, teamSize) >= 2 && ` → ${teamCount(count, teamSize)} teams`}
      {!tooMany && !enough && ` · need at least ${minPlayers(teamSize)}, or let players sign up`}
      {registrationOpen && count === 0 && " · players will add themselves with the link"}
    </span>
  );

  return (
    <Card padding="lg">
      <form onSubmit={onSubmit} className="space-y-10">
        <Step n={1} title="The basics">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name">
              <Input name="name" required maxLength={100} defaultValue={tournament?.name} placeholder="Friday Night Smash" />
            </Field>
            <Field label="Game or sport" optional>
              <Input name="game" maxLength={100} defaultValue={tournament?.game ?? ""} placeholder="Chess, FIFA, Valorant…" />
            </Field>
          </div>
        </Step>

        <Step n={2} title="Format">
          <fieldset disabled={locked}>
            <legend className="sr-only">Format</legend>
            {locked && <p className="mb-3 text-xs text-subtle">Reset the tournament to draft to change the format.</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {FORMATS.map((f) => (
                <label key={f.value} className={choiceCard}>
                  <input
                    type="radio"
                    name="format"
                    value={f.value}
                    defaultChecked={(tournament?.format ?? "SINGLE_ELIMINATION") === f.value}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="absolute right-4 top-4 h-4 w-4 rounded-full border border-zinc-400 bg-surface peer-checked:border-[5px] peer-checked:border-amber-500"
                  />
                  <span className="block pr-6 text-sm font-semibold text-ink">{f.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{f.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Step>

        <Step n={3} title={teams ? "Players and teams" : "Players"}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Players per team"
              hint={
                teams
                  ? "Players sign up on their own. You mix them into random teams before starting."
                  : "Each player is their own entry in the bracket."
              }
            >
              <Select value={teamSize} disabled={locked} onChange={(e) => setTeamSize(Number(e.target.value))}>
                {TEAM_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? "Solo (1v1)" : `${n} per team (${n}v${n}), random teams`}
                  </option>
                ))}
              </Select>
            </Field>
            <label className={`${choiceCard} flex items-start gap-3 self-start`}>
              <input
                type="checkbox"
                checked={registrationOpen}
                disabled={locked}
                onChange={(e) => setRegistrationOpen(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">Let players sign up with a link</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">
                  Anyone with the link can add their name until you start. No account needed.
                </span>
              </span>
            </label>
          </div>

          {locked ? (
            <div>
              <p className="text-sm font-medium text-ink">{teams ? "Team names" : "Player names"}</p>
              <p className="mt-1 text-xs text-subtle">
                Fix spelling here. To add, remove or reorder players, reset the tournament to draft.
              </p>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {renames.map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span aria-hidden className="w-6 text-right text-xs tabular-nums text-subtle">
                      {i + 1}
                    </span>
                    <Input
                      value={r}
                      maxLength={60}
                      aria-label={`${teams ? "Team" : "Player"} ${i + 1}`}
                      aria-invalid={r.trim() ? undefined : true}
                      onChange={(e) => setRenames(renames.map((x, j) => (j === i ? e.target.value : x)))}
                      compact
                    />
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <Field
              label={
                <>
                  Players{" "}
                  <span className="font-normal text-subtle">
                    (one per line{teams ? "" : ", best seed first"}
                    {registrationOpen ? ", optional" : ""})
                  </span>
                </>
              }
              action={
                !teams && (
                  <Button variant="ghost" size="sm" onClick={shuffle} disabled={count < 2} className="-mb-1">
                    Shuffle seeds
                  </Button>
                )
              }
              hint={countSummary}
              error={tooMany ? `That is more than the maximum of ${MAX_ENTRIES} players.` : undefined}
            >
              <Textarea
                value={players}
                onChange={(e) => setPlayers(e.target.value)}
                required={!registrationOpen}
                rows={8}
                className="font-mono text-sm"
                placeholder={"Aurora\nEmber\nNimbus\nVortex"}
              />
            </Field>
          )}
        </Step>

        {error && <Alert>{error}</Alert>}

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row">
          {editing && (
            <Button variant="secondary" size="lg" onClick={() => router.push(`/tournaments/${tournament.id}`)} className="sm:w-40">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={submitting || !enough || tooMany || (locked && !renamesValid)}
            className="flex-1"
          >
            {submitting && <Spinner />}
            {submitting ? "Saving…" : editing ? "Save changes" : "Create tournament"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

/** Numbered group of fields. */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="space-y-4">
      <h2 id={`step-${n}`} className="flex items-center gap-3 text-base font-semibold text-ink">
        <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
