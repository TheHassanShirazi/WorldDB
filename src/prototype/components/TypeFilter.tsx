"use client";

/**
 * PROTOTYPE — type filtering.
 *
 * Present in every variant on purpose: filtering is what keeps a force layout
 * legible, so a variant judged without it would be judged unfairly.
 */

import { ENTRY_TYPE_LIST, type EntryTypeId } from "@/domain";

interface Props {
  visible: Set<EntryTypeId>;
  onToggle: (id: EntryTypeId) => void;
  counts: Record<string, number>;
  className?: string;
}

export function TypeFilter({ visible, onToggle, counts, className = "" }: Props) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {ENTRY_TYPE_LIST.map((t) => {
        const on = visible.has(t.id);
        return (
          <button
            key={t.id}
            onClick={() => onToggle(t.id)}
            aria-pressed={on}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
              on
                ? "border-white/20 bg-white/10 text-white/90"
                : "border-white/10 bg-transparent text-white/35 hover:text-white/60"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full transition"
              style={{ background: t.color, opacity: on ? 1 : 0.3 }}
            />
            {t.plural}
            <span className="tabular-nums text-white/35">{counts[t.id] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
