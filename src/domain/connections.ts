import { RELATIONSHIP_TYPES } from "./relationship-types";
import type { Entry, Relationship } from "./types";

export interface Connection {
  relationship: Relationship;
  /** The Entry at the other end of the edge. */
  other: Entry;
  /** Correct wording from the point of view of the entry you asked about. */
  label: string;
  note?: string;
}

/**
 * Reads every Relationship touching `entryId` from that entry's point of view.
 *
 * This is the payoff of ADR-0001: edges are stored once, and the caller never
 * has to know which direction a given edge happened to be written in.
 */
export function connectionsOf(
  entryId: string,
  relationships: readonly Relationship[],
  entries: readonly Entry[],
): Connection[] {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const out: Connection[] = [];

  for (const relationship of relationships) {
    const standingOnFrom = relationship.from === entryId;
    const otherId = standingOnFrom ? relationship.to : relationship.from;
    if (!standingOnFrom && relationship.to !== entryId) continue;

    const other = byId.get(otherId);
    if (!other) continue;

    const def = RELATIONSHIP_TYPES[relationship.type];
    out.push({
      relationship,
      other,
      label: standingOnFrom ? def.label : def.inverseLabel,
      note: relationship.note,
    });
  }

  // Callers group by label, so a stable order by label then name is part of
  // the contract rather than an accident of relationship insertion order.
  return out.sort(
    (a, b) => a.label.localeCompare(b.label) || a.other.name.localeCompare(b.other.name),
  );
}
