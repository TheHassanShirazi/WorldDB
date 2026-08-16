/**
 * Entry validation, driven entirely by the registry (ADR-0002).
 *
 * This is the "migrations move into application code" cost that ADR names:
 * the shape of an Entry is enforced here, not by the database.
 */

import { ENTRY_TYPES } from "./entry-types";
import type { Entry, EntryTypeId } from "./types";

export interface ValidationProblem {
  /** The offending field key, or null when the problem is the entry itself. */
  field: string | null;
  message: string;
}

export interface EntryInput {
  type: string;
  name: string;
  fields: Record<string, unknown>;
}

/** Returns every problem found. An empty array means the entry is valid. */
export function validateEntry(
  input: EntryInput,
  existing: readonly Entry[],
): ValidationProblem[] {
  const def = ENTRY_TYPES[input.type as EntryTypeId];
  if (!def) {
    return [{ field: null, message: `Unknown entry type "${input.type}"` }];
  }

  const problems: ValidationProblem[] = [];
  const declared = new Map(def.fields.map((f) => [f.key, f]));

  const name = input.name.trim();
  if (!name) {
    problems.push({ field: "name", message: "A name is required" });
  } else if (existing.some((e) => e.name === name)) {
    // Unique within a World — it is what makes a Mention resolvable.
    problems.push({ field: "name", message: `This world already has "${name}"` });
  }

  for (const field of def.fields) {
    const value = input.fields[field.key];
    const missing = value === undefined || value === "";

    if (field.required && missing) {
      problems.push({ field: field.key, message: `${field.label} is required` });
      continue;
    }
    if (missing) continue;

    if (field.kind === "select" && !field.options?.includes(String(value))) {
      problems.push({
        field: field.key,
        message: `${field.label} must be one of: ${field.options?.join(", ")}`,
      });
    }

    // Numeric strings are accepted — form inputs hand back strings, and
    // rejecting "16" would make every number field unusable in the UI.
    if (field.kind === "number" && Number.isNaN(Number(value))) {
      problems.push({ field: field.key, message: `${field.label} must be a number` });
    }
  }

  for (const key of Object.keys(input.fields)) {
    if (!declared.has(key)) {
      problems.push({
        field: key,
        message: `${def.label} has no field "${key}"`,
      });
    }
  }

  return problems;
}
