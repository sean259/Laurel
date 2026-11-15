import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/server";
import { LaurelMark } from "@/components/LaurelMark";
import { SignInForm } from "@/components/SignInForm";

export const dynamic = "force-dynamic";

// Only allow local paths so the sign-in page can't be used to bounce people to other sites.
const safeNext = (next?: string) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/tournaments");

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await currentUser()) redirect(next);

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white px-6 py-10 sm:px-10">
      <LaurelMark className="mx-auto h-10 w-10 text-amber-500" />
      <h1 className="mt-4 text-center font-display text-3xl font-semibold">Sign in to Laurel</h1>
      <p className="mt-2 mb-8 text-center text-zinc-600">
        No password needed. We&apos;ll email you a code.
      </p>
      <SignInForm next={next} />
    </div>
  );
}
