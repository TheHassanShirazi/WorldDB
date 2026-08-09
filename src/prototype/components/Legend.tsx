"use client";

/**
 * PROTOTYPE — relationship legend.
 *
 * Worth watching during evaluation: nine types is already close to the point
 * where a colour legend stops being readable at a glance. If this feels like
 * too much here, the registry is too big.
 */

import { RELATIONSHIP_TYPE_LIST } from "@/domain";

export function Legend({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1.5 text-[16px] text-white/45 ${className}`}>
      {RELATIONSHIP_TYPE_LIST.map((t) => (
        // shrink-0 on both: without it the swatch is the first thing flexbox
        // collapses in a narrow rail, leaving coloured lines with zero width.
        <span key={t.id} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span
            className="h-0.5 w-5 shrink-0 rounded-full"
            style={{ background: t.color }}
          />
          {t.label}
          {!t.symmetric && <span className="text-white/25">→</span>}
        </span>
      ))}
    </div>
  );
}
