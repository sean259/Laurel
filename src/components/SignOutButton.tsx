"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
      className="whitespace-nowrap text-sm text-zinc-600 hover:text-zinc-900"
    >
      Sign out
    </button>
  );
}
