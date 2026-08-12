import { ENTRY_TYPE_LIST, type EntryTypeId, type FieldKind } from "@/domain";

/**
 * The GraphQL schema is generated from the entry-type registry.
 *
 * This is the point of ADR-0002. Because the registry lives in code rather
 * than in the database, the API can expose a real `Character` type with a real
 * `allegiance` field, instead of surrendering to a `JSON` scalar and throwing
 * away everything GraphQL is for. Add a field to the registry and it appears
 * in the schema, in the generated forms, and in validation — one edit.
 */

const GQL_TYPE: Record<FieldKind, string> = {
  text: "String",
  longtext: "String",
  // Deliberately Float rather than Int: the registry says "number", and
  // narrowing to Int here would silently reject a population of 2.5 million.
  number: "Float",
  // Selects stay String. GraphQL enum values cannot contain hyphens, and
  // several options ("reach-wide", "near-extinct") do, so enums would need a
  // bidirectional value mapping. Validation still enforces the options.
  select: "String",
};

/** "magic-system" → "MagicSystem" */
export function graphqlTypeName(id: EntryTypeId): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Fields every Entry has, regardless of type.
 *
 * `fields` is here *as well as* the concrete typed fields below, and the
 * duplication is intentional: typed fields serve API consumers who know what
 * they are asking for, while the generic list lets the UI render any entry
 * from the registry without a per-type query.
 */
const COMMON_FIELDS = `
  id: ID!
  type: String!
  name: String!
  summary: String!
  body: String!
  order: Int
  displayDate: String
  fields: [Field!]!
  connections: [Connection!]!
  mentions: [Mention!]!
`.trimEnd();

const COMMON_KEYS = new Set([
  "id",
  "type",
  "name",
  "summary",
  "body",
  "order",
  "displayDate",
  "fields",
  "connections",
  "mentions",
]);

function entryTypeSdl(): string {
  return ENTRY_TYPE_LIST.map((def) => {
    const own = def.fields.map((field) => {
      if (COMMON_KEYS.has(field.key)) {
        // Would emit a duplicate field and fail at schema build with a much
        // less helpful message. Fail here, naming the culprit.
        throw new Error(
          `Entry type "${def.id}" declares a field named "${field.key}", which collides with a built-in Entry field. Rename it in the registry.`,
        );
      }
      return `  ${field.key}: ${GQL_TYPE[field.kind]}${field.required ? "!" : ""}`;
    });

    return [
      `"""${def.label}"""`,
      `type ${graphqlTypeName(def.id)} implements Entry {`,
      COMMON_FIELDS,
      ...own,
      `}`,
    ].join("\n");
  }).join("\n\n");
}

export const typeDefs = `
"""One documented thing in a World."""
interface Entry {
${COMMON_FIELDS}
}

${entryTypeSdl()}

"""One named piece of information on an Entry. Labels come from the registry."""
type Field {
  key: String!
  value: String!
}

"""
A Relationship seen from one of its ends. The label already reads correctly
for the entry you asked from, so callers never handle direction themselves.
"""
type Connection {
  id: ID!
  label: String!
  note: String
  other: Entry!
}

"""An Entry named in another Entry's prose. Never a Relationship."""
type Mention {
  name: String!
  entry: Entry
}

"""
A Relationship as stored: one edge, one direction, read correctly from either
end via Connection. Exposed raw because the graph view needs edges once, and
Connection would hand back each edge twice — once per endpoint.
"""
type Relationship {
  id: ID!
  from: ID!
  to: ID!
  type: String!
  note: String
}

type World {
  id: ID!
  name: String!
  tagline: String!
  entries: [Entry!]!
  relationships: [Relationship!]!
}

type Query {
  worlds: [World!]!
  world(id: ID!): World
  entry(worldId: ID!, id: ID!): Entry
  """Events in Order. Display dates are shown, never parsed."""
  timeline(worldId: ID!): [Event!]!
}
`;
