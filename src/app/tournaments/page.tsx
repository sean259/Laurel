import Link from "next/link";
import type { Prisma, TournamentStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { currentUserId } from "@/lib/access";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { TournamentCard } from "@/components/organisms/TournamentCard";

export const dynamic = "force-dynamic";

const LIMIT = 60;

const FILTERS: { value: TournamentStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "IN_PROGRESS", label: "Live" },
  { value: "DRAFT", label: "Upcoming" },
  { value: "COMPLETED", label: "Completed" },
];

type Search = { q?: string; status?: string };

/** Build a list URL, keeping the other filter. */
function href({ q, status }: { q?: string; status?: string }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const s = params.toString();
  return s ? `/tournaments?${s}` : "/tournaments";
}

export default async function TournamentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const status = FILTERS.find((f) => f.value === sp.status)?.value;

  const where: Prisma.TournamentWhereInput = {
    visibility: "PUBLIC",
    ...(status && { status }),
    ...(q && {
      OR: [{ name: { contains: q, mode: "insensitive" } }, { game: { contains: q, mode: "insensitive" } }],
    }),
  };

  const db = getDb();
  const [userId, tournaments] = await Promise.all([
    currentUserId(),
    db.tournament.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { participants: true, players: true } } },
      take: LIMIT,
    }),
  ]);
  const filtered = !!(q || status);

  return (
    <div>
      <PageHeader
        title="Tournaments"
        description="Every public bracket on Laurel, newest first."
        actions={<ButtonLink href="/tournaments/new">New tournament</ButtonLink>}
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Plain GET form: works without JavaScript and the URL can be shared. */}
        <form action="/tournaments" role="search" className="flex w-full gap-2 lg:max-w-md">
          {status && <input type="hidden" name="status" value={status} />}
          <Input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Search by name or game"
            aria-label="Search tournaments by name or game"
            className="min-w-0 flex-1"
          />
          <Button type="submit" variant="secondary" className="h-auto">
            Search
          </Button>
        </form>

        <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <ul className="flex gap-1.5">
            {FILTERS.map((f) => {
              const active = f.value === status;
              return (
                <li key={f.label}>
                  <Link
                    href={href({ q, status: f.value })}
                    aria-current={active ? "page" : undefined}
                    className={`block whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-ink bg-ink text-on-ink"
                        : "border-line bg-surface text-muted hover:border-line-hover hover:text-ink"
                    }`}
                  >
                    {f.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {tournaments.length === 0 ? (
        filtered ? (
          <EmptyState
            compact
            title="No tournaments match"
            body={q ? <>Nothing found for “{q}”. Try a different name or game.</> : "Nothing here right now."}
            action={
              <ButtonLink href="/tournaments" variant="secondary">
                Clear filters
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            title="No tournaments yet"
            body="Be the first to crown a champion."
            action={
              <ButtonLink href="/tournaments/new" variant="accent">
                Create a tournament
              </ButtonLink>
            }
          />
        )
      ) : (
        <>
          {filtered && (
            <p className="mb-4 text-sm text-muted" aria-live="polite">
              {tournaments.length === LIMIT ? `Showing the ${LIMIT} newest results` : `${tournaments.length} found`}
              {" · "}
              <Link href="/tournaments" className="font-medium text-ink underline-offset-4 hover:underline">
                Clear filters
              </Link>
            </p>
          )}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <li key={t.id}>
                <TournamentCard
                  tournament={t}
                  players={t.teamSize > 1 ? t._count.players : t._count.participants}
                  mine={!!userId && t.ownerId === userId}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
