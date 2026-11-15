import Link from "next/link";
import { LaurelMark } from "@/components/LaurelMark";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <LaurelMark className="mx-auto h-12 w-12 text-amber-500" />
      <h1 className="mt-6 font-display text-4xl font-semibold">Nothing to see here</h1>
      <p className="mt-3 text-zinc-600">This page doesn&apos;t exist, or the tournament was removed.</p>
      <Link
        href="/tournaments"
        className="mt-8 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Browse tournaments
      </Link>
    </div>
  );
}
