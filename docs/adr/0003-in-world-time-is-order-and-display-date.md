# In-world time is an order and a display date, never a Date

An Event carries two independent values: `order`, an integer positioning it against every other Event in its World, and `displayDate`, a freeform string shown to the reader. Neither is derived from the other and no calendar type is involved anywhere.

Fictional calendars do not obey the assumptions a date type is built on. "Third Age 3019", "twenty years before the Sundering", and "sometime in the second century of the Long Winter" are all things writers need to record, and none of them parse, none share an epoch, and some are deliberately imprecise. Sorting and display are genuinely separate problems here, so they get separate fields.

## Consequences

There is no date arithmetic, no duration between Events, and no filtering by range. If those are ever wanted they need a per-World calendar definition, which is a substantially larger feature than it looks.
