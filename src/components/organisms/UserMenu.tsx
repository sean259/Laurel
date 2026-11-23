import Link from "next/link";
import { currentUser } from "@/lib/auth/server";
import { AccountMenu } from "./AccountMenu";

/** Header control: the account menu, or a sign-in link. */
export async function UserMenu() {
  const user = await currentUser();
  if (!user) {
    return (
      <Link href="/sign-in" className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:text-ink">
        Sign in
      </Link>
    );
  }
  return <AccountMenu name={user.name ?? ""} email={user.email} />;
}
