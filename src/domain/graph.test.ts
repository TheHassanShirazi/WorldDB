import { describe, expect, test } from "vitest";
import { buildGraph } from "./graph";
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
