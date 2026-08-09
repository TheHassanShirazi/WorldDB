"use client";

/**
 * PROTOTYPE — the reading surface.
 *
 * Variant B's middle column, promoted to its own addressable view. The graph
 * rail on the right is not decoration: it is the primary navigation *on this
 * page*, so walking the world by relationship stays the default motion even
 * while you're reading. Without it, the entry page quietly becomes a dead end
 * and the graph turns ornamental.
 */

import { motion } from "motion/react";
import { useMemo } from "react";
import { ENTRY_TYPES, type Entry, type EntryTypeId, type Relationship } from "@/domain";
import { ForceGraph } from "./ForceGraph";
import { Legend } from "./Legend";
import { connectionsOf, neighbourhood } from "../graph-data";

interface Props {
  entry: Entry;
  entries: Entry[];
  relationships: Relationship[];
  byId: Map<string, Entry>;
  visibleTypes: Set<EntryTypeId>;
  onOpenPage: (id: string) => void;
  onBack: () => void;
}

export function EntryPage({
  entry,
  entries,
  relationships,
  byId,
  visibleTypes,
  onOpenPage,
  onBack,
}: Props) {
  const def = ENTRY_TYPES[entry.type];
  const connections = useMemo(
    () => connectionsOf(entry.id, relationships, byId),
    [entry.id, relationships, byId],
  );
  const local = useMemo(
    () => neighbourhood(entry.id, entries, relationships, visibleTypes),
    [entry.id, entries, relationships, visibleTypes],
  );

  const grouped = connections.reduce<Record<string, typeof connections>>((acc, c) => {
    (acc[c.label] ??= []).push(c);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16 }}
      className="grid h-full w-full grid-cols-[minmax(0,1fr)_400px] overflow-hidden bg-[#0c0f13]"
    >
      <main className="min-h-0 overflow-y-auto">
        {/*
          h-14 on this and the rail header, and identical type metrics inside
          both, so the rules line up *and* the baselines do. Matching the
          container height alone is not enough when one side holds a padded
          button and the other holds bare text.
        */}
        <div className="sticky top-0 z-10 flex h-14 items-center border-b border-white/10 bg-[#0c0f13]/85 px-10 backdrop-blur">
          <button
            onClick={onBack}
            className="-ml-2 rounded px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-white/45 transition hover:bg-white/10 hover:text-white/85"
          >
            ← Back to the graph
          </button>
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
          <p className="mt-6 text-[15px] leading-7 text-white/80">{entry.body}</p>

          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm">
            {def.fields.map((f) => {
              const v = entry.fields[f.key];
              if (v === undefined || v === "") return null;
              return (
                <div key={f.key} className="contents">
                  <dt className="text-white/40">{f.label}</dt>
                  <dd className="text-white/80">{String(v)}</dd>
                </div>
              );
            })}
          </dl>

          <h2 className="mt-8 mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">
            Relationships · {connections.length}
          </h2>
          <div className="space-y-3">
            {Object.entries(grouped).map(([label, group]) => (
              <div key={label} className="flex gap-3 text-sm">
                <div className="w-36 shrink-0 pt-0.5 text-right text-white/40">{label}</div>
                <ul className="flex-1 space-y-1">
                  {group.map((c) => (
                    <li key={c.relationship.id}>
                      <button
                        onClick={() => onOpenPage(c.other.id)}
                        className="text-white/85 underline decoration-white/20 underline-offset-4 transition hover:decoration-white/60"
                      >
                        {c.other.name}
                      </button>
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
            onSelect={onOpenPage}
            highlightNeighbours={false}
            scale={1.35}
          />
        </div>
        <div className="border-t border-white/10 px-4 py-3">
          <Legend />
          <p className="mt-2.5 text-[11px] text-white/30">Click any node to read it</p>
        </div>
      </aside>
    </motion.div>
  );
}
