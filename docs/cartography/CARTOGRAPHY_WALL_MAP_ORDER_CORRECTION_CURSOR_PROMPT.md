# Spark Estate — Cartography Wall Labels, Map App Connections & Routing
## Cursor Implementation Prompt

# Mission

Fix the Cartography Room so every wall map:

- has the correct name
- has the name placed at the top of the correct framed map
- is clickable
- opens the correct working map application
- never routes to a blank page, dead link, placeholder, or wrong map type

The current map menu items do not open anything. This must be corrected now.

---

# Final Correct Wall Order

## Top Row — Left to Right

1. Mind Map
2. Decision Map
3. Relationship Map
4. Process Map
5. Journey Map

## Bottom Row — Left to Right

1. Timeline Map
2. Strategy Map
3. Opportunity Map
4. System Map
5. Priority Map

The Relationship Map and Journey Map must be switched from their current incorrect positions.

---

# Label Placement

Place each map name at the TOP of its own framed map.

Each label must:

- use the exact canonical map name
- sit inside or directly above the top edge of the correct framed map
- remain visible without hover
- be readable
- not float between maps
- not overlap another label
- act as a clickable control
- open the same destination as clicking the map image

---

# Required Map-to-App Connections

Each wall map must connect to the correct working application or builder.

| Wall Map | Must Open |
|---|---|
| Mind Map | Mind Map application |
| Decision Map | Decision Map application |
| Relationship Map | Relationship Map application |
| Process Map | Process Map application |
| Journey Map | Journey Map application |
| Timeline Map | Timeline Map application |
| Strategy Map | Strategy Map application |
| Opportunity Map | Opportunity Map application |
| System Map | System Map application |
| Priority Map | Priority Map application |

Do not route every map to the same generic map page.

Do not leave any map unconnected.

---

# Required Route Audit

Before implementing the visual changes:

1. Locate all existing Cartography routes.
2. Locate all existing map applications, builders, components, and templates.
3. Identify which of the ten map applications already exist.
4. Identify any routes that are missing, stale, duplicated, or pointing to placeholders.
5. Connect each wall map to its correct existing application.
6. If a map application exists under a different route or component name, reuse it rather than creating a duplicate.
7. If an application does not yet exist, create the working builder before leaving the wall map active.
8. Preserve any existing saved user maps.

No visible map may remain clickable if it opens nothing.

---

# Canonical Map Registry

Create one source of truth for:

- map name
- wall position
- route
- app/component key
- builder type
- saved-map type
- print title

Suggested structure:

```ts
type CartographyMapDefinition = {
  id: string;
  name: string;
  row: "top" | "bottom";
  position: number;
  route: string;
  appKey: string;
  builderType: string;
  isActive: boolean;
};
```

Use this final registry:

```ts
const cartographyMaps: CartographyMapDefinition[] = [
  {
    id: "mind-map",
    name: "Mind Map",
    row: "top",
    position: 1,
    route: "/cartography/mind-map",
    appKey: "mind-map-app",
    builderType: "mind-map",
    isActive: true,
  },
  {
    id: "decision-map",
    name: "Decision Map",
    row: "top",
    position: 2,
    route: "/cartography/decision-map",
    appKey: "decision-map-app",
    builderType: "decision-map",
    isActive: true,
  },
  {
    id: "relationship-map",
    name: "Relationship Map",
    row: "top",
    position: 3,
    route: "/cartography/relationship-map",
    appKey: "relationship-map-app",
    builderType: "relationship-map",
    isActive: true,
  },
  {
    id: "process-map",
    name: "Process Map",
    row: "top",
    position: 4,
    route: "/cartography/process-map",
    appKey: "process-map-app",
    builderType: "process-map",
    isActive: true,
  },
  {
    id: "journey-map",
    name: "Journey Map",
    row: "top",
    position: 5,
    route: "/cartography/journey-map",
    appKey: "journey-map-app",
    builderType: "journey-map",
    isActive: true,
  },
  {
    id: "timeline-map",
    name: "Timeline Map",
    row: "bottom",
    position: 1,
    route: "/cartography/timeline-map",
    appKey: "timeline-map-app",
    builderType: "timeline-map",
    isActive: true,
  },
  {
    id: "strategy-map",
    name: "Strategy Map",
    row: "bottom",
    position: 2,
    route: "/cartography/strategy-map",
    appKey: "strategy-map-app",
    builderType: "strategy-map",
    isActive: true,
  },
  {
    id: "opportunity-map",
    name: "Opportunity Map",
    row: "bottom",
    position: 3,
    route: "/cartography/opportunity-map",
    appKey: "opportunity-map-app",
    builderType: "opportunity-map",
    isActive: true,
  },
  {
    id: "system-map",
    name: "System Map",
    row: "bottom",
    position: 4,
    route: "/cartography/system-map",
    appKey: "system-map-app",
    builderType: "system-map",
    isActive: true,
  },
  {
    id: "priority-map",
    name: "Priority Map",
    row: "bottom",
    position: 5,
    route: "/cartography/priority-map",
    appKey: "priority-map-app",
    builderType: "priority-map",
    isActive: true,
  },
];
```

Adapt route paths and app keys to the actual codebase.

Do not change the final names or order.

---

# Click Behavior

Clicking either:

- the framed map image
- or the map-name button

must call the same function.

Example:

```tsx
function openCartographyMap(map: CartographyMapDefinition) {
  if (!map.isActive) return;
  router.push(map.route);
}
```

The route must load the correct map application.

Do not use placeholder `href="#"`.

Do not use empty click handlers.

Do not rely on hover.

---

# Map Application Requirements

Each map application must:

1. show the exact map name
2. explain what that map is for
3. guide the user one step at a time
4. save progress
5. remain editable
6. produce the correct final visual map
7. support print
8. support rename
9. support delete
10. allow the user to return later

If an application is not complete, hide that wall map until the application works.

Do not leave active dead-end buttons.

---

# Route Validation

For each route, confirm:

- route exists
- component loads
- no 404
- no blank screen
- no redirect to Clear My Mind
- no redirect to a generic Create page
- no redirect to the wrong map
- no missing state error
- browser refresh works
- browser Back returns to Cartography Room

---

# Remove Incorrect Default Overlay

Remove the current default overlay showing:

- Course Launch
- + Branch

That belongs only inside a saved Mind Map or compatible map builder.

It must not cover the default Cartography Room wall.

---

# Mobile and Tablet

On smaller screens, provide a clear list or grid using the same canonical registry.

The list must preserve the exact order:

## Top Group

- Mind Map
- Decision Map
- Relationship Map
- Process Map
- Journey Map

## Bottom Group

- Timeline Map
- Strategy Map
- Opportunity Map
- System Map
- Priority Map

Each item must open the same correct app as desktop.

Do not make users tap tiny map areas.

---

# Accessibility

- each map is a real button or link
- visible focus state
- keyboard activation
- screen reader announces exact map name
- sufficient contrast
- no hover-only labels
- click target large enough
- selected or active state not communicated by color alone

---

# Testing Requirements

Test all ten maps individually.

For every map confirm:

1. name is correct
2. label is at the top of the correct map
3. image and label use the same route
4. correct app opens
5. page title matches
6. guided builder loads
7. save works
8. edit works
9. final map renders
10. print works
11. delete works
12. browser refresh works
13. Back returns to Cartography Room
14. mobile selection works
15. keyboard activation works

Also confirm:

- Relationship Map is third on the top row
- Journey Map is fifth on the top row
- bottom row order is exact
- no dead links remain
- no placeholder click handlers remain
- no wrong app opens
- Course Launch overlay is removed from the default room

---

# Acceptance Criteria

- [ ] Top row is exactly:
  - Mind Map
  - Decision Map
  - Relationship Map
  - Process Map
  - Journey Map

- [ ] Bottom row is exactly:
  - Timeline Map
  - Strategy Map
  - Opportunity Map
  - System Map
  - Priority Map

- [ ] Every name appears at the top of the correct map.
- [ ] Every map image is clickable.
- [ ] Every map-name button is clickable.
- [ ] Every map opens the correct working application.
- [ ] No map opens a blank page.
- [ ] No map opens the wrong builder.
- [ ] No placeholder links remain.
- [ ] One canonical registry controls names, positions, routes, and app connections.
- [ ] Existing saved maps are preserved.
- [ ] Mobile users can open all ten map applications.

---

# Final Experience

The user enters the Cartography Room, sees the correct name at the top of every framed map, clicks either the map or its name, and immediately enters the correct working map application.
