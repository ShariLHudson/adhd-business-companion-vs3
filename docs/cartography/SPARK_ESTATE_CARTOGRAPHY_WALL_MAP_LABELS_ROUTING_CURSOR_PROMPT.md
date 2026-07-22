# Spark Estate — Cartography Room Wall Map Labels & Routing
## Cursor Implementation Prompt

# Mission

Fix the Cartography Room wall so every visible map has the correct clickable name and opens the correct map-building experience.

# Exact Wall Order

## Top Row, Left to Right
1. Mind Map
2. Decision Map
3. Journey Map
4. Process Map
5. Relationship Map

## Bottom Row, Left to Right
1. Timeline Map
2. Strategy Map
3. Opportunity Map
4. System Map
5. Priority Map

Use `Opportunity Map` as the canonical name.

# Required Behavior

Each framed wall map must have its own visible clickable label.

Each label must:
- sit directly on or immediately below the correct framed map
- use the exact canonical name above
- remain visible without hover
- be readable against the room background
- work as a real accessible button or link
- open the correct map builder
- use the same name in the builder, saved map, edit screen, and print title

Both the map image and its label may be clickable, but they must call the same handler.

Do not use one shared title such as `Course Launch` over the wall.

# Canonical Map Registry

Create one source of truth for the ten map types.

```ts
const cartographyWallMaps = [
  { id: "mind-map", name: "Mind Map", row: "top", position: 1, builderType: "mind-map" },
  { id: "decision-map", name: "Decision Map", row: "top", position: 2, builderType: "decision-map" },
  { id: "journey-map", name: "Journey Map", row: "top", position: 3, builderType: "journey-map" },
  { id: "process-map", name: "Process Map", row: "top", position: 4, builderType: "process-map" },
  { id: "relationship-map", name: "Relationship Map", row: "top", position: 5, builderType: "relationship-map" },
  { id: "timeline-map", name: "Timeline Map", row: "bottom", position: 1, builderType: "timeline-map" },
  { id: "strategy-map", name: "Strategy Map", row: "bottom", position: 2, builderType: "strategy-map" },
  { id: "opportunity-map", name: "Opportunity Map", row: "bottom", position: 3, builderType: "opportunity-map" },
  { id: "system-map", name: "System Map", row: "bottom", position: 4, builderType: "system-map" },
  { id: "priority-map", name: "Priority Map", row: "bottom", position: 5, builderType: "priority-map" },
];
```

Adapt routes to the existing codebase, but preserve the exact names and order.

Use this registry for:
- wall labels
- click routing
- builder titles
- saved map type names
- My Maps
- edit screens
- print titles

Do not maintain separate hard-coded lists.

# Correct Routing

| Wall Label | Must Open |
|---|---|
| Mind Map | Mind Map builder |
| Decision Map | Decision Map builder |
| Journey Map | Journey Map builder |
| Process Map | Process Map builder |
| Relationship Map | Relationship Map builder |
| Timeline Map | Timeline Map builder |
| Strategy Map | Strategy Map builder |
| Opportunity Map | Opportunity Map builder |
| System Map | System Map builder |
| Priority Map | Priority Map builder |

No visible map may open a generic, wrong, stale, or placeholder builder.

# Remove the Current Incorrect Overlay

Remove the large default overlay showing:
- `Course Launch`
- `+ Branch`

That overlay should not cover the Cartography Room wall.

If `Course Launch` is a saved map, it belongs under:
- Resume Previous Map
- My Maps
- or the correct map builder after selection

The default room must show the ten wall maps and their labels.

# Label Design

Use a compact parchment or cream button with:
- dark teal text
- subtle gold border
- strong contrast
- large enough click target
- visible focus state

Do not require hover to discover the name.

# Opening Flow

When a user clicks a wall map:

1. identify the map from the canonical registry
2. open the correct introduction or builder
3. show the exact canonical map name as the title
4. load that map type's correct guided steps
5. save under that exact map type
6. render the correct final map

Example: clicking `Journey Map` must open `Journey Map`, not Timeline Map, Course Launch, or Generic Map.

# Mobile and Tablet

Do not require tapping tiny locations on the background image.

Provide a clear list or grid using the same registry:

- Mind Map
- Decision Map
- Journey Map
- Process Map
- Relationship Map
- Timeline Map
- Strategy Map
- Opportunity Map
- System Map
- Priority Map

Each must open the same correct builder as desktop.

# Accessibility

- keyboard accessible
- visible label
- accessible name
- no hover-only interaction
- visible focus state
- sufficient contrast
- large click targets
- screen readers announce the exact map name

# Testing

For each map confirm:
1. label sits on the correct framed map
2. label text is exact
3. image and label open the same builder
4. correct builder opens
5. builder title matches
6. saved map type matches
7. final map remains the correct type
8. Back returns to Cartography Room
9. mobile selection works
10. keyboard activation works

Also confirm:
- Course Launch overlay is gone from the default room
- + Branch appears only inside maps that support branches
- no dead links
- no duplicate names
- no overlapping labels

# Acceptance Criteria

- [ ] Top row is exactly: Mind Map, Decision Map, Journey Map, Process Map, Relationship Map.
- [ ] Bottom row is exactly: Timeline Map, Strategy Map, Opportunity Map, System Map, Priority Map.
- [ ] Every label sits with the correct map.
- [ ] Every map and label is clickable.
- [ ] Every click opens the correct builder.
- [ ] Every builder title matches the wall label.
- [ ] One canonical registry controls names and routes.
- [ ] Course Launch overlay is removed from the default room.
- [ ] Mobile users can select all ten maps.
- [ ] No map opens the wrong experience.

# Final Experience

The user enters the Cartography Room, immediately sees the correct name on every map, clicks the map they want, and is taken directly into the matching map-building experience.
