import { describe, expect, test } from "vitest";
import { extractMentionNames, mentionsIn } from "./mentions";
import { connectionsOf } from "./connections";
import type { Entry } from "./types";

function entry(id: string, name: string, body = ""): Entry {
  return { id, worldId: "saltmere", type: "character", name, summary: "", body, fields: {} };
}

describe("extracting mention names from a body", () => {
  test("finds a single [[Name]]", () => {
    expect(extractMentionNames("She was last seen in [[Ossary]].")).toEqual(["Ossary"]);
  });

  test("finds several, in the order they appear", () => {
    expect(
      extractMentionNames("[[Nix]] left [[Ossary]] for the [[Bonefleet]]."),
    ).toEqual(["Nix", "Ossary", "Bonefleet"]);
  });

  test("trims whitespace inside the brackets", () => {
    expect(extractMentionNames("a [[  Sable Fen  ]] b")).toEqual(["Sable Fen"]);
  });

  test("ignores unclosed, empty, or whitespace-only brackets", () => {
    expect(extractMentionNames("[[unclosed and [[]] and ]]backwards[[")).toEqual([]);
    expect(extractMentionNames("nothing here: [[   ]]")).toEqual([]);
  });

  test("keeps a repeated name once per occurrence", () => {
    expect(extractMentionNames("[[Nix]] and again [[Nix]]")).toEqual(["Nix", "Nix"]);
  });
});

describe("resolving mentions against a world", () => {
  const nix = entry("nix", "Nix");
  const ossary = entry("ossary", "Ossary");

  test("a mention resolves to the entry with that name", () => {
    const [mention] = mentionsIn("She grew up in [[Ossary]].", [nix, ossary]);

    expect(mention.name).toBe("Ossary");
    expect(mention.entry?.id).toBe("ossary");
  });

  test("a mention of something that does not exist is reported, not dropped", () => {
    const mentions = mentionsIn("bound for [[Tessivar]]", [nix, ossary]);

    expect(mentions).toHaveLength(1);
    expect(mentions[0].name).toBe("Tessivar");
    expect(mentions[0].entry).toBeNull();
  });

  test("naming an entry in prose creates no relationship between them", () => {
    // The rule from CONTEXT.md and ADR-0005, pinned in code: prose mentions and
    // typed relationships are different things, and one never becomes the other.
    const rue = entry("rue", "Rue Anders", "Trained alongside [[Nix]] at the College.");

    expect(mentionsIn(rue.body, [nix, rue])[0].entry?.id).toBe("nix");
    expect(connectionsOf("rue", [], [nix, rue])).toEqual([]);
    expect(connectionsOf("nix", [], [nix, rue])).toEqual([]);
  });
});
