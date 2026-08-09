import type { Entry, EntryTypeId, Relationship } from "@/domain";

/** Every variant gets the same data and the same handlers. Only layout differs. */
export interface VariantProps {
  entries: Entry[];
  relationships: Relationship[];
  byId: Map<string, Entry>;
  visibleTypes: Set<EntryTypeId>;
  onToggleType: (t: EntryTypeId) => void;
  counts: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /**
   * Variant D only. The entry whose full page is open, carried in ?entry= so
   * the reading surface is addressable and browser Back works.
   */
  pageEntryId?: string | null;
  onOpenPage?: (id: string | null) => void;
}
