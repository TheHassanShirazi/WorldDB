import DataLoader from "dataloader";
import type { Entry, Relationship } from "@/domain";
import {
  EntryModel,
  RelationshipModel,
  toDomainEntry,
  toDomainRelationship,
} from "./models";

/**
 * Per-request batching.
 *
 * `Entry.connections` is the N+1 this exists to solve. Asking a world for its
 * entries and each entry for its connections would otherwise fire one
 * relationship query per entry, and then one entry query per far endpoint —
 * hundreds of round trips for a query that should take two.
 *
 * Loaders are built fresh for every request. A long-lived loader would cache
 * across users and serve stale data.
 */

export interface Loaders {
  entryById: DataLoader<string, Entry | null>;
  relationshipsByEntry: DataLoader<string, Relationship[]>;
  /** Keyed by entryNameKey(worldId, name). */
  entryByName: DataLoader<string, Entry | null>;
}

/**
 * Name keys are JSON rather than a delimited string.
 *
 * The delimiter approach is a trap here: entry names contain spaces, so a
 * space-separated key parses at the wrong offset and every multi-word name
 * ("Hollowmere Cistern") silently resolves to null. A non-printing delimiter
 * fixes that and introduces a worse problem — an invisible byte in the source
 * that no reviewer can see. JSON has neither failure mode.
 *
 * Mentions are written by name, not id, so resolving one needs a name lookup.
 * Names are unique only *within* a World, so the world has to be part of the
 * key or two worlds would poison each other's cache.
 */
export function entryNameKey(worldId: string, name: string): string {
  return JSON.stringify([worldId, name]);
}

function parseNameKey(key: string): { worldId: string; name: string } {
  const [worldId, name] = JSON.parse(key) as [string, string];
  return { worldId, name };
}

export function createLoaders(): Loaders {
  const entryById = new DataLoader<string, Entry | null>(async (ids) => {
    const docs = await EntryModel.find({ _id: { $in: [...ids] } }).lean();
    const byId = new Map(docs.map((d) => [d._id, toDomainEntry(d)]));
    // DataLoader requires the result array to line up with the keys, including
    // misses — returning a shorter array silently mismatches every entry.
    return ids.map((id) => byId.get(id) ?? null);
  });

  const relationshipsByEntry = new DataLoader<string, Relationship[]>(
    async (entryIds) => {
      const ids = [...entryIds];
      const docs = await RelationshipModel.find({
        $or: [{ from: { $in: ids } }, { to: { $in: ids } }],
      }).lean();

      const grouped = new Map<string, Relationship[]>(ids.map((id) => [id, []]));
      for (const doc of docs) {
        const rel = toDomainRelationship(doc);
        // An edge touching two requested entries belongs to both buckets.
        grouped.get(rel.from)?.push(rel);
        if (rel.to !== rel.from) grouped.get(rel.to)?.push(rel);
      }

      return ids.map((id) => grouped.get(id) ?? []);
    },
  );

  const entryByName = new DataLoader<string, Entry | null>(async (keys) => {
    // One query per distinct world rather than one per mention. In practice
    // that is a single query, since a request rarely spans worlds.
    const namesByWorld = new Map<string, Set<string>>();
    for (const key of keys) {
      const { worldId, name } = parseNameKey(key);
      const names = namesByWorld.get(worldId) ?? new Set<string>();
      names.add(name);
      namesByWorld.set(worldId, names);
    }

    const docs = await EntryModel.find({
      $or: [...namesByWorld].map(([worldId, names]) => ({
        worldId,
        name: { $in: [...names] },
      })),
    }).lean();

    const byKey = new Map(
      docs.map((d) => [entryNameKey(d.worldId, d.name), toDomainEntry(d)]),
    );
    return keys.map((key) => byKey.get(key) ?? null);
  });

  return { entryById, relationshipsByEntry, entryByName };
}
