import { describe, expect, test } from "vitest";
import { timeline } from "./timeline";
import type { Entry, EntryTypeId } from "./types";

function event(id: string, name: string, order: number, displayDate: string): Entry {
  return {
    id,
    worldId: "saltmere",
    type: "event",
    name,
    summary: "",
    body: "",
    fields: {},
    order,
    displayDate,
  };
}

function other(id: string, name: string, type: EntryTypeId): Entry {
  return { id, worldId: "saltmere", type, name, summary: "", body: "", fields: {} };
}

describe("assembling a timeline", () => {
  test("orders events by their order, ascending", () => {
    const events = [
      event("flood", "The Threnody Flood", 95, "Fifteenth year of the Reckoning"),
      event("tide", "The Last Full Tide", 10, "Sixty-two years before"),
      event("riots", "The Drylode Riots", 70, "Fifty-fourth year"),
    ];

    expect(timeline(events).map((e) => e.id)).toEqual(["tide", "riots", "flood"]);
  });
});

describe("what a timeline is and is not", () => {
  test("contains only events", () => {
    const world = [
      event("tide", "The Last Full Tide", 10, "Sixty-two years before"),
      other("ossary", "Ossary", "location"),
      other("nix", "Nix", "character"),
      other("tidecalling", "Tidecalling", "magic-system"),
    ];

    expect(timeline(world).map((e) => e.id)).toEqual(["tide"]);
  });

  test("the display date never influences the ordering", () => {
    // Display dates whose alphabetical order is the exact reverse of the true
    // chronology. If anyone ever "improves" this by sorting or parsing the
    // date, this test fails — which is the entire point of ADR-0003.
    const events = [
      event("second", "Second", 20, "Age of Ash"),
      event("first", "First", 10, "Zenith of the Long Winter"),
    ];

    expect(timeline(events).map((e) => e.id)).toEqual(["first", "second"]);
  });

  test("events sharing an order come back in a stable, deterministic sequence", () => {
    const events = [
      event("beta", "Beta", 50, "same year"),
      event("alpha", "Alpha", 50, "same year"),
    ];

    expect(timeline(events).map((e) => e.id)).toEqual(
      timeline([...events].reverse()).map((e) => e.id),
    );
  });
});
