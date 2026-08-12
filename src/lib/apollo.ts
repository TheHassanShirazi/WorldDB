"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

/**
 * Apollo Client 4 moved the hooks to "@apollo/client/react"; the client, cache
 * and gql stay on the root entry point. Getting that wrong is the first thing
 * that breaks when following a v3 example.
 */

let client: ApolloClient | undefined;

export function getApolloClient(): ApolloClient {
  // One client per browser session, so the cache survives navigation: the
  // world is fetched once and moving between the graph and an entry is free.
  client ??= new ApolloClient({
    link: new HttpLink({ uri: "/api/graphql" }),
    cache: new InMemoryCache(),
  });
  return client;
}
