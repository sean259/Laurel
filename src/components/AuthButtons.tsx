import { auth, signIn, signOut } from "@/auth";

export function SignInButton({ redirectTo, className }: { redirectTo?: string; className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo });
      }}
    >
      <button
        className={
          className ??
          "inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm font-medium hover:bg-zinc-50"
        }
      >
        <GoogleIcon />
        Sign in<span className="hidden sm:inline"> with Google</span>
      </button>
    </form>
  );
}

/** Header control: avatar + sign out when signed in, otherwise a sign-in button. */
export async function UserMenu() {
  const session = await auth();
  if (!session?.user) return <SignInButton />;
  const { name, email, image } = session.user;
  return (
    <form
      className="flex items-center gap-2"
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full" title={name ?? email ?? ""} />
      ) : (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">
          {(name ?? email ?? "?").slice(0, 1).toUpperCase()}
        </span>
      )}
      <button className="whitespace-nowrap text-sm text-zinc-600 hover:text-zinc-900">Sign out</button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
