"use client";

/**
 * Renders a body with its [[mentions]] as links.
 *
 * A mention that resolves becomes a link. One that does not stays visible and
 * marked rather than being hidden or silently rendered as plain prose — a
 * writer naming something they have not written yet is useful information, and
 * this is where they see it.
 *
 * Mentions are never Relationships; nothing here creates an edge (ADR-0005).
 */

import Link from "next/link";
import { segmentBody } from "@/domain";
import type { ApiMention } from "@/graphql/world";

export function MentionText({
  body,
  mentions,
}: {
  body: string;
  mentions: ApiMention[];
}) {
  const resolved = new Map(mentions.map((m) => [m.name, m.entry]));

  return (
    <>
      {segmentBody(body).map((segment, i) => {
        if (segment.kind === "text") return <span key={i}>{segment.text}</span>;

        const target = resolved.get(segment.name);
        if (!target) {
          return (
            <span
              key={i}
              title="Not written yet"
              className="text-white/55 underline decoration-dotted decoration-white/25 underline-offset-4"
            >
              {segment.name}
            </span>
          );
        }

        return (
          <Link
            key={i}
            href={`/entry/${target.id}`}
            className="text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white/70"
          >
            {segment.name}
          </Link>
        );
      })}
    </>
  );
}
