import { currentUser } from "@/lib/auth/server";
import { ButtonLink } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { LaurelMark } from "@/components/atoms/LaurelMark";
import { SampleBracket } from "@/components/organisms/SampleBracket";

const features = [
  {
    title: "Four formats",
    body: "Single and double elimination, round robin and Swiss, with live standings.",
  },
  {
    title: "Smart seeding",
    body: "Top seeds are kept apart and byes are handled automatically.",
  },
  {
    title: "Auto-advance",
    body: "Report a score and the winner moves on to their next match instantly.",
  },
  {
    title: "One link to share",
    body: "Players and spectators follow the bracket from any device, no sign-up.",
  },
];

const steps = [
  { n: "01", title: "Name it", body: "Pick a game and a format." },
  { n: "02", title: "Add players", body: "Paste a list, or share a sign-up link and let players add themselves." },
  { n: "03", title: "Play it out", body: "Start the bracket and report scores until a champion is crowned." },
];

export default async function Home() {
  const signedIn = !!(await currentUser());
  return (
    <div className="space-y-24 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-inverse-line bg-inverse px-6 py-16 text-white sm:px-12 lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl"
        />
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-widest text-amber-300">
              <LaurelMark className="h-4 w-4" /> Free tournament brackets
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl">
              Where champions
              <br />
              are <span className="italic text-amber-400">crowned.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-zinc-300">
              Create a bracket in under a minute, report scores as you play, and share one live
              link with everyone.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/tournaments/new" variant="accent" size="lg">
                Create a tournament
              </ButtonLink>
              <ButtonLink href={signedIn ? "/dashboard" : "/tournaments"} variant="inverse" size="lg">
                {signedIn ? "My tournaments" : "Browse tournaments"}
              </ButtonLink>
            </div>
          </div>
          <SampleBracket />
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Everything a bracket needs</h2>
        <p className="mt-3 max-w-xl text-muted">Nothing it doesn&apos;t. Built for organizers who&apos;d rather be running the event.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} radius="2xl">
              <div aria-hidden className="mb-4 h-1 w-8 rounded-full bg-accent" />
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-10 lg:grid-cols-3">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Three steps to a champion</h2>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3 lg:col-span-2">
          {steps.map((s) => (
            <li key={s.n}>
              <span aria-hidden className="font-display text-4xl text-accent-ink">{s.n}</span>
              <h3 className="mt-2 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <Card padding="none" className="px-6 py-14 text-center">
        <LaurelMark className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-4 font-display text-3xl font-semibold text-ink">Ready when you are.</h2>
        <ButtonLink href="/tournaments/new" size="lg" className="mt-8">
          Start your first tournament
        </ButtonLink>
      </Card>
    </div>
  );
}
