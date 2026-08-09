import { describe, expect, test } from "vitest";
import { relationshipsTouching } from "./deletion";
import type { Relationship, RelationshipTypeId } from "./types";

function rel(id: string, from: string, to: string, type: RelationshipTypeId): Relationship {
  return { id, worldId: "saltmere", from, to, type };
}

const edges = [
  rel("r1", "kael", "aria", "parent-of"),
  rel("r2", "nix", "kael", "sibling-of"),
  rel("r3", "aria", "nix", "allied-with"),
];

describe("what a deletion would destroy", () => {
  test("finds edges where the entry is the `from` end", () => {
    expect(relationshipsTouching("kael", edges).map((r) => r.id)).toContain("r1");
  });
});

describe("both ends and neither", () => {
  test("finds edges where the entry is the `to` end", () => {
    expect(relationshipsTouching("kael", edges).map((r) => r.id).sort()).toEqual(["r1", "r2"]);
  });

  test("ignores edges between two other entries", () => {
    expect(relationshipsTouching("kael", edges).map((r) => r.id)).not.toContain("r3");
  });

  test("finds nothing for an entry with no relationships", () => {
    expect(relationshipsTouching("old-vess", edges)).toEqual([]);
  });

  test("counts a self-referential edge once, not twice", () => {
    const selfEdge = [rel("r4", "kael", "kael", "allied-with")];

    expect(relationshipsTouching("kael", selfEdge)).toHaveLength(1);
  });
});
