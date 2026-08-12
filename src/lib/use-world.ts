"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import type { Entry, Relationship } from "@/domain";
import {
  WORLD_ID,
  WORLD_QUERY,
  type ApiEntry,
  type ApiRelationship,
  type ApiWorld,
  type WorldQueryResult,
} from "@/graphql/world";

/**
 * Loads the world once and adapts the API shapes into the domain shapes, so
 * every tested function in src/domain — buildGraph, neighbourhood,
 * searchEntries, timeline — works on API data unchanged.
 */

function toEntry(api: ApiEntry, worldId: string): Entry {
  return {
    id: api.id,
    worldId,
    type: api.type,
    name: api.name,
    summary: api.summary,
    body: api.body,
    fields: Object.fromEntries(api.fields.map((f) => [f.key, f.value])),
    order: api.order ?? undefined,
    displayDate: api.displayDate ?? undefined,
  };
}

function toRelationship(api: ApiRelationship, worldId: string): Relationship {
  return {
    id: api.id,
    worldId,
    from: api.from,
    to: api.to,
    type: api.type,
  };
}

export interface WorldData {
  world: ApiWorld | null;
  entries: Entry[];
  relationships: Relationship[];
  /** API entries keyed by id, for the detail surfaces. */
  apiById: Map<string, ApiEntry>;
  loading: boolean;
  error?: Error;
}

export function useWorld(): WorldData {
  const { data, loading, error } = useQuery<WorldQueryResult>(WORLD_QUERY, {
    variables: { id: WORLD_ID },
  });

  const world = data?.world ?? null;

  return useMemo(() => {
    if (!world) {
      return {
        world: null,
        entries: [],
        relationships: [],
        apiById: new Map(),
        loading,
        error: error ?? undefined,
      };
    }

    return {
      world,
      entries: world.entries.map((e) => toEntry(e, world.id)),
      relationships: world.relationships.map((r) => toRelationship(r, world.id)),
      apiById: new Map(world.entries.map((e) => [e.id, e])),
      loading,
      error: error ?? undefined,
    };
  }, [world, loading, error]);
}
