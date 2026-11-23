/** Initial in a circle. */
export function Avatar({ label, title }: { label: string; title?: string }) {
  return (
    <span
      title={title}
      aria-hidden
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-tint text-xs font-semibold text-accent-tint-ink"
    >
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}
