import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { connectDb } from "@/server/db";
import { createLoaders } from "@/server/loaders";
import { resolvers, type Context } from "@/server/resolvers";
import { typeDefs } from "@/server/schema";

// Mongoose needs Node APIs and cannot run on the edge runtime.
export const runtime = "nodejs";

const server = new ApolloServer<Context>({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler(server, {
  context: async () => {
    await connectDb();
    // Fresh loaders per request — a shared loader would cache across users.
    return { loaders: createLoaders() };
  },
});

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
