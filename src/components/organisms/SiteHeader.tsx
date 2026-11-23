import Link from "next/link";
import { currentUser } from "@/lib/auth/server";
import { ButtonLink } from "../atoms/Button";
import { LaurelMark, LaurelTile } from "../atoms/LaurelMark";
import { NavLink } from "../molecules/NavLink";
import { SeasonalSwitch, ThemePicker, ThemeToggle } from "../molecules/ThemeToggle";
import { UserMenu } from "./UserMenu";

export async function SiteHeader() {
  const signedIn = !!(await currentUser());
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center gap-1 px-4 sm:gap-3">
        <Link href="/" className="group mr-1 flex items-center gap-2.5 rounded-lg font-display text-xl font-semibold tracking-tight text-ink">
          <LaurelTile />
          Laurel
          {/* The season's emoji (CSS, see globals.css). Hidden on phones, where the header is full. */}
          <span aria-hidden className="season-mark hidden sm:inline" />
        </Link>
        <NavLink href="/tournaments" exact>
          Tournaments
        </NavLink>
        {/* On phones this lives in the account menu instead. */}
        {signedIn && (
          <span className="hidden sm:contents">
            <NavLink href="/dashboard">My tournaments</NavLink>
          </span>
        )}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ButtonLink href="/tournaments/new" size="sm" aria-label="New tournament">
            <span aria-hidden className="text-base leading-none">
              +
            </span>
            <span className="hidden sm:inline">New tournament</span>
          </ButtonLink>
          <ThemeToggle />
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-subtle sm:flex-row">
        <p className="flex items-center gap-2">
          <LaurelMark className="h-4 w-4 text-accent-strong" />© {new Date().getFullYear()} Laurel · Where champions are crowned
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SeasonalSwitch />
          <ThemePicker />
        </div>
      </div>
    </footer>
  );
}
