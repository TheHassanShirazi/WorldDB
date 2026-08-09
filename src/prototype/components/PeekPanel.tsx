"use client";

/**
 * PROTOTYPE — the peek.
 *
 * Deliberately shallow, and that discipline is the whole reason the D layout
 * works. A peek that tries to be a complete reading surface duplicates the
 * entry page, and then the two of them fight over the same job and both get
 * worse. This shows enough to decide whether to open the page — no more.
 *
 * If you find yourself wanting to add the full body here, that's the signal
 * that the peek shouldn't exist at all.
 */

import { ENTRY_TYPES, type Connection, type Entry } from "@/domain";

interface Props {
  entry: Entry;
  connections: Connection[];
  onNavigate: (id: string) => void;
  onOpenPage: (id: string) => void;
  onClose: () => void;
}

const TEASER = 150;

export function PeekPanel({ entry, connections, onNavigate, onOpenPage, onClose }: Props) {
  const def = ENTRY_TYPES[entry.type];
  const teaser =
    entry.body.length > TEASER ? `${entry.body.slice(0, TEASER).trimEnd()}…` : entry.body;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start gap-3 border-b border-white/10 px-5 py-4">
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: def.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">
            {def.label}
            {entry.displayDate ? ` · ${entry.displayDate}` : ""}
          </div>
          <h2 className="truncate text-lg font-medium text-white/95">{entry.name}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded px-2 py-1 text-white/40 transition hover:bg-white/10 hover:text-white/80"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm text-white/60">{entry.summary}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/45">{teaser}</p>

        <h3 className="mt-5 mb-1.5 text-[11px] uppercase tracking-[0.14em] text-white/40">
          Connected · {connections.length}
        </h3>
        <ul className="space-y-0.5">
          {connections.map((c) => (
            <li key={c.relationship.id}>
              <button
                onClick={() => onNavigate(c.other.id)}
                className="group flex w-full items-baseline gap-2 rounded px-1.5 py-0.5 text-left transition hover:bg-white/5"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: ENTRY_TYPES[c.other.type].color }}
                />
                <span className="w-24 shrink-0 truncate text-xs text-white/40">{c.label}</span>
                <span className="truncate text-sm text-white/85 group-hover:text-white">
                  {c.other.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <footer className="border-t border-white/10 p-3">
        <button
          onClick={() => onOpenPage(entry.id)}
          className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/12 hover:text-white"
        >
          Open full entry →
        </button>
      </footer>
    </div>
  );
}
