/**
 * Deliberately NOT a "use client" module.
 *
 * The server route needs the real array at runtime to validate ?variant=.
 * A value exported from a client module crosses the boundary as a client
 * reference proxy, not as data — `VARIANT_KEYS.includes` would be undefined
 * on the server, and TypeScript would not warn you, because the *types* are
 * perfectly correct. Keep shared runtime constants in plain modules.
 */

export const VARIANT_KEYS = ["A", "B", "C", "D"] as const;
export type VariantKey = (typeof VARIANT_KEYS)[number];
