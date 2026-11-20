import Link from "next/link";
import { currentUser } from "@/lib/auth/server";
import { Avatar } from "../atoms/Avatar";
import { SignOutButton } from "../molecules/SignOutButton";

/** Header control: who's signed in + sign out, or a sign-in link. */
export async function UserMenu() {
  const user = await currentUser();
  if (!user) {
    return (
      <Link href="/sign-in" className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:text-ink">
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Avatar label={user.name || user.email} title={user.email} />
      <span className="sr-only">Signed in as {user.name || user.email}</span>
      <SignOutButton />
    </div>
  );
}
