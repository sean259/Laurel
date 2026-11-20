import Link from "next/link";
import { ButtonLink } from "../atoms/Button";
import { LaurelMark } from "../atoms/LaurelMark";
import { NavLink } from "../molecules/NavLink";
import { UserMenu } from "./UserMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-4">
        <Link href="/" className="mr-1 flex items-center gap-2 rounded-lg font-display text-xl font-semibold text-ink">
          <LaurelMark className="h-6 w-6 text-amber-500" />
          Laurel
        </Link>
        <NavLink href="/tournaments" exact>
          Tournaments
        </NavLink>
        <div className="ml-auto flex items-center gap-2">
          <ButtonLink href="/tournaments/new" size="sm" aria-label="New tournament">
            <span aria-hidden className="text-base leading-none">
              +
            </span>
            <span className="hidden sm:inline">New tournament</span>
          </ButtonLink>
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-subtle sm:flex-row">
        <p className="flex items-center gap-2">
          <LaurelMark className="h-4 w-4 text-amber-500" />© {new Date().getFullYear()} Laurel
        </p>
        <p>Where champions are crowned</p>
      </div>
    </footer>
  );
}
