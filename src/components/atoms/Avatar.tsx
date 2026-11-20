/** Initial in a circle. */
export function Avatar({ label, title }: { label: string; title?: string }) {
  return (
    <span
      title={title}
      aria-hidden
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-900"
    >
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
}
