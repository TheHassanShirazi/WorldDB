/**
 * A Timeline is Events in Order — a way of viewing a World, not a thing a
 * writer creates (CONTEXT.md).
 *
 * `order` sorts and `displayDate` is shown; they are unrelated, and nothing
 * here ever parses a display date. See ADR-0003 for why fictional calendars
 * make that the only workable arrangement.
 */

import type { Entry } from "./types";

export function timeline(entries: readonly Entry[]): Entry[] {
  return entries
    .filter((e) => e.type === "event")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
}
