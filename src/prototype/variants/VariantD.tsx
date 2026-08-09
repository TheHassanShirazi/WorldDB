"use client";

/**
 * VARIANT D — "Open Water + Index"
 *
 * The synthesis. Graph-first is unchanged from A: full-bleed canvas, nothing
 * competing with it for the home screen. What B was actually providing gets
 * split into the two separate needs it was really serving:
 *
 *   finding an entry  → ⌘K palette, which costs no screen space at all
 *   reading an entry  → a real addressable page, which the 380px peek is bad at
 *
 * Three zoom levels, one job each: graph (navigate) → peek (glance) → page
 * (read). The peek stays shallow on purpose — see PeekPanel.
 *
 * The URL carries ?entry=, so a page is shareable and browser Back works.
 */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ForceGraph } from "../components/ForceGraph";
import { PeekPanel } from "../components/PeekPanel";
import { EntryPage } from "../components/EntryPage";
import { CommandPalette } from "../components/CommandPalette";
import { TypeFilter } from "../components/TypeFilter";
import { Legend } from "../components/Legend";
import { buildGraph, connectionsOf } from "@/domain";
import { WORLD } from "../fake-world";
import type { VariantProps } from "../variant-props";

export const NAME = "Open Water + Index — graph, peek, page";

export default function VariantD({
  entries,
  relationships,
  byId,
  visibleTypes,
  onToggleType,
  counts,
  selectedId,
  onSelect,
  pageEntryId,
  onOpenPage,
}: VariantProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [centerOn, setCenterOn] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const graph = useMemo(
    () => buildGraph(entries, relationships, visibleTypes),
    [entries, relationships, visibleTypes],
  );
  const selected = selectedId ? byId.get(selectedId) : null;
  const connections = useMemo(
    () => (selectedId ? connectionsOf(selectedId, relationships, entries) : []),
    [selectedId, relationships, entries],
  );

  const page = pageEntryId ? byId.get(pageEntryId) : null;

  // The page is a different surface, not an overlay — the graph is not behind it.
  if (page) {
    return (
      <EntryPage
        entry={page}
        entries={entries}
        relationships={relationships}
        visibleTypes={visibleTypes}
        onOpenPage={(id) => onOpenPage?.(id)}
        onBack={() => onOpenPage?.(null)}
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c0f13]">
      <ForceGraph
        data={graph}
        selectedId={selectedId}
        onSelect={onSelect}
        centerOn={centerOn}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <div className="pointer-events-auto">
          <h1 className="text-xl font-medium tracking-tight text-white/90">{WORLD.name}</h1>
          <p className="mt-0.5 max-w-xs text-xs text-white/40">{WORLD.tagline}</p>
          <TypeFilter
            visible={visibleTypes}
            onToggle={onToggleType}
            counts={counts}
            className="mt-3"
          />
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/55 transition hover:border-white/30 hover:text-white/85"
          >
            Search the world
            <kbd className="rounded border border-white/20 px-1.5 py-0.5 font-sans text-[10px] text-white/45">
              ⌘K
            </kbd>
          </button>
          <div className="text-right text-xs tabular-nums text-white/35">
            {graph.nodes.length} entries · {graph.links.length} relationships
          </div>
        </div>
      </div>

      <Legend className="pointer-events-none absolute bottom-4 left-5 max-w-2xl" />

      <AnimatePresence>
        {selected && (
          <motion.aside
            key="peek"
            initial={{ x: 470, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 470, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 w-[450px] border-l border-white/10 bg-[#12161c]/95 backdrop-blur-md"
          >
            <PeekPanel
              entry={selected}
              connections={connections}
              onNavigate={onSelect}
              onOpenPage={(id) => onOpenPage?.(id)}
              onClose={() => onSelect(null)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <CommandPalette
        open={paletteOpen}
        entries={entries}
        onClose={() => setPaletteOpen(false)}
        onPick={(id) => {
          onSelect(id);
          setCenterOn(id);
        }}
      />
    </div>
  );
}
