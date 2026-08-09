# The graph is home; entries are addressable routes

Navigation has three levels, each with one job: the **graph** is the home surface and the way you move around a World; a **peek** panel gives a glance at an entry without leaving the graph; an **entry page** is a real route with its own URL for reading. Finding an entry by name is a command palette, not a sidebar.

Settled by prototyping four layouts against a 66-entry world rather than by argument — see the `prototype/graph-navigation` branch, which holds all four.

## Considered options

- **Graph only, with an overlay panel** (variant A). The graph won, but on its own it has no answer to "where is the entry called Sister Lorne", and a 380px overlay is a poor place to read prose.
- **A persistent searchable index beside the graph** (variant B). Rejected as a layout, but it exposed what was actually missing. Its two virtues — finding things and reading comfortably — are separate needs, and only one of them wants permanent screen space. A sidebar buys search at the cost of the full-bleed canvas that made the graph worth choosing; a ⌘K palette buys it for nothing.
- **Egocentric focus, one entry and its neighbours at a time** (variant C). Rejected: losing the overview costs more than the local clarity gains.
- **Graph home + palette + peek + entry route** (variant D). Chosen.

## Consequences

Two disciplines keep this from collapsing back into two surfaces fighting over one screen:

- **The peek must stay shallow.** It shows a summary, a teaser, and the relationship list — never the full body. A peek that becomes a complete reading surface duplicates the entry page and both get worse. Wanting the body in the peek is the signal the peek should not exist at all.
- **The entry page must carry graph navigation.** Its neighbourhood rail is the primary navigation *on that page*, so walking the world by relationship stays the default motion while reading. Without it the entry page is a dead end and the graph quietly becomes ornamental — which would undo the decision this ADR records.
