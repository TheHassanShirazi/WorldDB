# Entry schemas live in a TypeScript registry

Every Entry is stored in one collection with a `type` discriminator and a `fields` object, but what fields each Entry Type may hold is declared in a TypeScript registry in the application, not in the database. That registry is the single source that drives field validation, the generated edit forms, and the concrete GraphQL types.

## Considered options

- **Freeform `fields` with no declared shape.** Rejected. Nothing could then tell the UI that a Character has an allegiance and a Magic System has a cost, so every Entry would degrade to a generic key/value editor, and the GraphQL schema would expose `fields` as an untyped JSON scalar — discarding the main reason we are using GraphQL at all.
- **Mongoose discriminators, or one collection per Entry Type.** Rejected as more machinery than the problem needs, and per-collection storage would make the Graph query fan out across collections.
- **One collection plus a code-level registry.** Chosen.

## Consequences

"MongoDB means no migrations" is not what this buys. Schema changes still have to be handled — they move out of the database and into application code, where a careless change becomes a permanent defensive read rather than a one-time script. Adding a field is free; renaming or removing one requires a deliberate backfill.
