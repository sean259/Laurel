export default function Loading() {
  return (
    <div className="animate-pulse space-y-10" aria-busy="true" aria-label="Loading tournament">
      <div className="h-48 rounded-3xl bg-zinc-200" />
      <div className="h-80 rounded-3xl bg-zinc-200/70" />
    </div>
  );
}
