/**
 * Seeds a world into MongoDB. Idempotent — safe to re-run.
 *
 *   npm run seed
 *
 * Standalone scripts do not get Next's automatic .env.local loading, so this
 * reads it itself rather than silently connecting to nothing.
 */

import { validateEntry } from "@/domain";
import { ENTRIES, RELATIONSHIPS, WORLD } from "@/fixtures/saltmere";
import { connectDb, disconnectDb } from "@/server/db";
import { loadEnvLocal } from "@/server/load-env";
import { EntryModel, RelationshipModel, WorldModel } from "@/server/models";

async function main() {
  loadEnvLocal();

  // Validate before touching the database. Seeding a world that violates the
  // rules the app enforces would be a slow, confusing thing to discover later.
  const problems = ENTRIES.flatMap((entry, i) =>
    validateEntry(
      { type: entry.type, name: entry.name, fields: entry.fields },
      ENTRIES.slice(0, i),
    ).map((p) => `${entry.id}: ${p.field ?? "entry"} — ${p.message}`),
  );
  if (problems.length) {
    console.error(`Fixture failed validation:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }

  await connectDb();
  console.log(`Seeding "${WORLD.name}" into ${process.env.MONGODB_DB}…`);

  // Replace this world wholesale rather than merging, so a re-run always
  // produces exactly the fixture and never leaves orphaned edges behind.
  await Promise.all([
    EntryModel.deleteMany({ worldId: WORLD.id }),
    RelationshipModel.deleteMany({ worldId: WORLD.id }),
  ]);

  await WorldModel.findByIdAndUpdate(
    WORLD.id,
    { _id: WORLD.id, name: WORLD.name, tagline: WORLD.tagline },
    { upsert: true },
  );

  await EntryModel.insertMany(
    ENTRIES.map(({ id, ...rest }) => ({ _id: id, ...rest })),
  );
  await RelationshipModel.insertMany(
    RELATIONSHIPS.map(({ id, ...rest }) => ({ _id: id, ...rest })),
  );

  const [entries, relationships] = await Promise.all([
    EntryModel.countDocuments({ worldId: WORLD.id }),
    RelationshipModel.countDocuments({ worldId: WORLD.id }),
  ]);
  console.log(`Done — ${entries} entries, ${relationships} relationships.`);

  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await disconnectDb();
  process.exit(1);
});
