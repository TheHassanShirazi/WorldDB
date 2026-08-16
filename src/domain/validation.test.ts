import { describe, expect, test } from "vitest";
import { validateEntry } from "./validation";
import type { Entry } from "./types";

/** A Character, per the registry: role (required), status (select), allegiance, age (number). */
function character(overrides: Partial<Parameters<typeof validateEntry>[0]> = {}) {
  return {
    type: "character",
    name: "Nix",
    fields: { role: "Deepsounder" },
    ...overrides,
  };
}

const existing: Entry[] = [
  {
    id: "ossary",
    worldId: "saltmere",
    type: "location",
    name: "Ossary",
    summary: "",
    body: "",
    fields: {},
  },
];

describe("validating an entry", () => {
  test("accepts an entry whose required fields are present", () => {
    expect(validateEntry(character(), existing)).toEqual([]);
  });
});

describe("field problems", () => {
  test("rejects a missing required field, naming it", () => {
    const problems = validateEntry(character({ fields: {} }), existing);

    expect(problems).toHaveLength(1);
    expect(problems[0].field).toBe("role");
  });

  test("rejects a field the entry type does not declare", () => {
    const problems = validateEntry(
      character({ fields: { role: "Deepsounder", favouriteColour: "blue" } }),
      existing,
    );

    expect(problems).toHaveLength(1);
    expect(problems[0].field).toBe("favouriteColour");
  });

  test("rejects a select value outside its options", () => {
    const problems = validateEntry(
      character({ fields: { role: "Deepsounder", status: "vibing" } }),
      existing,
    );

    expect(problems).toHaveLength(1);
    expect(problems[0].field).toBe("status");
  });

  test("accepts a select value that is one of its options", () => {
    expect(
      validateEntry(character({ fields: { role: "Deepsounder", status: "alive" } }), existing),
    ).toEqual([]);
  });
});

describe("entry-level problems", () => {
  test("rejects a number field given something that is not a number", () => {
    const problems = validateEntry(
      character({ fields: { role: "Deepsounder", age: "sixteenish" } }),
      existing,
    );

    expect(problems).toHaveLength(1);
    expect(problems[0].field).toBe("age");
  });

  test("accepts a numeric string for a number field", () => {
    expect(
      validateEntry(character({ fields: { role: "Deepsounder", age: "16" } }), existing),
    ).toEqual([]);
  });

  test("rejects an unknown entry type", () => {
    const problems = validateEntry(character({ type: "prophecy" }), existing);

    expect(problems).toHaveLength(1);
    expect(problems[0].field).toBeNull();
  });

  test("rejects a name already used in this world", () => {
    // Entry names are unique within a World — it is what makes a Mention
    // resolvable. See CONTEXT.md.
    const problems = validateEntry(character({ name: "Ossary" }), existing);

    expect(problems).toHaveLength(1);
    expect(problems[0].field).toBe("name");
  });

  test("rejects a blank name", () => {
    const problems = validateEntry(character({ name: "   " }), existing);

    expect(problems).toHaveLength(1);
    expect(problems[0].field).toBe("name");
  });
});
