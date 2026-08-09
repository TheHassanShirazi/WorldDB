import type { EntryTypeDef, EntryTypeId } from "./types";

/**
 * The registry. This — not Mongoose, not the database — is the source of truth
 * for what an Entry of each type may hold. It drives validation, the generated
 * edit forms, and the concrete GraphQL types.
 *
 * See docs/adr/0002-entry-schemas-in-a-typescript-registry.md
 */
export const ENTRY_TYPES: Record<EntryTypeId, EntryTypeDef> = {
  character: {
    id: "character",
    label: "Character",
    plural: "Characters",
    color: "#e0a33e",
    fields: [
      { key: "role", label: "Role", kind: "text", required: true },
      { key: "status", label: "Status", kind: "select", options: ["alive", "dead", "unknown"] },
      { key: "allegiance", label: "Allegiance", kind: "text" },
      { key: "age", label: "Age", kind: "number" },
    ],
  },
  location: {
    id: "location",
    label: "Location",
    plural: "Locations",
    color: "#3fa7d6",
    fields: [
      { key: "kind", label: "Kind", kind: "text", required: true },
      { key: "population", label: "Population", kind: "number" },
      { key: "water", label: "Water access", kind: "select", options: ["abundant", "rationed", "none"] },
    ],
  },
  faction: {
    id: "faction",
    label: "Faction",
    plural: "Factions",
    color: "#e0603e",
    fields: [
      { key: "purpose", label: "Purpose", kind: "text", required: true },
      { key: "reach", label: "Reach", kind: "select", options: ["local", "regional", "reach-wide"] },
      { key: "standing", label: "Standing", kind: "text" },
    ],
  },
  "magic-system": {
    id: "magic-system",
    label: "Magic System",
    plural: "Magic Systems",
    color: "#9b6fd6",
    fields: [
      { key: "source", label: "Source", kind: "text", required: true },
      { key: "cost", label: "Cost", kind: "longtext", required: true },
      { key: "prevalence", label: "Prevalence", kind: "select", options: ["common", "rare", "near-extinct"] },
    ],
  },
  event: {
    id: "event",
    label: "Event",
    plural: "Events",
    color: "#4bbd8b",
    fields: [
      { key: "consequence", label: "Consequence", kind: "longtext" },
    ],
  },
};

export const ENTRY_TYPE_LIST: readonly EntryTypeDef[] = Object.values(ENTRY_TYPES);

export function entryTypeColor(id: EntryTypeId): string {
  return ENTRY_TYPES[id].color;
}
