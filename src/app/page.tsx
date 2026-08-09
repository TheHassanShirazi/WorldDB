import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-8">
      <h1 className="text-2xl font-medium tracking-tight">WorldDB</h1>
      <p className="mt-2 text-sm opacity-60">
        A worldbuilding companion for fiction writers. Nothing is built yet — the
        first question being answered is how navigation should work.
      </p>
      <Link
        href="/prototype/graph"
        className="mt-6 self-start rounded border border-current/20 px-3 py-1.5 text-sm transition hover:bg-current/10"
      >
        Graph navigation prototype →
      </Link>
    </main>
  );
}
