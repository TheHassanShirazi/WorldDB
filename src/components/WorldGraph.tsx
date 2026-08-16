"use client";

/**
 * The home surface. The graph is the page, not a view inside it (ADR-0005).
 *
 * What the wiki-first prototype provided splits into two things that cost no
 * permanent screen space: ⌘K for finding an entry, and a real route for
 * reading one.
 */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ENTRY_TYPE_LIST, buildGraph, type EntryTypeId } from "@/domain";
import { useWorld } from "@/lib/use-world";
import { ForceGraph } from "./ForceGraph";
import { TypeFilter } from "./TypeFilter";
import { Legend } from "./Legend";
import { CommandPalette } from "./CommandPalette";
import { EntryPeek } from "./EntryPeek";

export function WorldGraph() {
  const router = useRouter();
  const { world, entries, relationships, apiById, loading, error } = useWorld();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [centerOn, setCenterOn] = useState<string | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<EntryTypeId>>(
    () => new Set(ENTRY_TYPE_LIST.map((t) => t.id)),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const graph = useMemo(
    () => buildGraph(entries, relationships, visibleTypes),
    [entries, relationships, visibleTypes],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of entries) c[e.type] = (c[e.type] ?? 0) + 1;
    return c;
  }, [entries]);

  const toggleType = (id: EntryTypeId) =>
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      // Never let the last type be switched off — an empty graph reads as a bug.
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const selected = selectedId ? apiById.get(selectedId) : undefined;

  if (error) {
    return (
      <Centered>
        <h1 className="text-lg text-white/85">Could not load the world.</h1>
        <p className="mt-2 max-w-md text-sm text-white/45">{error.message}</p>
        <p className="mt-4 text-xs text-white/30">
          Is the database seeded? <code className="text-white/50">npm run seed</code>
        </p>
      </Centered>
    );
  }

  if (loading && !world) {
    return (
      <Centered>
        <p className="text-sm text-white/40">Drawing the world…</p>
      </Centered>
    );
  }

  if (!world) {
    return (
      <Centered>
        <h1 className="text-lg text-white/85">No world here yet.</h1>
        <p className="mt-2 text-sm text-white/45">
          Run <code className="text-white/70">npm run seed</code> to load one.
        </p>
      </Centered>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0c0f13]">
      <ForceGraph
        data={graph}
        selectedId={selectedId}
        onSelect={setSelectedId}
        centerOn={centerOn}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <div className="pointer-events-auto">
          <h1 className="text-xl font-medium tracking-tight text-white/90">{world.name}</h1>
          <p className="mt-0.5 max-w-xs text-xs text-white/40">{world.tagline}</p>
          <TypeFilter
            visible={visibleTypes}
            onToggle={toggleType}
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
            <EntryPeek
              entry={selected}
              onNavigate={setSelectedId}
              onClose={() => setSelectedId(null)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <CommandPalette
        open={paletteOpen}
        entries={entries}
        onClose={() => setPaletteOpen(false)}
        onPick={(id) => {
          setSelectedId(id);
          setCenterOn(id);
        }}
        onOpen={(id) => router.push(`/entry/${id}`)}
      />
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-[#0c0f13] px-8 text-center">
      <div>{children}</div>
    </div>
  );
}
