/**
 * PROTOTYPE ROUTE — three variants of graph navigation on one route.
 *
 * Answering: is the graph the primary navigation surface, or a view you click
 * into? Switch with the floating bar, the ← / → keys, or ?variant=A|B|C.
 *
 * Throwaway. The winner gets rewritten properly; this route does not ship.
 */

import { GraphPrototype } from "@/prototype/GraphPrototype";
import { VARIANT_KEYS, type VariantKey } from "@/prototype/variant-keys";

export const metadata = {
  title: "Graph navigation prototype — WorldDB",
};

function parseVariant(raw: string | string[] | undefined): VariantKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return (VARIANT_KEYS as readonly string[]).includes(v ?? "")
    ? (v as VariantKey)
    : "A";
}

function first(raw: string | string[] | undefined): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v ?? null;
}

export default async function Page(props: PageProps<"/prototype/graph">) {
  const { variant, entry } = await props.searchParams;
  return (
    <GraphPrototype variant={parseVariant(variant)} pageEntryId={first(entry)} />
  );
}
