# WorldDB

A worldbuilding companion for fiction writers. Characters, locations, factions,
magic systems and events are recorded as interconnected entries and navigated
through a relationship graph.

Work in progress. The navigation model is settled and the domain layer is
tested; the database and API are not built yet.

## Getting started

```bash
npm install
npm run dev
```

The graph navigation prototype is at
[`/prototype/graph`](http://localhost:3000/prototype/graph), running against an
in-memory fixture — no database required.

## Database and API

Needed for the GraphQL API. The prototype runs without either.

Create a free MongoDB Atlas cluster with a database user and a network access
rule, then copy [`.env.example`](.env.example) to `.env.local` and fill in
`MONGODB_URI` and `MONGODB_DB`. Then:

```bash
npm run seed   # loads the Saltmere world — 66 entries, 127 relationships
npm run dev
```

The API is served at `/api/graphql`. Entry types are declared once in
`src/domain/entry-types.ts` and the GraphQL schema is generated from that
registry, so `Character.role` is a real typed field rather than a JSON blob —
asking a `Location` for it is a schema error, not a null at runtime.

## Tests

```bash
npm test
```

Vitest. The domain layer in `src/domain/` is unit tested; `src/server/` has
integration tests that run whole GraphQL operations against a real database.
Those skip automatically when `MONGODB_URI` is not set.

## How it is built

- [`CONTEXT.md`](CONTEXT.md) — the domain glossary. Worth reading first; the
  code uses these words deliberately.
- [`docs/adr/`](docs/adr/) — the decisions that would otherwise look arbitrary,
  and why they were made.
