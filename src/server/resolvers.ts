import {
  ENTRY_TYPES,
  connectionsOf,
  mentionsIn,
  timeline,
  type Entry,
  type EntryTypeId,
} from "@/domain";
import { EntryModel, WorldModel, toDomainEntry, toDomainWorld } from "./models";
import { graphqlTypeName } from "./schema";
import { entryNameKey, type Loaders } from "./loaders";

export interface Context {
  loaders: Loaders;
}

/**
 * Resolvers deliberately delegate to src/domain rather than reimplementing
 * anything. Inverse labels, mention resolution and event ordering are already
 * specified by tests there; duplicating that logic here would give the API a
 * second, untested version of the same rules.
 */
export const resolvers = {
  Query: {
    worlds: async () => (await WorldModel.find().lean()).map(toDomainWorld),

    world: async (_: unknown, { id }: { id: string }) => {
      const doc = await WorldModel.findById(id).lean();
      return doc ? toDomainWorld(doc) : null;
    },

    entry: async (
      _: unknown,
      { worldId, id }: { worldId: string; id: string },
      ctx: Context,
    ) => {
      const entry = await ctx.loaders.entryById.load(id);
      return entry && entry.worldId === worldId ? entry : null;
    },

    timeline: async (_: unknown, { worldId }: { worldId: string }) => {
      const docs = await EntryModel.find({ worldId, type: "event" }).lean();
      return timeline(docs.map(toDomainEntry));
    },
  },

  World: {
    entries: async (world: { id: string }) => {
      const docs = await EntryModel.find({ worldId: world.id }).lean();
      return docs.map(toDomainEntry);
    },
  },

  Entry: {
    // Tells GraphQL which concrete type a given Entry is, so `... on Character`
    // works. Generated from the same registry as the schema.
    __resolveType: (entry: Entry) => graphqlTypeName(entry.type as EntryTypeId),
  },

  Connection: {
    other: (connection: { other: Entry }) => connection.other,
  },
};

/**
 * Every concrete entry type shares these resolvers. The type-specific fields
 * are read straight off `fields`, which is why adding a registry field needs
 * no resolver work at all.
 */
function entryFieldResolvers(typeId: EntryTypeId) {
  const def = ENTRY_TYPES[typeId];

  const own = Object.fromEntries(
    def.fields.map((field) => [
      field.key,
      (entry: Entry) => entry.fields?.[field.key] ?? null,
    ]),
  );

  return {
    ...own,

    fields: (entry: Entry) =>
      def.fields
        .filter((f) => entry.fields?.[f.key] !== undefined && entry.fields[f.key] !== "")
        .map((f) => ({ key: f.key, value: String(entry.fields[f.key]) })),

    connections: async (entry: Entry, _args: unknown, ctx: Context) => {
      const relationships = await ctx.loaders.relationshipsByEntry.load(entry.id);

      // Both endpoints of every edge, fetched in one batched round trip.
      const otherIds = relationships.map((r) =>
        r.from === entry.id ? r.to : r.from,
      );
      const others = (await ctx.loaders.entryById.loadMany(otherIds)).filter(
        (e): e is Entry => e !== null && !(e instanceof Error),
      );

      return connectionsOf(entry.id, relationships, [entry, ...others]).map((c) => ({
        id: c.relationship.id,
        label: c.label,
        note: c.note ?? null,
        other: c.other,
      }));
    },

    mentions: async (entry: Entry, _args: unknown, ctx: Context) => {
      const names = mentionsIn(entry.body, []).map((m) => m.name);
      if (names.length === 0) return [];

      // Batched by name across every entry in the request — resolving this
      // per entry would reintroduce the N+1 everything else here avoids.
      const resolved = await ctx.loaders.entryByName.loadMany(
        names.map((name) => entryNameKey(entry.worldId, name)),
      );

      return names.map((name, i) => {
        const hit = resolved[i];
        return { name, entry: hit instanceof Error ? null : hit };
      });
    },
  };
}

for (const typeId of Object.keys(ENTRY_TYPES) as EntryTypeId[]) {
  (resolvers as Record<string, unknown>)[graphqlTypeName(typeId)] =
    entryFieldResolvers(typeId);
}
