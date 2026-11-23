import { ButtonLink } from "@/components/atoms/Button";
import { LaurelMark } from "@/components/atoms/LaurelMark";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <LaurelMark className="mx-auto h-12 w-12 text-accent-strong" />
      <h1 className="mt-6 font-display text-4xl font-semibold text-ink">Nothing to see here</h1>
      <p className="mt-3 text-muted">This page doesn&apos;t exist, or the tournament was removed.</p>
      <ButtonLink href="/tournaments" className="mt-8">
        Browse tournaments
      </ButtonLink>
    </div>
  );
}
