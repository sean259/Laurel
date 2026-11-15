/** Laurel wreath logo mark. Inherits color via `currentColor`. */
export function LaurelMark({ className = "h-6 w-6" }: { className?: string }) {
  const leaves = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      {[-1, 1].map((side) => (
        <g key={side} transform={side === 1 ? "translate(32 0) scale(-1 1)" : undefined}>
          <path d="M15 28 C8 25 5 18 7 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          {leaves.map((i) => {
            const t = i / 4;
            const x = 7.4 + t * 1.2 - Math.sin(t * Math.PI) * 0.6;
            const y = 24 - t * 15;
            return (
              <ellipse
                key={i}
                cx={x - 1.6}
                cy={y}
                rx="1.3"
                ry="2.8"
                transform={`rotate(${-35 + t * 25} ${x - 1.6} ${y})`}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}
