import mongoose from "mongoose";

/**
 * A single shared connection, cached on globalThis.
 *
 * Next re-executes modules on hot reload in development and may reuse a warm
 * process between serverless invocations in production. Module-scope state is
 * not durable across either, so a naive `mongoose.connect()` at import time
 * opens a new connection every reload until Atlas refuses more.
 */

const globalForDb = globalThis as unknown as {
  __worlddbConnection?: Promise<typeof mongoose>;
};

export function connectDb(): Promise<typeof mongoose> {
  if (!globalForDb.__worlddbConnection) {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB;

    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Run `bash scripts/setup-atlas.sh`, or copy .env.example to .env.local.",
      );
    }

    globalForDb.__worlddbConnection = mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 15000,
    });
  }

  return globalForDb.__worlddbConnection;
}

/** Only used by scripts and tests, which need the process to actually exit. */
export async function disconnectDb(): Promise<void> {
  if (globalForDb.__worlddbConnection) {
    await mongoose.disconnect();
    globalForDb.__worlddbConnection = undefined;
  }
}
