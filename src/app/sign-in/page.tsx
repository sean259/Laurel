import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/server";
import { SignInForm } from "@/components/organisms/SignInForm";
import { CenteredPanel } from "@/components/templates/CenteredPanel";

export const dynamic = "force-dynamic";

// Only allow local paths so the sign-in page can't be used to bounce people to other sites.
const safeNext = (next?: string) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/tournaments");

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await currentUser()) redirect(next);

  return (
    <CenteredPanel title="Sign in to Laurel" description={<p>No password needed. We&apos;ll email you a code.</p>}>
      <SignInForm next={next} />
    </CenteredPanel>
  );
}
