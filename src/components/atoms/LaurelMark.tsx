/**
 * Laurel wreath logo mark: two leafy branches crossing at the base, with a winner's star above.
 * Inherits color via `currentColor`. The same shape is in src/app/icon.svg (the favicon).
 */

// Left branch; the right one is its mirror image. Leaves are pointed (two curves base to tip),
// bigger toward the base, outer ones angled out and inner ones closer to the stem.
const STEM = "M18.4 29.8Q1.2 25.5 7.4 6.8";
const LEAVES =
  "M15.2 28.8Q11.3 27.1 8.8 30.6Q12.8 32.3 15.2 28.8ZM10.6 26.3Q7.6 23.6 4.4 26.1Q7.5 28.8 10.6 26.3ZM7.5 22.8Q5.8 19.4 2.2 20.6Q3.9 24 7.5 22.8ZM6 18.4Q5.6 14.8 2.1 14.7Q2.4 18.2 6 18.4ZM5.9 13.1Q6.6 9.8 3.4 8.7Q2.8 12 5.9 13.1ZM12.5 27.5Q13.1 24.1 9.8 22.8Q9.2 26.2 12.5 27.5ZM8.7 24.5Q10.4 21.6 7.9 19.5Q6.2 22.3 8.7 24.5ZM6.5 20.5Q8.9 18.6 7.5 15.9Q5 17.7 6.5 20.5ZM5.8 15.6Q8.5 14.7 8 11.8Q5.3 12.7 5.8 15.6ZM7.3 7.2Q9.9 5.1 8.4 2.1Q5.8 4.2 7.3 7.2Z";
const STAR = "M16 2.4Q16.6 5.4 19.6 6Q16.6 6.6 16 9.6Q15.4 6.6 12.4 6Q15.4 5.4 16 2.4Z";

function Branch() {
  return (
    <>
      <path d={STEM} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d={LEAVES} />
    </>
  );
}

export function LaurelMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      <Branch />
      <g transform="translate(32 0) scale(-1 1)">
        <Branch />
      </g>
      <path d={STAR} />
    </svg>
  );
}

/** The mark on a glossy accent tile, for the site header. Follows the seasonal accent color. */
export function LaurelTile({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-[10px] bg-linear-to-br from-accent-hover via-accent to-accent-strong text-on-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_3px_10px_-4px_var(--color-accent-strong)] ring-1 ring-black/5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${className}`}
    >
      <LaurelMark className="h-[72%] w-[72%]" />
    </span>
  );
}
