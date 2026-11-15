import Link from "next/link";
import { LaurelMark } from "@/components/LaurelMark";

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
  { n: "02", title: "Add players", body: "Paste a list, one name per line." },
  { n: "03", title: "Play it out", body: "Start the bracket and report scores until a champion is crowned." },
];

export default function Home() {
  return (
    <div className="space-y-24 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-16 text-white sm:px-12 lg:py-24">
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
              <Link
                href="/tournaments/new"
                className="rounded-full bg-amber-400 px-6 py-3 font-medium text-zinc-950 hover:bg-amber-300"
              >
                Create a tournament
              </Link>
              <Link
                href="/tournaments"
                className="rounded-full border border-white/20 px-6 py-3 font-medium hover:bg-white/10"
              >
                Browse tournaments
              </Link>
            </div>
          </div>
          <SampleBracket />
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Everything a bracket needs</h2>
        <p className="mt-3 max-w-xl text-zinc-600">Nothing it doesn&apos;t. Built for organizers who&apos;d rather be running the event.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="mb-4 h-1 w-8 rounded-full bg-amber-400" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-10 lg:grid-cols-3">
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Three steps to a champion</h2>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3 lg:col-span-2">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="font-display text-4xl text-amber-500">{s.n}</span>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-14 text-center">
        <LaurelMark className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-4 font-display text-3xl font-semibold">Ready when you are.</h2>
        <Link
          href="/tournaments/new"
          className="mt-8 inline-block rounded-full bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700"
        >
          Start your first tournament
        </Link>
      </section>
    </div>
  );
}

/** Decorative 4-player bracket shown in the hero. */
function SampleBracket() {
  const Slot = ({ name, score, win, gold }: { name: string; score: number; win?: boolean; gold?: boolean }) => (
    <div
      className={`flex items-center justify-between px-3 py-2 text-sm ${
        gold ? "text-amber-300" : win ? "text-white" : "text-zinc-500"
      }`}
    >
      <span>{name}</span>
      <span className="tabular-nums">{score}</span>
    </div>
  );
  const Match = ({ children, gold }: { children: React.ReactNode; gold?: boolean }) => (
    <div
      className={`w-40 divide-y rounded-xl border ${
        gold ? "divide-amber-400/30 border-amber-400/50 bg-amber-400/10" : "divide-white/10 border-white/10 bg-white/5"
      }`}
    >
      {children}
    </div>
  );

  return (
    <div aria-hidden className="hidden items-center justify-center gap-8 sm:flex">
      <div className="flex flex-col gap-6">
        <Match>
          <Slot name="Aurora" score={3} win />
          <Slot name="Vortex" score={1} />
        </Match>
        <Match>
          <Slot name="Nimbus" score={0} />
          <Slot name="Ember" score={2} win />
        </Match>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-amber-300">Final</span>
        <Match gold>
          <Slot name="Aurora" score={3} gold />
          <Slot name="Ember" score={2} />
        </Match>
        <LaurelMark className="h-8 w-8 text-amber-400" />
      </div>
    </div>
  );
}
