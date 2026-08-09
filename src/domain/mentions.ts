/**
 * Mentions — one Entry referred to by name in the prose of another.
 *
 * A Mention asserts only that the writer wrote the name down. It carries no
 * meaning about how the two Entries are connected and is never a Relationship
 * (CONTEXT.md; ADR-0005). Resolution is a plain lookup because Entry names are
 * unique within a World.
 */

import type { Entry } from "./types";

const MENTION = /\[\[([^[\]]+)\]\]/g;

export interface Mention {
  /** Exactly as written between the brackets, trimmed. */
  name: string;
  /** The Entry it names, or null when this World has no Entry by that name. */
  entry: Entry | null;
}

/**
 * Names as written between brackets, in the order they appear. Repeats are
 * preserved — a body that names an Entry twice mentions it twice.
 */
export function extractMentionNames(body: string): string[] {
  return [...body.matchAll(MENTION)]
    .map((m) => m[1].trim())
    .filter((name) => name.length > 0);
}

/**
 * Resolves every mention in a body against a World's entries.
 *
 * Unresolved mentions are returned with a null entry rather than dropped —
 * a writer naming something they have not written yet is useful information,
 * not an error.
 */
export function mentionsIn(body: string, entries: readonly Entry[]): Mention[] {
  const byName = new Map(entries.map((e) => [e.name, e]));
  return extractMentionNames(body).map((name) => ({
    name,
    entry: byName.get(name) ?? null,
  }));
}
