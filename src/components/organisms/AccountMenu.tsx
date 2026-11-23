"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Avatar } from "../atoms/Avatar";

const item =
  "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-sunken focus-visible:outline-offset-[-2px]";

/** Signed-in header control: avatar button that opens a small panel with account links and sign out. */
export function AccountMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Close when navigating, clicking outside, or pressing Escape (focus goes back to the button).
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 text-muted transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <Avatar label={name || email} />
        <svg aria-hidden viewBox="0 0 16 16" className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="currentColor">
          <path d="M4.2 6.2 8 10l3.8-3.8-1-1L8 8 5.2 5.2z" />
        </svg>
        <span className="sr-only">Account menu for {name || email}</span>
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-elevate"
        >
          <div className="px-3 py-2">
            {name && <p className="truncate text-sm font-semibold text-ink">{name}</p>}
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <div className="my-1 border-t border-line" />
          <ul>
            <li>
              <Link href="/dashboard" className={item}>
                My tournaments
              </Link>
            </li>
            <li>
              <Link href="/tournaments/new" className={item}>
                New tournament
              </Link>
            </li>
          </ul>
          <div className="my-1 border-t border-line" />
          <button type="button" onClick={signOut} disabled={signingOut} className={`${item} text-muted disabled:opacity-60`}>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
