import { describe, expect, test } from "vitest";
import { ENTRIES, RELATIONSHIPS, validateFixture } from "./saltmere";

/**
 * The fixture is hand-written, so these guard it rather than the code. It also
 * doubles as the harness smoke test — if the @/ alias or config were broken,
 * nothing here would run at all.
 */
describe("the Saltmere fixture", () => {
  test("every relationship connects two entries that exist", () => {
    expect(validateFixture()).toEqual([]);
  });

  test("no two entries share a name", () => {
    const seen = new Map<string, number>();
    for (const e of ENTRIES) seen.set(e.name, (seen.get(e.name) ?? 0) + 1);
    const duplicates = [...seen.entries()]
      .filter(([, n]) => n > 1)
      .map(([name]) => name);
    expect(duplicates).toEqual([]);
  });

  test("no entry is isolated in the graph", () => {
    const connected = new Set<string>();
    for (const r of RELATIONSHIPS) {
      connected.add(r.from);
      connected.add(r.to);
    }
    const isolated = ENTRIES.filter((e) => !connected.has(e.id)).map((e) => e.id);
    expect(isolated).toEqual([]);
  });
});
