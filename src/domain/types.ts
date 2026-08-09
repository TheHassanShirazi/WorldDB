/**
 * Core domain types. See CONTEXT.md for what these words mean.
 *
 * These are storage-shaped, not GraphQL-shaped — the GraphQL schema is
 * generated from the registries in `entry-types.ts` and `relationship-types.ts`
 * (see docs/adr/0002-entry-schemas-in-a-typescript-registry.md).
 */

export type EntryTypeId =
  | "character"
  | "location"
  | "faction"
  | "magic-system"
  | "event";

export type FieldKind = "text" | "longtext" | "number" | "select";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** Only meaningful when `kind` is "select". */
  options?: readonly string[];
}

export interface EntryTypeDef {
  id: EntryTypeId;
  label: string;
  plural: string;
  /** Concrete colour — the graph renders to canvas, so Tailwind classes are no use here. */
  color: string;
  fields: readonly FieldDef[];
}

export interface Entry {
  id: string;
  worldId: string;
  type: EntryTypeId;
  name: string;
  /** One line, shown in the graph tooltip and as the panel subtitle. */
  summary: string;
  /** Markdown. `[[Entry Name]]` renders as a link but never creates a Relationship. */
  body: string;
  /** Shape is governed by the Entry Type's `fields`, validated at the edge. */
  fields: Record<string, string | number>;
  /**
   * Events only. Position in this World's history relative to other Events.
   * Carries no units — see docs/adr/0003-in-world-time-is-order-and-display-date.md
   */
  order?: number;
  /** Events only. Shown verbatim, never parsed. */
  displayDate?: string;
}

export type RelationshipTypeId =
  | "parent-of"
  | "sibling-of"
  | "member-of"
  | "controls"
  | "allied-with"
  | "enemy-of"
  | "located-in"
  | "practices"
  | "involved-in";

export interface RelationshipTypeDef {
  id: RelationshipTypeId;
  /** How it reads travelling from → to. */
  label: string;
  /** How it reads travelling to → from. Equal to `label` when symmetric. */
  inverseLabel: string;
  symmetric?: boolean;
  color: string;
  /** Entry Types this may connect. Advisory in the prototype, enforced later. */
  from: readonly EntryTypeId[];
  to: readonly EntryTypeId[];
}

/**
 * Stored once, never twice. Which end you are standing on decides whether you
 * read `label` or `inverseLabel` — see docs/adr/0001-relationships-are-first-class.md
 */
export interface Relationship {
  id: string;
  worldId: string;
  from: string;
  to: string;
  type: RelationshipTypeId;
  note?: string;
}

export interface World {
  id: string;
  name: string;
  tagline: string;
}
