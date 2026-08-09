/** PROTOTYPE — shared graph plumbing for the three variants. */

import {
  ENTRY_TYPES,
  RELATIONSHIP_TYPES,
  readRelationship,
  type Entry,
  type EntryTypeId,
  type Relationship,
  type RelationshipTypeId,
} from "@/domain";

export interface GraphNode {
  id: string;
  name: string;
  type: EntryTypeId;
  color: string;
  /** Drives node radius. Degree, not importance — but they correlate here. */
  val: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relId: string;
  type: RelationshipTypeId;
  color: string;
  directed: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function degreeMap(relationships: Relationship[]): Map<string, number> {
  const d = new Map<string, number>();
  for (const r of relationships) {
    d.set(r.from, (d.get(r.from) ?? 0) + 1);
    d.set(r.to, (d.get(r.to) ?? 0) + 1);
  }
  return d;
}

export function buildGraph(
  entries: Entry[],
  relationships: Relationship[],
  visibleTypes: Set<EntryTypeId>,
): GraphData {
  const visible = entries.filter((e) => visibleTypes.has(e.type));
  const ids = new Set(visible.map((e) => e.id));
  const links = relationships.filter((r) => ids.has(r.from) && ids.has(r.to));
  const degree = degreeMap(links);

  return {
    nodes: visible.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      color: ENTRY_TYPES[e.type].color,
      val: degree.get(e.id) ?? 1,
    })),
    links: links.map((r) => {
      const def = RELATIONSHIP_TYPES[r.type];
      return {
        source: r.from,
        target: r.to,
        relId: r.id,
        type: r.type,
        color: def.color,
        directed: !def.symmetric,
      };
    }),
  };
}

export interface Connection {
  relationship: Relationship;
  /** The Entry at the *other* end. */
  other: Entry;
  /** Correct wording from the point of view of the entry you asked about. */
  label: string;
  note?: string;
}

/**
 * Reads every Relationship touching `entryId` from that entry's point of view.
 * This is the payoff of storing edges once with an inverse label — the caller
 * never has to know which direction it happened to be written in.
 */
export function connectionsOf(
  entryId: string,
  relationships: Relationship[],
  byId: Map<string, Entry>,
): Connection[] {
  const out: Connection[] = [];
  for (const r of relationships) {
    if (r.from === entryId) {
      const other = byId.get(r.to);
      if (other) out.push({ relationship: r, other, label: readRelationship(r.type, "from"), note: r.note });
    } else if (r.to === entryId) {
      const other = byId.get(r.from);
      if (other) out.push({ relationship: r, other, label: readRelationship(r.type, "to"), note: r.note });
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label) || a.other.name.localeCompare(b.other.name));
}

/** Variant C works on a one-hop neighbourhood rather than the whole world. */
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
  const subset = entries.filter((e) => keep.has(e.id) && (e.id === entryId || visibleTypes.has(e.type)));
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
