import type { Standing } from "@/lib/standings";

export function Standings({
  standings,
  names,
  showBuchholz,
}: {
  standings: Standing[];
  names: Record<string, string>;
  showBuchholz: boolean;
}) {
  return (
    <section className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-right">P</th>
            <th className="px-4 py-3 text-right">W</th>
            <th className="px-4 py-3 text-right">L</th>
            <th className="px-4 py-3 text-right">+/-</th>
            {showBuchholz && (
              <th className="px-4 py-3 text-right" title="Buchholz: total wins of the opponents you played">
                Buch.
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {standings.map((s, i) => (
            <tr key={s.participantId} className={i === 0 ? "bg-amber-50/60" : ""}>
              <td className="px-4 py-2 tabular-nums text-zinc-500">{i + 1}</td>
              <td className="px-4 py-2 font-medium">{names[s.participantId]}</td>
              <td className="px-4 py-2 text-right tabular-nums">{s.played}</td>
              <td className="px-4 py-2 text-right tabular-nums">{s.wins}</td>
              <td className="px-4 py-2 text-right tabular-nums">{s.losses}</td>
              <td className="px-4 py-2 text-right tabular-nums">{s.scoreFor - s.scoreAgainst}</td>
              {showBuchholz && <td className="px-4 py-2 text-right tabular-nums">{s.buchholz}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
