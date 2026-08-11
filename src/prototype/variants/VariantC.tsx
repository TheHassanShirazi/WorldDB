"use client";

/**
 * VARIANT C — "Standing Here"
 *
 * There is no overview. You are always at exactly one entry, its neighbours
 * orbit it, and clicking one moves you there — the graph re-lays out around
 * the new centre. Navigation is a walk, and the trail you walked is the only
 * history you get.
 *
 * The most likely to be either delightful or nauseating, which is exactly why
 * it's in the set. Watch for whether re-layout on every step is disorienting,
 * and whether losing the overview costs you anything you miss.
 */

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ENTRY_TYPES, connectionsOf } from "@/domain";
import { ForceGraph } from "../components/ForceGraph";
import { TypeFilter } from "../components/TypeFilter";

import { neighbourhood } from "../graph-data";
import { WORLD } from "@/fixtures/saltmere";
import type { VariantProps } from "../variant-props";

export const NAME = "Standing Here — one entry at a time";

const DEFAULT_FOCUS = "ossary";

export default function VariantC({
  entries,
  relationships,
  byId,
  visibleTypes,
  onToggleType,
  counts,
  selectedId,
  onSelect,
}: VariantProps) {
  const focusId = selectedId ?? DEFAULT_FOCUS;
  const [trail, setTrail] = useState<string[]>([focusId]);

  function walkTo(id: string) {
    setTrail((t) => (t[t.length - 1] === id ? t : [...t.slice(-7), id]));
    onSelect(id);
  }

  const focus = byId.get(focusId);
  const graph = useMemo(
    () => neighbourhood(focusId, entries, relationships, visibleTypes),
    [focusId, entries, relationships, visibleTypes],
  );
  const connections = useMemo(
    () => connectionsOf(focusId, relationships, entries),
    [focusId, relationships, entries],
  );

  if (!focus) return null;
  const def = ENTRY_TYPES[focus.type];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0c0f13]">
      <header className="flex shrink-0 items-center justify-between gap-6 border-b border-white/10 px-5 py-3">
        <nav className="flex min-w-0 items-center gap-1.5 text-xs">
          <span className="shrink-0 text-white/30">{WORLD.name}</span>
          {trail.map((id, i) => {
            const e = byId.get(id);
            if (!e) return null;
            const last = i === trail.length - 1;
            return (
              <span key={`${id}-${i}`} className="flex min-w-0 items-center gap-1.5">
                <span className="text-white/20">/</span>
                <button
                  onClick={() => walkTo(id)}
                  className={`truncate transition ${
                    last ? "text-white/85" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {e.name}
                </button>
              </span>
            );
          })}
        </nav>
        <TypeFilter visible={visibleTypes} onToggle={onToggleType} counts={counts} />
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_400px]">
        <div className="relative min-h-0">
          <ForceGraph
            data={graph}
            selectedId={focusId}
            onSelect={walkTo}
            highlightNeighbours={false}
            scale={1.6}
          />
          <div className="pointer-events-none absolute bottom-4 left-5 text-[11px] text-white/30">
            {graph.nodes.length - 1} connections from here · click any to walk there
          </div>
        </div>

        <motion.aside
          key={focusId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="min-h-0 overflow-y-auto border-l border-white/10 px-6 py-6"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
            <span className="h-2 w-2 rounded-full" style={{ background: def.color }} />
            {def.label}
            {focus.displayDate ? ` · ${focus.displayDate}` : ""}
          </div>
          <h2 className="mt-1.5 text-2xl font-medium tracking-tight text-white/95">
            {focus.name}
          </h2>
          <p className="mt-1.5 text-sm text-white/55">{focus.summary}</p>
          <p className="mt-4 text-sm leading-6 text-white/75">{focus.body}</p>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-sm">
            {def.fields.map((f) => {
              const v = focus.fields[f.key];
              if (v === undefined || v === "") return null;
              return (
                <div key={f.key} className="contents">
                  <dt className="text-white/40">{f.label}</dt>
                  <dd className="text-white/80">{String(v)}</dd>
                </div>
              );
            })}
          </dl>

          <h3 className="mt-6 mb-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
            Walk to
          </h3>
          <ul className="space-y-0.5">
            {connections.map((c) => (
              <li key={c.relationship.id}>
                <button
                  onClick={() => walkTo(c.other.id)}
                  className="group flex w-full items-baseline gap-2 rounded px-1.5 py-1 text-left transition hover:bg-white/5"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: ENTRY_TYPES[c.other.type].color }}
                  />
                  <span className="w-28 shrink-0 text-xs text-white/40">{c.label}</span>
                  <span className="text-sm text-white/85 group-hover:text-white">
                    {c.other.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </motion.aside>
      </div>
    </div>
  );
}
