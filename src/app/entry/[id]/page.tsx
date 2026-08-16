import { EntryReader } from "@/components/EntryReader";

/**
 * Entries are addressable routes rather than a panel state (ADR-0005), which
 * is what makes a link to one shareable and the browser's Back button useful.
 */
export default async function EntryPage(props: PageProps<"/entry/[id]">) {
  const { id } = await props.params;
  return <EntryReader entryId={id} />;
}
