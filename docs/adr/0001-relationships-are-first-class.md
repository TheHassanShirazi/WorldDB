# Relationships are first-class, not embedded on entries

A Relationship is stored as its own document — `{ worldId, from, to, type, note }` — rather than as an array of references on the Entries it connects. Relationships in this domain are named and directional and belong to neither endpoint, so embedding them forces a choice between storing each one twice (which can drift) or storing it once (which makes "what points at this entry?" a scan).

## Considered options

- **Embedded array of references on each Entry.** The default MongoDB instinct, and the reason this decision is worth recording — a future reader will assume we simply didn't think of it. Rejected because deleting an Entry becomes an unbounded fan-out update across every other Entry that referenced it, and because a bare reference has nowhere to record what the relationship *means*.
- **A separate Relationship document.** Chosen. Deleting an Entry is one cascading delete. The relationship's meaning, and any note attached to it, has an obvious home. Building the whole Graph remains a single query per World.

## Consequences

Fetching an Entry together with its Relationships is two reads rather than one. Batch them with DataLoader in the GraphQL layer rather than reintroducing embedded copies.
