/** Laurel wreath logo mark: two leafy branches curving up. Inherits color via `currentColor`. */

type P = { x: number; y: number };

// Left branch stem: quadratic curve from the bottom center up to the top left.
const P0 = { x: 14.5, y: 29 };
const P1 = { x: 3, y: 22 };
const P2 = { x: 9, y: 4 };

const at = (t: number): P => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});
const tangent = (t: number): P => {
  const x = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const y = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  const len = Math.hypot(x, y);
  return { x: x / len, y: y / len };
};

/** A leaf at point t on the stem, pointing outward (side = 1) or inward (side = -1). */
function leaf(t: number, side: 1 | -1, size: number) {
  const p = at(t);
  const tan = tangent(t);
  const normal = { x: tan.y * side, y: -tan.x * side };
  const dir = { x: tan.x + normal.x * 0.8, y: tan.y + normal.y * 0.8 };
  const angle = (Math.atan2(dir.y, dir.x) * 180) / Math.PI + 90;
  const cx = p.x + normal.x * 1.4 * size + tan.x * 0.6;
  const cy = p.y + normal.y * 1.4 * size + tan.y * 0.6;
  const r = (n: number) => Math.round(n * 100) / 100;
  return { cx: r(cx), cy: r(cy), rx: r(1.15 * size), ry: r(2.6 * size), angle: r(angle) };
}

const LEAVES = [
  ...[0.12, 0.32, 0.52, 0.72].map((t) => leaf(t, 1, 1)),
  ...[0.22, 0.42, 0.62, 0.82].map((t) => leaf(t, -1, 0.8)),
  leaf(0.98, 1, 0.9),
];

export function LaurelMark({ className = "h-6 w-6" }: { className?: string }) {
  const stem = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      {[false, true].map((mirror) => (
        <g key={String(mirror)} transform={mirror ? "translate(32 0) scale(-1 1)" : undefined}>
          <path d={stem} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          {LEAVES.map((l, i) => (
            <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} transform={`rotate(${l.angle} ${l.cx} ${l.cy})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}
