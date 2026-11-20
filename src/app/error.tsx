"use client";

import { Button } from "@/components/atoms/Button";
import { LaurelMark } from "@/components/atoms/LaurelMark";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="py-24 text-center">
      <LaurelMark className="mx-auto h-12 w-12 text-zinc-400" />
      <h1 className="mt-6 font-display text-4xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-muted">This page hit a snag. Your tournament data is safe.</p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </div>
  );
}
