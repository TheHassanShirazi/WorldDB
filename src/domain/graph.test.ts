import { describe, expect, test } from "vitest";
import { buildGraph, neighbourhood, searchEntries } from "./graph";
import type { Entry, EntryTypeId, Relationship, RelationshipTypeId } from "./types";

function entry(id: string, name: string, type: EntryTypeId): Entry {
  return { id, worldId: "saltmere", type, name, summary: "", body: "", fields: {} };
}

function rel(from: string, to: string, type: RelationshipTypeId): Relationship {
  return { id: `${from}-${to}`, worldId: "saltmere", from, to, type };
}

const nix = entry("nix", "Nix", "character");
const juno = entry("juno", "Juno Marr", "character");
const salvors = entry("salvors", "The Bonefleet Salvors", "faction");
const entries = [nix, juno, salvors];

const relationships = [
  rel("nix", "salvors", "member-of"),
  rel("juno", "salvors", "member-of"),
  rel("nix", "juno", "allied-with"),
];

const ALL = new Set<EntryTypeId>(["character", "faction", "location", "magic-system", "event"]);

describe("filtering the graph by entry type", () => {
  test("hiding a type removes its nodes", () => {
    const graph = buildGraph(entries, relationships, new Set<EntryTypeId>(["character"]));

    expect(graph.nodes.map((n) => n.id).sort()).toEqual(["juno", "nix"]);
  });

  test("edges touching a hidden node are removed, leaving none dangling", () => {
    const graph = buildGraph(entries, relationships, new Set<EntryTypeId>(["character"]));
    const visible = new Set(graph.nodes.map((n) => n.id));

    expect(graph.links.map((l) => l.relId)).toEqual(["nix-juno"]);
    for (const link of graph.links) {
      expect(visible.has(link.source)).toBe(true);
      expect(visible.has(link.target)).toBe(true);
    }
  });

  test("node size reflects only the edges that survived the filter", () => {
    const unfiltered = buildGraph(entries, relationships, ALL);
    const filtered = buildGraph(entries, relationships, new Set<EntryTypeId>(["character"]));

    expect(unfiltered.nodes.find((n) => n.id === "nix")?.val).toBe(2);
    expect(filtered.nodes.find((n) => n.id === "nix")?.val).toBe(1);
  });

  test("directed types get an arrow and symmetric ones do not", () => {
    const graph = buildGraph(entries, relationships, ALL);
    const byRel = new Map(graph.links.map((l) => [l.relId, l]));

    expect(byRel.get("nix-salvors")?.directed).toBe(true);
    expect(byRel.get("nix-juno")?.directed).toBe(false);
  });
});

describe("the one-hop neighbourhood", () => {
  test("keeps the focus and its direct neighbours only", () => {
    const outsider = entry("outsider", "Old Vess", "character");
    const withOutsider = [...entries, outsider];
    const edges = [...relationships, rel("juno", "outsider", "allied-with")];

    const graph = neighbourhood("nix", withOutsider, edges, ALL);

    // Juno is two hops away via the faction, so she is not in Nix's rail.
    expect(graph.nodes.map((n) => n.id).sort()).toEqual(["juno", "nix", "salvors"]);
    expect(graph.nodes.map((n) => n.id)).not.toContain("outsider");
  });

  test("keeps only edges touching the focus, not those between neighbours", () => {
    const graph = neighbourhood("salvors", entries, relationships, ALL);

    // nix–juno is an edge between two neighbours; the rail is a star.
    expect(graph.links.map((l) => l.relId).sort()).toEqual([
      "juno-salvors",
      "nix-salvors",
    ]);
  });

  test("keeps the focus visible even when its own type is filtered out", () => {
    const graph = neighbourhood(
      "nix",
      entries,
      relationships,
      new Set<EntryTypeId>(["faction"]),
    );

    expect(graph.nodes.map((n) => n.id)).toContain("nix");
  });
});

describe("searching entries", () => {
  test("matches on name, summary and body, case-insensitively", () => {
    const deep = {
      ...entry("deep", "Anvil Deep", "location"),
      summary: "The deepest shaft ever sunk.",
      body: "Nine hundred metres of ladder and pump.",
    };

    expect(searchEntries([deep], "anvil").map((e) => e.id)).toEqual(["deep"]);
    expect(searchEntries([deep], "SHAFT").map((e) => e.id)).toEqual(["deep"]);
    expect(searchEntries([deep], "ladder").map((e) => e.id)).toEqual(["deep"]);
    expect(searchEntries([deep], "tidecalling")).toEqual([]);
  });

  test("an empty query returns everything", () => {
    expect(searchEntries(entries, "   ")).toHaveLength(entries.length);
  });
});
