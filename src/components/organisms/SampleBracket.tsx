import { LaurelMark } from "../atoms/LaurelMark";

/** Decorative 4-player bracket shown in the hero. */
export function SampleBracket() {
  const Slot = ({ name, score, win, gold }: { name: string; score: number; win?: boolean; gold?: boolean }) => (
    <div
      className={`flex items-center justify-between px-3 py-2 text-sm ${
        gold ? "text-amber-300" : win ? "text-white" : "text-zinc-400"
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
