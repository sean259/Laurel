import { currentUser } from "@/lib/auth/server";
import { ButtonLink } from "@/components/atoms/Button";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TournamentForm } from "@/components/organisms/TournamentForm";
import { CenteredPanel } from "@/components/templates/CenteredPanel";

export const dynamic = "force-dynamic";

export default async function NewTournamentPage() {
  if (!(await currentUser())) {
    return (
      <CenteredPanel
        title="Sign in to create a tournament"
        description={
          <p>
            Your tournaments are tied to your account, so only you can report scores and make changes. Anyone with the
            link can still follow along.
          </p>
        }
      >
        <ButtonLink href="/sign-in?next=/tournaments/new" size="lg" block>
          Sign in with email
        </ButtonLink>
      </CenteredPanel>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New tournament"
        description="Set it up in a minute. You can start it whenever you're ready."
        back={{ href: "/tournaments", label: "All tournaments" }}
      />
      <TournamentForm />
    </div>
  );
}
