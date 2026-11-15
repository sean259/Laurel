import Link from "next/link";
import { currentUser } from "@/lib/auth/server";
import { SignOutButton } from "./SignOutButton";

/** Header control: who's signed in + sign out, or a sign-in link. */
export async function UserMenu() {
  const user = await currentUser();
  if (!user) {
    return (
      <Link href="/sign-in" className="whitespace-nowrap text-sm font-medium text-zinc-600 hover:text-zinc-900">
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span
        title={user.email}
        className="grid h-7 w-7 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800"
      >
        {(user.name || user.email).slice(0, 1).toUpperCase()}
      </span>
      <SignOutButton />
    </div>
  );
}
