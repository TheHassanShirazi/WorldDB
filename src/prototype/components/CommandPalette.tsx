"use client";

/**
 * PROTOTYPE — ⌘K entry search.
 *
 * This is what replaces variant B's persistent index. Finding an entry by name
 * is a *search* problem, and a permanent sidebar is an expensive way to buy it —
 * it costs the full-bleed canvas that made the graph worth choosing.
 *
 * The body mounts only while open, so query and selection reset by virtue of
 * mounting rather than by an effect that resets them.
 */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ENTRY_TYPES, type Entry } from "@/domain";
import { searchEntries } from "../graph-data";

interface Props {
  open: boolean;
  entries: Entry[];
  onClose: () => void;
  onPick: (id: string) => void;
}

export function CommandPalette({ open, entries, onClose, onPick }: Props) {
  return (
    <AnimatePresence>
      {open && <PaletteBody entries={entries} onClose={onClose} onPick={onPick} />}
    </AnimatePresence>
  );
}

function PaletteBody({ entries, onClose, onPick }: Omit<Props, "open">) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(
    () => searchEntries(entries, query).slice(0, 40),
    [entries, query],
  );

  // Keeps the highlighted row in view. Touches the DOM, sets no state.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (id: string) => {
    onPick(id);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[active];
      if (pick) choose(pick.id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-start justify-center bg-black/50 px-4 pt-[14vh] backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-white/15 bg-[#14181f] shadow-2xl"
        initial={{ opacity: 0, y: -8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.985 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search the world…"
          className="w-full border-b border-white/10 bg-transparent px-4 py-3.5 text-[15px] text-white/90 outline-none placeholder:text-white/30"
        />
        <ul ref={listRef} className="max-h-[46vh] overflow-y-auto py-1.5">
          {results.map((e, i) => {
            const def = ENTRY_TYPES[e.type];
            return (
              <li key={e.id} data-index={i}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(e.id)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left transition ${
                    i === active ? "bg-white/10" : ""
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: def.color }}
                  />
                  <span className="shrink-0 text-sm text-white/90">{e.name}</span>
                  <span className="truncate text-xs text-white/35">{e.summary}</span>
                  <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wider text-white/25">
                    {def.label}
                  </span>
                </button>
              </li>
            );
          })}
          {!results.length && (
            <li className="px-4 py-6 text-sm text-white/35">
              Nothing in this world matches “{query}”.
            </li>
          )}
        </ul>
        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-2 text-[10px] text-white/30">
          <span>↑↓ move</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span className="ml-auto tabular-nums">{results.length} results</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
