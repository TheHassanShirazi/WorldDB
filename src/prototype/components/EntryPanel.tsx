"use client";

/** PROTOTYPE — entry detail, shared by variants A and B. */

import { ENTRY_TYPES, type Connection, type Entry } from "@/domain";

interface Props {
  entry: Entry;
  connections: Connection[];
  onNavigate: (id: string) => void;
  onClose?: () => void;
}

export function EntryPanel({ entry, connections, onNavigate, onClose }: Props) {
  const def = ENTRY_TYPES[entry.type];

  const grouped = connections.reduce<Record<string, Connection[]>>((acc, c) => {
    (acc[c.label] ??= []).push(c);
    return acc;
  }, {});

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
          <p className="mt-0.5 text-sm text-white/55">{entry.summary}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 py-1 text-white/40 transition hover:bg-white/10 hover:text-white/80"
          >
            ✕
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm leading-relaxed text-white/75">{entry.body}</p>

        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
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

        <h3 className="mt-6 mb-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
          Relationships · {connections.length}
        </h3>
        <div className="space-y-3">
          {Object.entries(grouped).map(([label, group]) => (
            <div key={label}>
              <div className="text-xs text-white/45">{label}</div>
              <ul className="mt-1 space-y-0.5">
                {group.map((c) => (
                  <li key={c.relationship.id}>
                    <button
                      onClick={() => onNavigate(c.other.id)}
                      className="group flex w-full items-baseline gap-2 rounded px-1.5 py-0.5 text-left transition hover:bg-white/5"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: ENTRY_TYPES[c.other.type].color }}
                      />
                      <span className="text-sm text-white/85 group-hover:text-white">
                        {c.other.name}
                      </span>
                      {c.note && (
                        <span className="truncate text-xs text-white/35">— {c.note}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
