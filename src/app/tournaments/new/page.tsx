import Link from "next/link";
import { currentUser } from "@/lib/auth/server";
import { LaurelMark } from "@/components/LaurelMark";
import { TournamentForm } from "@/components/TournamentForm";

export const dynamic = "force-dynamic";

export default async function NewTournamentPage() {
  if (!(await currentUser())) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white px-6 py-12 text-center">
        <LaurelMark className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Sign in to create a tournament</h1>
        <p className="mt-2 text-zinc-600">
          Your tournaments are tied to your account, so only you can report scores and make changes. Anyone with the link
          can still follow along.
        </p>
        <Link
          href="/sign-in?next=/tournaments/new"
          className="mt-6 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Sign in with email
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl font-semibold">New tournament</h1>
      <p className="mt-2 mb-8 text-zinc-600">Set it up in a minute. You can start it whenever you&apos;re ready.</p>
      <TournamentForm />
    </div>
  );
}
