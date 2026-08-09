"use client";

/**
 * VARIANT A — "Open Water"
 *
 * The graph IS the page. Full-bleed canvas, everything else floats on top of
 * it. Selecting an entry slides a panel in over the canvas; the graph stays
 * visible and dims everything that isn't adjacent.
 *
 * The bet: an overview you can see all of is worth more than a list you can
 * search. Watch whether you can actually find a named entry without a search box.
 */

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { ForceGraph } from "../components/ForceGraph";
import { EntryPanel } from "../components/EntryPanel";
import { TypeFilter } from "../components/TypeFilter";
import { Legend } from "../components/Legend";
import { buildGraph, connectionsOf } from "../graph-data";
import { WORLD } from "../fake-world";
import type { VariantProps } from "../variant-props";

export const NAME = "Open Water — full-bleed graph";

export default function VariantA({
  entries,
  relationships,
  byId,
  visibleTypes,
  onToggleType,
  counts,
  selectedId,
  onSelect,
}: VariantProps) {
  const graph = useMemo(
    () => buildGraph(entries, relationships, visibleTypes),
    [entries, relationships, visibleTypes],
  );
  const selected = selectedId ? byId.get(selectedId) : null;
  const connections = useMemo(
    () => (selectedId ? connectionsOf(selectedId, relationships, byId) : []),
    [selectedId, relationships, byId],
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c0f13]">
      <ForceGraph data={graph} selectedId={selectedId} onSelect={onSelect} />

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
        <div className="pointer-events-auto text-right text-xs tabular-nums text-white/35">
          {graph.nodes.length} entries · {graph.links.length} relationships
        </div>
      </div>

      <Legend className="pointer-events-none absolute bottom-4 left-5 max-w-2xl" />

      <AnimatePresence>
        {selected && (
          <motion.aside
            key="panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 w-[380px] border-l border-white/10 bg-[#12161c]/95 backdrop-blur-md"
          >
            <EntryPanel
              entry={selected}
              connections={connections}
              onNavigate={onSelect}
              onClose={() => onSelect(null)}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
