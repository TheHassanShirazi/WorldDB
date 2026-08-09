/**
 * Turning a World into nodes and links.
 *
 * Filtering lives here rather than in the renderer because dropping a node
 * without dropping the edges that touch it produces a graph that renders
 * fine and is quietly wrong.
 */

import { ENTRY_TYPES } from "./entry-types";
import { RELATIONSHIP_TYPES } from "./relationship-types";
import type { Entry, EntryTypeId, Relationship, RelationshipTypeId } from "./types";

export interface GraphNode {
  id: string;
  name: string;
  type: EntryTypeId;
  color: string;
  /** Drives node radius. Degree among *visible* edges, not global importance. */
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
  /** Symmetric types read the same both ways, so an arrow would be a lie. */
  directed: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function buildGraph(
  entries: readonly Entry[],
  relationships: readonly Relationship[],
  visibleTypes: ReadonlySet<EntryTypeId>,
): GraphData {
  const visible = entries.filter((e) => visibleTypes.has(e.type));
  const ids = new Set(visible.map((e) => e.id));
  const links = relationships.filter((r) => ids.has(r.from) && ids.has(r.to));

  const degree = new Map<string, number>();
  for (const r of links) {
    degree.set(r.from, (degree.get(r.from) ?? 0) + 1);
    degree.set(r.to, (degree.get(r.to) ?? 0) + 1);
  }

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
