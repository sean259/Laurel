export default function Loading() {
  return (
    <div className="space-y-10 motion-safe:animate-pulse" role="status" aria-label="Loading tournament">
      <div className="h-52 rounded-3xl bg-skeleton" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-3xl bg-skeleton/70" />
        <div className="h-48 rounded-3xl bg-skeleton/70" />
      </div>
      <div className="h-64 rounded-3xl bg-skeleton/60" />
    </div>
  );
}
