"use client";

/**
 * VARIANT B — "The Index"
 *
 * The honest fallback: this is a wiki that happens to have a graph. A
 * persistent searchable list owns the left, the entry's prose owns the middle,
 * and the graph is demoted to a narrow rail showing only the local
 * neighbourhood.
 *
 * Included deliberately. If this one feels better to actually use, graph-first
 * has lost and the graph becomes a tab — which is a cheap thing to learn now
 * and an expensive thing to learn in day five.
 */

import { useMemo, useState } from "react";
import { ENTRY_TYPES, ENTRY_TYPE_LIST, connectionsOf, type Entry } from "@/domain";
import { ForceGraph } from "../components/ForceGraph";
import { TypeFilter } from "../components/TypeFilter";

import { neighbourhood, searchEntries } from "../graph-data";
import { WORLD } from "@/fixtures/saltmere";
import type { VariantProps } from "../variant-props";

export const NAME = "The Index — wiki-first, graph demoted";

export default function VariantB({
  entries,
  relationships,
  byId,
  visibleTypes,
  onToggleType,
  counts,
  selectedId,
  onSelect,
}: VariantProps) {
  const [query, setQuery] = useState("");

  const listed = useMemo(
    () => searchEntries(entries.filter((e) => visibleTypes.has(e.type)), query),
    [entries, visibleTypes, query],
  );

  const grouped = useMemo(() => {
    const g = new Map<string, Entry[]>();
    for (const e of listed) {
      const arr = g.get(e.type) ?? [];
      arr.push(e);
      g.set(e.type, arr);
    }
    for (const arr of g.values()) {
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    }
    return g;
  }, [listed]);

  const selected = selectedId ? byId.get(selectedId) : null;
  const connections = useMemo(
    () => (selectedId ? connectionsOf(selectedId, relationships, entries) : []),
    [selectedId, relationships, entries],
  );
  const localGraph = useMemo(
    () =>
      selectedId
        ? neighbourhood(selectedId, entries, relationships, visibleTypes)
        : { nodes: [], links: [] },
    [selectedId, entries, relationships, visibleTypes],
  );

  return (
    <div className="grid h-full w-full grid-cols-[300px_minmax(0,1fr)_360px] overflow-hidden bg-[#0c0f13]">
      {/* Left — the index. Always present, always searchable. */}
      <aside className="flex min-h-0 flex-col border-r border-white/10">
        <div className="border-b border-white/10 px-4 py-4">
          <h1 className="text-base font-medium text-white/90">{WORLD.name}</h1>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries…"
            className="mt-3 w-full rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/35"
          />
          <TypeFilter
            visible={visibleTypes}
            onToggle={onToggleType}
            counts={counts}
            className="mt-3"
          />
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          {ENTRY_TYPE_LIST.map((t) => {
            const items = grouped.get(t.id);
            if (!items?.length) return null;
            return (
              <div key={t.id} className="mb-4">
                <div className="px-2 pb-1 text-[11px] uppercase tracking-[0.14em] text-white/35">
                  {t.plural}
                </div>
                {items.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e.id)}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm transition ${
                      e.id === selectedId
                        ? "bg-white/12 text-white"
                        : "text-white/65 hover:bg-white/5 hover:text-white/90"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span className="truncate">{e.name}</span>
                  </button>
                ))}
              </div>
            );
          })}
          {!listed.length && (
            <p className="px-2 py-6 text-sm text-white/35">Nothing matches “{query}”.</p>
          )}
        </nav>
      </aside>

      {/* Middle — reading. Prose is the primary object here, not the graph. */}
      <main className="min-h-0 overflow-y-auto">
        {selected ? (
          <article className="mx-auto max-w-2xl px-10 py-10">
            <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">
              {ENTRY_TYPES[selected.type].label}
              {selected.displayDate ? ` · ${selected.displayDate}` : ""}
            </div>
            <h2 className="mt-1 text-3xl font-medium tracking-tight text-white/95">
              {selected.name}
            </h2>
            <p className="mt-2 text-base text-white/55">{selected.summary}</p>
            <p className="mt-6 text-[15px] leading-7 text-white/80">{selected.body}</p>

            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm">
              {ENTRY_TYPES[selected.type].fields.map((f) => {
                const v = selected.fields[f.key];
                if (v === undefined || v === "") return null;
                return (
                  <div key={f.key} className="contents">
                    <dt className="text-white/40">{f.label}</dt>
                    <dd className="text-white/80">{String(v)}</dd>
                  </div>
                );
              })}
            </dl>

            <h3 className="mt-8 mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">
              Relationships · {connections.length}
            </h3>
            <ul className="space-y-1">
              {connections.map((c) => (
                <li key={c.relationship.id} className="flex items-baseline gap-2 text-sm">
                  <span className="w-36 shrink-0 text-right text-white/40">{c.label}</span>
                  <button
                    onClick={() => onSelect(c.other.id)}
                    className="text-white/85 underline decoration-white/20 underline-offset-4 transition hover:decoration-white/60"
                  >
                    {c.other.name}
                  </button>
                  {c.note && <span className="text-xs text-white/35">— {c.note}</span>}
                </li>
              ))}
            </ul>
          </article>
        ) : (
          <div className="flex h-full items-center justify-center px-10 text-center">
            <div>
              <h2 className="text-2xl font-medium text-white/80">{WORLD.name}</h2>
              <p className="mt-2 max-w-sm text-sm text-white/45">{WORLD.tagline}</p>
              <p className="mt-6 text-xs text-white/30">
                Pick something from the index to begin reading.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Right — the graph, demoted to a rail. */}
      <aside className="flex min-h-0 flex-col border-l border-white/10">
        <div className="border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-white/40">
          {selected ? "Nearby" : "Graph"}
        </div>
        <div className="min-h-0 flex-1">
          {selected ? (
            <ForceGraph
              data={localGraph}
              selectedId={selectedId}
              onSelect={onSelect}
              highlightNeighbours={false}
              scale={1.3}
            />
          ) : (
            <p className="px-4 py-6 text-xs text-white/30">
              Select an entry to see its immediate neighbourhood.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
