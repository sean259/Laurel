export default function Loading() {
  return (
    <div role="status" aria-label="Loading tournaments">
      <div className="mb-8 h-20 w-72 max-w-full rounded-2xl bg-skeleton motion-safe:animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-skeleton/70 motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
