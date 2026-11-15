"use client";

import { LaurelMark } from "@/components/LaurelMark";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-24 text-center">
      <LaurelMark className="mx-auto h-12 w-12 text-zinc-300" />
      <h1 className="mt-6 font-display text-4xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-zinc-600">This page hit a snag. Your tournament data is safe.</p>
      <button
        onClick={reset}
        className="mt-8 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Try again
      </button>
    </div>
  );
}
