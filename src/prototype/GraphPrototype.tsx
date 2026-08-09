"use client";

/**
 * PROTOTYPE HOST — owns the state every variant shares, so the variants
 * disagree about layout and nothing else.
 */

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { EntryTypeId } from "@/domain";
import { ENTRY_TYPE_LIST } from "@/domain";
import { ENTRIES, RELATIONSHIPS, ENTRIES_BY_ID } from "./fake-world";
import { VARIANT_KEYS, type VariantKey } from "./variant-keys";
import { PrototypeSwitcher } from "./PrototypeSwitcher";
import VariantA, { NAME as NAME_A } from "./variants/VariantA";
import VariantB, { NAME as NAME_B } from "./variants/VariantB";
import VariantC, { NAME as NAME_C } from "./variants/VariantC";
import VariantD, { NAME as NAME_D } from "./variants/VariantD";

const VARIANTS = {
  A: { Component: VariantA, name: NAME_A },
  B: { Component: VariantB, name: NAME_B },
  C: { Component: VariantC, name: NAME_C },
  D: { Component: VariantD, name: NAME_D },
} as const;

export function GraphPrototype({
  variant,
  pageEntryId = null,
}: {
  variant: VariantKey;
  pageEntryId?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<EntryTypeId>>(
    () => new Set(ENTRY_TYPE_LIST.map((t) => t.id)),
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of ENTRIES) c[e.type] = (c[e.type] ?? 0) + 1;
    return c;
  }, []);

  const onToggleType = (id: EntryTypeId) =>
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Never let the last type be switched off — an empty graph reads as a bug.
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  // The page lives in the URL rather than in state, so it is shareable and
  // browser Back walks the reading history. push, not replace, for that reason.
  const openPage = (id: string | null) => {
    const qs = new URLSearchParams({ variant });
    if (id) qs.set("entry", id);
    router.push(`${pathname}?${qs.toString()}`, { scroll: false });
  };

  const { Component, name } = VARIANTS[variant];

  return (
    <div className="h-dvh w-full">
      <Component
        entries={ENTRIES}
        relationships={RELATIONSHIPS}
        byId={ENTRIES_BY_ID}
        visibleTypes={visibleTypes}
        onToggleType={onToggleType}
        counts={counts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        pageEntryId={pageEntryId}
        onOpenPage={openPage}
      />
      <PrototypeSwitcher variants={VARIANT_KEYS} current={variant} name={name} />
    </div>
  );
}
