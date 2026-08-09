/**
 * Deleting an Entry destroys every Relationship touching it (ADR-0001).
 *
 * This answers "what would be destroyed", which is the interesting half. It
 * powers both the cascade itself and the confirmation that tells the writer
 * how much they are about to lose — the actual removal is one deleteMany.
 */

import type { Relationship } from "./types";

/** Every Relationship with this entry at either end. */
export function relationshipsTouching(
  entryId: string,
  relationships: readonly Relationship[],
): Relationship[] {
  return relationships.filter((r) => r.from === entryId || r.to === entryId);
}
