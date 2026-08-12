"use client";

/**
 * The reading surface — the third of ADR-0005's three levels.
 *
 * The graph rail is not decoration: it is the primary navigation *on this
 * page*, so walking the world by relationship stays the default motion even
 * while reading. Without it an entry page is a dead end and the graph quietly
 * becomes ornamental, which would undo the decision it implements.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ENTRY_TYPES, ENTRY_TYPE_LIST, neighbourhood, type EntryTypeId } from "@/domain";
import { useWorld } from "@/lib/use-world";
import { ForceGraph } from "./ForceGraph";
import { Legend } from "./Legend";
import { MentionText } from "./MentionText";

const ALL_TYPES = new Set<EntryTypeId>(ENTRY_TYPE_LIST.map((t) => t.id));

export function EntryReader({ entryId }: { entryId: string }) {
  const router = useRouter();
  const { entries, relationships, apiById, loading, error } = useWorld();

  const entry = apiById.get(entryId);

  const local = useMemo(
    () =>
      entry
        ? neighbourhood(entry.id, entries, relationships, ALL_TYPES)
        : { nodes: [], links: [] },
    [entry, entries, relationships],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof entry extends undefined ? never : NonNullable<typeof entry>["connections"]>();
    for (const c of entry?.connections ?? []) {
      const list = map.get(c.label) ?? [];
      list.push(c);
      map.set(c.label, list);
    }
    return [...map];
  }, [entry]);

  if (loading && !entry) {
    return <Centered>Loading…</Centered>;
  }
  if (error) {
    return <Centered>{error.message}</Centered>;
  }
  if (!entry) {
    return (
      <Centered>
        <p className="text-white/80">No entry called “{entryId}” in this world.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-white/50 underline">
          ← Back to the graph
        </Link>
      </Centered>
    );
  }

  const def = ENTRY_TYPES[entry.type];

  return (
    <div className="grid h-dvh w-full grid-cols-[minmax(0,1fr)_400px] overflow-hidden bg-[#0c0f13]">
      <main className="min-h-0 overflow-y-auto">
        {/* h-14 on this and the rail header, with matching type metrics inside
            both, so the rules line up and so do the baselines. */}
        <div className="sticky top-0 z-10 flex h-14 items-center border-b border-white/10 bg-[#0c0f13]/85 px-10 backdrop-blur">
          <Link
            href="/"
            className="-ml-2 rounded px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-white/45 transition hover:bg-white/10 hover:text-white/85"
          >
            ← Back to the graph
          </Link>
        </div>

        <article className="mx-auto max-w-2xl px-10 py-10">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
            <span className="h-2 w-2 rounded-full" style={{ background: def.color }} />
            {def.label}
            {entry.displayDate ? ` · ${entry.displayDate}` : ""}
          </div>
          <h1 className="mt-1.5 text-3xl font-medium tracking-tight text-white/95">
            {entry.name}
          </h1>
          <p className="mt-2 text-base text-white/55">{entry.summary}</p>

          <div className="mt-6 text-[15px] leading-7 text-white/80">
            <MentionText body={entry.body} mentions={entry.mentions} />
          </div>

          {entry.fields.length > 0 && (
            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm">
              {entry.fields.map((f) => {
                const label = def.fields.find((d) => d.key === f.key)?.label ?? f.key;
                return (
                  <div key={f.key} className="contents">
                    <dt className="text-white/40">{label}</dt>
                    <dd className="text-white/80">{f.value}</dd>
                  </div>
                );
              })}
            </dl>
          )}

          <h2 className="mt-8 mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">
            Relationships · {entry.connections.length}
          </h2>
          <div className="space-y-3">
            {grouped.map(([label, group]) => (
              <div key={label} className="flex gap-3 text-sm">
                <div className="w-36 shrink-0 pt-0.5 text-right text-white/40">{label}</div>
                <ul className="flex-1 space-y-1">
                  {group.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/entry/${c.other.id}`}
                        className="text-white/85 underline decoration-white/20 underline-offset-4 transition hover:decoration-white/60"
                      >
                        {c.other.name}
                      </Link>
                      {c.note && <span className="ml-2 text-xs text-white/35">— {c.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </main>

      <aside className="flex min-h-0 flex-col border-l border-white/10">
        <div className="flex h-14 items-center border-b border-white/10 px-4 text-[11px] uppercase tracking-[0.14em] text-white/45">
          Nearby
        </div>
        <div className="min-h-0 flex-1">
          <ForceGraph
            data={local}
            selectedId={entry.id}
            onSelect={(id) => router.push(`/entry/${id}`)}
            highlightNeighbours={false}
            scale={1.35}
          />
        </div>
        <div className="border-t border-white/10 px-4 py-3">
          <Legend />
          <p className="mt-2.5 text-[11px] text-white/30">Click any node to read it</p>
        </div>
      </aside>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-[#0c0f13] px-8 text-center text-sm text-white/50">
      <div>{children}</div>
    </div>
  );
}
