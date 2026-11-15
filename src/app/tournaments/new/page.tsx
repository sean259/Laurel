import { TournamentForm } from "@/components/TournamentForm";

export default function NewTournamentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl font-semibold">New tournament</h1>
      <p className="mt-2 mb-8 text-zinc-600">Set it up in a minute. You can start it whenever you&apos;re ready.</p>
      <TournamentForm />
    </div>
  );
}
