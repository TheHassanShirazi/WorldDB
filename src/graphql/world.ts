import { gql } from "@apollo/client";
import type { EntryTypeId, RelationshipTypeId } from "@/domain";

/**
 * One query, once per session.
 *
 * A world is small — tens of entries — and the graph needs all of it anyway to
 * lay out. Fetching the whole thing into the Apollo cache makes search,
 * filtering and navigation between entries pure client-side work, which is the
 * decision recorded for search: no server-side search endpoint at this size.
 */
export const WORLD_QUERY = gql`
  query World($id: ID!) {
    world(id: $id) {
      id
      name
      tagline
      entries {
        id
        type
        name
        summary
        body
        order
        displayDate
        fields {
          key
          value
        }
        connections {
          id
          label
          note
          other {
            id
            name
            type
          }
        }
        mentions {
          name
          entry {
            id
            name
          }
        }
      }
      relationships {
        id
        from
        to
        type
      }
    }
  }
`;

export interface ApiField {
  key: string;
  value: string;
}

export interface ApiConnection {
  id: string;
  label: string;
  note: string | null;
  other: { id: string; name: string; type: EntryTypeId };
}

export interface ApiMention {
  name: string;
  entry: { id: string; name: string } | null;
}

export interface ApiEntry {
  id: string;
  type: EntryTypeId;
  name: string;
  summary: string;
  body: string;
  order: number | null;
  displayDate: string | null;
  fields: ApiField[];
  connections: ApiConnection[];
  mentions: ApiMention[];
}

export interface ApiRelationship {
  id: string;
  from: string;
  to: string;
  type: RelationshipTypeId;
}

export interface ApiWorld {
  id: string;
  name: string;
  tagline: string;
  entries: ApiEntry[];
  relationships: ApiRelationship[];
}

export interface WorldQueryResult {
  world: ApiWorld | null;
}

/**
 * The single world this deployment shows. Worlds exist in the model from day
 * one (retrofitting a tenancy key is miserable) but the UI only surfaces one,
 * so the id lives here rather than in the URL.
 */
export const WORLD_ID = "saltmere";
