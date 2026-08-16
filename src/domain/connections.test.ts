import { describe, expect, test } from "vitest";
import { connectionsOf } from "./connections";
import { RELATIONSHIP_TYPE_LIST } from "./relationship-types";
import type { Entry, EntryTypeId, Relationship, RelationshipTypeId } from "./types";

function entry(id: string, name: string, type: EntryTypeId = "character"): Entry {
  return { id, worldId: "saltmere", type, name, summary: "", body: "", fields: {} };
}

function rel(
  from: string,
  to: string,
  type: RelationshipTypeId,
  note?: string,
): Relationship {
  return { id: `${from}-${to}`, worldId: "saltmere", from, to, type, note };
}

const kael = entry("kael", "Kael");
const aria = entry("aria", "Aria");

describe("reading a relationship from one of its ends", () => {
  test("standing on the `from` end reads the forward label", () => {
    const connections = connectionsOf("kael", [rel("kael", "aria", "parent-of")], [kael, aria]);

    expect(connections).toHaveLength(1);
    expect(connections[0].label).toBe("parent of");
    expect(connections[0].other.name).toBe("Aria");
  });

  test("standing on the `to` end reads the inverse label", () => {
    const connections = connectionsOf("aria", [rel("kael", "aria", "parent-of")], [kael, aria]);

    expect(connections).toHaveLength(1);
    expect(connections[0].label).toBe("child of");
    expect(connections[0].other.name).toBe("Kael");
  });

  test("a symmetric type reads the same from either end", () => {
    const edge = rel("kael", "aria", "sibling-of");

    expect(connectionsOf("kael", [edge], [kael, aria])[0].label).toBe("sibling of");
    expect(connectionsOf("aria", [edge], [kael, aria])[0].label).toBe("sibling of");
  });

  test("the note on an edge survives the read", () => {
    const edge = rel("kael", "aria", "parent-of", "estranged since the siege");

    expect(connectionsOf("kael", [edge], [kael, aria])[0].note).toBe(
      "estranged since the siege",
    );
  });

  test("an edge whose other end is missing is skipped, not returned broken", () => {
    const dangling = rel("kael", "nobody", "parent-of");

    expect(connectionsOf("kael", [dangling], [kael, aria])).toEqual([]);
  });

  test("connections are ordered by label, then by the other entry's name", () => {
    const nix = entry("nix", "Nix");
    const solace = entry("solace", "Solace");
    const edges = [
      rel("kael", "nix", "sibling-of"),
      rel("kael", "solace", "parent-of"),
      rel("kael", "aria", "parent-of"),
    ];

    const ordered = connectionsOf("kael", edges, [kael, aria, nix, solace]).map(
      (c) => `${c.label}: ${c.other.name}`,
    );

    expect(ordered).toEqual([
      "parent of: Aria",
      "parent of: Solace",
      "sibling of: Nix",
    ]);
  });

  test("an edge between two other entries is not returned", () => {
    const nix = entry("nix", "Nix");

    expect(connectionsOf("kael", [rel("aria", "nix", "sibling-of")], [kael, aria, nix])).toEqual(
      [],
    );
  });
});

describe("the relationship registry", () => {
  // connectionsOf trusts the registry to encode symmetry. If a symmetric type
  // ever declares differing labels, the "reads the same from either end"
  // guarantee silently breaks for that type only.
  test("every symmetric type reads identically in both directions", () => {
    const broken = RELATIONSHIP_TYPE_LIST.filter(
      (t) => t.symmetric && t.label !== t.inverseLabel,
    ).map((t) => t.id);

    expect(broken).toEqual([]);
  });
});
