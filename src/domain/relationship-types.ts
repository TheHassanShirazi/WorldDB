import type { RelationshipTypeDef, RelationshipTypeId } from "./types";

/**
 * Fixed vocabulary, deliberately small — an unbounded set of labels makes the
 * graph legend useless. Each type declares how it reads from both ends, so a
 * Relationship is stored exactly once and never has to be kept in sync.
 */
export const RELATIONSHIP_TYPES: Record<RelationshipTypeId, RelationshipTypeDef> = {
  "parent-of": {
    id: "parent-of",
    label: "parent of",
    inverseLabel: "child of",
    color: "#d98cc0",
    from: ["character"],
    to: ["character"],
  },
  "sibling-of": {
    id: "sibling-of",
    label: "sibling of",
    inverseLabel: "sibling of",
    symmetric: true,
    color: "#d98cc0",
    from: ["character"],
    to: ["character"],
  },
  "member-of": {
    id: "member-of",
    label: "member of",
    inverseLabel: "counts as a member",
    color: "#8d9bb5",
    from: ["character"],
    to: ["faction"],
  },
  controls: {
    id: "controls",
    label: "controls",
    inverseLabel: "controlled by",
    color: "#e0603e",
    from: ["faction"],
    to: ["location"],
  },
  "allied-with": {
    id: "allied-with",
    label: "allied with",
    inverseLabel: "allied with",
    symmetric: true,
    color: "#4bbd8b",
    from: ["faction", "character"],
    to: ["faction", "character"],
  },
  "enemy-of": {
    id: "enemy-of",
    label: "enemy of",
    inverseLabel: "enemy of",
    symmetric: true,
    color: "#c4453a",
    from: ["faction", "character"],
    to: ["faction", "character"],
  },
  "located-in": {
    id: "located-in",
    label: "located in",
    inverseLabel: "contains",
    color: "#3fa7d6",
    from: ["location", "character", "faction"],
    to: ["location"],
  },
  practices: {
    id: "practices",
    label: "practises",
    inverseLabel: "practised by",
    color: "#9b6fd6",
    from: ["character", "faction"],
    to: ["magic-system"],
  },
  "involved-in": {
    id: "involved-in",
    label: "involved in",
    inverseLabel: "involved",
    color: "#b0a48a",
    from: ["character", "faction", "location"],
    to: ["event"],
  },
};

export const RELATIONSHIP_TYPE_LIST: readonly RelationshipTypeDef[] =
  Object.values(RELATIONSHIP_TYPES);

/**
 * Reads a Relationship from the point of view of one of its endpoints.
 * This is the whole reason inverse labels exist — the caller never has to know
 * which direction the edge was stored in.
 */
export function readRelationship(
  type: RelationshipTypeId,
  standingOn: "from" | "to",
): string {
  const def = RELATIONSHIP_TYPES[type];
  return standingOn === "from" ? def.label : def.inverseLabel;
}
