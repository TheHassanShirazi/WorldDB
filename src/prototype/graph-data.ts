/**
 * PROTOTYPE — the view-shaped helpers that have not yet earned a domain home.
 *
 * `buildGraph` and the graph types now live in `@/domain/graph`. What is left
 * here is `neighbourhood` (the one-hop view used by the rail) and
 * `searchEntries` (which backs ⌘K). Both are real features rather than
 * scaffolding, so they are candidates to graduate next — they were simply not
 * part of the agreed seam list for day 2.
 */

import { buildGraph, type GraphData } from "@/domain";
import type { Entry, EntryTypeId, Relationship } from "@/domain";

/** Variant C and the entry-page rail work on a one-hop neighbourhood. */
export function neighbourhood(
  entryId: string,
  entries: Entry[],
  relationships: Relationship[],
  visibleTypes: Set<EntryTypeId>,
): GraphData {
  const keep = new Set<string>([entryId]);
  for (const r of relationships) {
    if (r.from === entryId) keep.add(r.to);
    if (r.to === entryId) keep.add(r.from);
  }
  const subset = entries.filter(
    (e) => keep.has(e.id) && (e.id === entryId || visibleTypes.has(e.type)),
  );
  const ids = new Set(subset.map((e) => e.id));
  const subRels = relationships.filter(
    (r) => ids.has(r.from) && ids.has(r.to) && (r.from === entryId || r.to === entryId),
  );
  return buildGraph(subset, subRels, new Set(subset.map((e) => e.type)));
}

export function searchEntries(entries: Entry[], query: string): Entry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q),
  );
}
