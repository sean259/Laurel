import Link from "next/link";

export default function Home() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl font-bold">Run your tournament in minutes</h1>
      <p className="mt-4 text-zinc-600">
        Add participants, pick a format, and share a live bracket.
      </p>
      <Link
        href="/tournaments/new"
        className="mt-8 inline-block rounded bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
      >
        Create a tournament
      </Link>
    </section>
  );
}
