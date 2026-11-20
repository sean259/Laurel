import type { Standing } from "@/lib/standings";
import { Card } from "../atoms/Card";

const th = "px-4 py-3 font-semibold";
const td = "px-4 py-2.5 text-right tabular-nums";

export function Standings({
  standings,
  names,
  showBuchholz,
  entryLabel = "Player",
}: {
  standings: Standing[];
  names: Record<string, string>;
  showBuchholz: boolean;
  entryLabel?: string;
}) {
  return (
    <Card padding="none" radius="2xl" className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Standings, best first</caption>
        <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className={th}>
              #
            </th>
            <th scope="col" className={th}>
              {entryLabel}
            </th>
            <th scope="col" className={`${th} text-right`}>
              <abbr title="Played" className="no-underline">
                P
              </abbr>
            </th>
            <th scope="col" className={`${th} text-right`}>
              <abbr title="Wins" className="no-underline">
                W
              </abbr>
            </th>
            <th scope="col" className={`${th} text-right`}>
              <abbr title="Losses" className="no-underline">
                L
              </abbr>
            </th>
            <th scope="col" className={`${th} text-right`}>
              <abbr title="Score difference" className="no-underline">
                +/-
              </abbr>
            </th>
            {showBuchholz && (
              <th scope="col" className={`${th} text-right`}>
                <abbr title="Buchholz: total wins of the opponents you played" className="no-underline">
                  Buch.
                </abbr>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {standings.map((s, i) => {
            const diff = s.scoreFor - s.scoreAgainst;
            return (
              <tr key={s.participantId} className={i === 0 ? "bg-accent-soft" : "hover:bg-canvas"}>
                <td className="px-4 py-2.5 tabular-nums text-subtle">{i + 1}</td>
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                  {names[s.participantId]}
                </th>
                <td className={td}>{s.played}</td>
                <td className={`${td} font-semibold`}>{s.wins}</td>
                <td className={td}>{s.losses}</td>
                <td className={`${td} ${diff > 0 ? "text-success" : diff < 0 ? "text-danger" : "text-muted"}`}>
                  {diff > 0 ? `+${diff}` : diff}
                </td>
                {showBuchholz && <td className={td}>{s.buchholz}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
