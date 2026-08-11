import { ApolloServer } from "@apollo/server";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { loadEnvLocal } from "./load-env";
import { connectDb, disconnectDb } from "./db";
import { createLoaders } from "./loaders";
import { resolvers, type Context } from "./resolvers";
import { typeDefs } from "./schema";

/**
 * Integration tests against the real schema and a real database.
 *
 * Deliberately a handful of whole operations rather than a unit test per
 * resolver — resolvers are thin delegations to src/domain, which is already
 * specified there. What is worth checking is that the schema, the loaders and
 * the domain agree once assembled.
 *
 * Requires a seeded database (`npm run seed`). Skipped rather than failed when
 * MONGODB_URI is absent, since there is no CI to provide one yet.
 */

loadEnvLocal();
const HAS_DB = Boolean(process.env.MONGODB_URI);

const server = new ApolloServer<Context>({ typeDefs, resolvers });

async function run<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await server.executeOperation(
    { query, variables },
    { contextValue: { loaders: createLoaders() } },
  );
  if (response.body.kind !== "single") throw new Error("expected a single result");
  const { errors, data } = response.body.singleResult;
  if (errors?.length) throw new Error(errors.map((e) => e.message).join("; "));
  return data as T;
}

describe.skipIf(!HAS_DB)("the GraphQL API", () => {
  let started = false;

  beforeAll(async () => {
    await server.start();
    started = true;
    await connectDb();
  });

  afterAll(async () => {
    // Guarded: if startup failed, stop() throws and buries the real error.
    if (started) await server.stop();
    await disconnectDb();
  });

  test("serves a world and its entries", async () => {
    const data = await run<{ world: { name: string; entries: { id: string }[] } }>(`
      query {
        world(id: "saltmere") {
          name
          entries { id }
        }
      }
    `);

    expect(data.world.name).toBe("Saltmere");
    expect(data.world.entries.length).toBeGreaterThan(50);
  });

  test("exposes registry-declared fields as real typed fields, not a JSON blob", async () => {
    // The ADR-0002 payoff: `role` is a field on Character, and asking a
    // Location for it would be a schema error rather than a null at runtime.
    const data = await run<{ entry: { name: string; role: string; status: string } }>(`
      query {
        entry(worldId: "saltmere", id: "nix") {
          name
          ... on Character { role status }
        }
      }
    `);

    expect(data.entry.name).toBe("Nix");
    expect(data.entry.role).toBe("Deepsounder");
    expect(data.entry.status).toBe("alive");
  });

  test("reads a relationship correctly from the end that did not store it", async () => {
    // Ossary is the `to` end of every located-in edge pointing at it, so the
    // API must say "contains" — the inverse label — without the caller
    // knowing which direction the edge was written in.
    const data = await run<{
      entry: { connections: { label: string; other: { name: string } }[] };
    }>(`
      query {
        entry(worldId: "saltmere", id: "ossary") {
          connections { label other { name } }
        }
      }
    `);

    const contains = data.entry.connections.filter((c) => c.label === "contains");
    expect(contains.length).toBeGreaterThan(0);
    expect(contains.map((c) => c.other.name)).toContain("Threnody");
  });

  test("orders the timeline by order, and shows display dates verbatim", async () => {
    const data = await run<{ timeline: { name: string; order: number; displayDate: string }[] }>(`
      query {
        timeline(worldId: "saltmere") { name order displayDate }
      }
    `);

    const orders = data.timeline.map((e) => e.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(data.timeline[0].name).toBe("The Last Full Tide");
    expect(data.timeline[0].displayDate).toBe("Sixty-two years before the Reckoning of Wells");
  });

  test("resolves a mention whose name contains a space", async () => {
    // Regression: the name loader keyed on a delimiter, which parsed at the
    // first space *inside* the name, so every multi-word entry resolved to
    // null while the query still looked perfectly healthy.
    const data = await run<{
      entry: { mentions: { name: string; entry: { id: string } | null }[] };
    }>(`
      query {
        entry(worldId: "saltmere", id: "threnody") {
          mentions { name entry { id } }
        }
      }
    `);

    const cistern = data.entry.mentions.find((m) => m.name === "Hollowmere Cistern");
    expect(cistern?.entry?.id).toBe("hollowmere-cistern");
  });

  test("reports a mention of something not yet written, rather than dropping it", async () => {
    const data = await run<{
      entry: { mentions: { name: string; entry: { id: string } | null }[] };
    }>(`
      query {
        entry(worldId: "saltmere", id: "ordwin-sarr") {
          mentions { name entry { id } }
        }
      }
    `);

    const unwritten = data.entry.mentions.find(
      (m) => m.name === "The Second Withdrawal",
    );
    expect(unwritten).toBeDefined();
    expect(unwritten?.entry).toBeNull();
  });

  test("a mention does not become a relationship", async () => {
    // Threnody's body names Hollowmere Cistern, but no located-in or other
    // edge exists between them. CONTEXT.md and ADR-0005, enforced at the API.
    const data = await run<{
      entry: { connections: { other: { id: string } }[] };
    }>(`
      query {
        entry(worldId: "saltmere", id: "threnody") {
          connections { other { id } }
        }
      }
    `);

    const targets = data.entry.connections.map((c) => c.other.id);
    expect(targets).toContain("ossary");
    expect(targets).not.toContain("hollowmere-cistern");
  });

  test("returns null for an entry that belongs to a different world", async () => {
    const data = await run<{ entry: unknown }>(`
      query {
        entry(worldId: "somewhere-else", id: "ossary") { id }
      }
    `);

    expect(data.entry).toBeNull();
  });
});
