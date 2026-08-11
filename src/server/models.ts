import mongoose, { Schema, type Model } from "mongoose";
import type { Entry, Relationship, World } from "@/domain";

/**
 * Storage shapes. These mirror src/domain/types.ts deliberately — the domain
 * types are the contract and Mongoose is an implementation detail behind them.
 *
 * `_id` is a slug string rather than an ObjectId. ADR-0005 makes entries
 * addressable routes, and /entry/sister-lorne is a better URL than
 * /entry/6512ab3f9c1d. It also means the seed can carry stable ids.
 */

type WorldDoc = Omit<World, "id"> & { _id: string };
type EntryDoc = Omit<Entry, "id"> & { _id: string };
type RelationshipDoc = Omit<Relationship, "id"> & { _id: string };

const worldSchema = new Schema<WorldDoc>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
  },
  { versionKey: false },
);

const entrySchema = new Schema<EntryDoc>(
  {
    _id: { type: String, required: true },
    worldId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    summary: { type: String, default: "" },
    body: { type: String, default: "" },
    // Shape is governed by the type registry, not by Mongoose — ADR-0002.
    // Validation happens at the edge via validateEntry, deliberately.
    fields: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number },
    displayDate: { type: String },
  },
  { versionKey: false, minimize: false },
);

// Entry names are unique within a World — it is what makes a Mention
// resolvable (CONTEXT.md). Enforced here as well as in validateEntry so a
// concurrent write cannot slip past the application check.
entrySchema.index({ worldId: 1, name: 1 }, { unique: true });
entrySchema.index({ worldId: 1, type: 1 });

const relationshipSchema = new Schema<RelationshipDoc>(
  {
    _id: { type: String, required: true },
    worldId: { type: String, required: true, index: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    type: { type: String, required: true },
    note: { type: String },
  },
  { versionKey: false },
);

relationshipSchema.index({ worldId: 1, from: 1 });
relationshipSchema.index({ worldId: 1, to: 1 });

/**
 * `mongoose.models.X ?? model(...)` rather than a bare `model(...)`: hot reload
 * re-runs this module, and redefining a compiled model throws OverwriteModelError.
 */
export const WorldModel: Model<WorldDoc> =
  (mongoose.models.World as Model<WorldDoc>) ??
  mongoose.model<WorldDoc>("World", worldSchema);

export const EntryModel: Model<EntryDoc> =
  (mongoose.models.Entry as Model<EntryDoc>) ??
  mongoose.model<EntryDoc>("Entry", entrySchema);

export const RelationshipModel: Model<RelationshipDoc> =
  (mongoose.models.Relationship as Model<RelationshipDoc>) ??
  mongoose.model<RelationshipDoc>("Relationship", relationshipSchema);

/** Documents come back with `_id`; the domain speaks `id`. */
export function toDomainEntry(doc: EntryDoc): Entry {
  return {
    id: doc._id,
    worldId: doc.worldId,
    type: doc.type,
    name: doc.name,
    summary: doc.summary,
    body: doc.body,
    fields: doc.fields ?? {},
    order: doc.order,
    displayDate: doc.displayDate,
  };
}

export function toDomainRelationship(doc: RelationshipDoc): Relationship {
  return {
    id: doc._id,
    worldId: doc.worldId,
    from: doc.from,
    to: doc.to,
    type: doc.type,
    note: doc.note,
  };
}

export function toDomainWorld(doc: WorldDoc): World {
  return { id: doc._id, name: doc.name, tagline: doc.tagline };
}
