# WorldDB

A worldbuilding companion for fiction writers. A writer records the pieces of a fictional world as interconnected entries and navigates them through a relationship graph.

## Language

### The world and its contents

**World**:
A single self-contained fictional setting, and the boundary of everything inside it. Entries in one World never relate to entries in another.
_Avoid_: Project, universe, campaign

**Entry**:
One documented thing in a World — a person, a place, an organisation, a system of magic, a moment in history. The unit a writer creates, edits, and reads.
_Avoid_: Page, article, node, document, record

**Entry Type**:
The kind of thing an Entry is, which determines what can be recorded about it. Character, Location, Faction, Magic System, and Event are Entry Types.
_Avoid_: Category, kind, template

**Field**:
One named piece of information on an Entry, determined by its Entry Type — a Character's allegiance, a Magic System's cost.
_Avoid_: Property, attribute, metadata

### Connections

**Relationship**:
A named, directed connection from one Entry to another, carrying meaning of its own — Aria is the *daughter of* Kael; the Ashguard *controls* Ember Keep. A Relationship belongs to neither Entry it connects.
_Avoid_: Link, reference, connection, association, edge

**Relationship Type**:
The kind of connection a Relationship expresses, together with how it reads from each end. `parent of` read backwards is `child of`; `allied with` reads the same from both ends.
_Avoid_: Label, predicate, verb

**Mention**:
One Entry referred to by name in the prose of another. A Mention says only that the writer wrote the name down; it asserts nothing about how the two Entries are connected, and it is never a Relationship.
_Avoid_: Backlink, wiki link, inbound link

**Graph**:
The whole of a World seen as its Entries and the Relationships between them. The writer's primary way of moving around a World.
_Avoid_: Map, web, network, diagram

### Time

**Event**:
An Entry Type for something that happened in the World at a point in its history. An Event is an ordinary Entry and relates to Characters, Locations, and Factions like any other.
_Avoid_: Moment, incident, milestone, happening

**Order**:
An Event's position in a World's history relative to every other Event. Purely a sequence — it carries no units and means nothing outside its own World.
_Avoid_: Date, timestamp, position, index

**Display Date**:
How an Event's moment in time is written for a reader, in the World's own reckoning — "Third Age 3019", "twenty years before the Sundering". Never interpreted, only shown.
_Avoid_: Date, in-world date, formatted date

**Timeline**:
Events shown in Order. A way of viewing a World, not a thing a writer creates.
_Avoid_: Chronology, history, era
