# Spark Estate — Cartography Room Completion
## Cursor Implementation Prompt

# Mission

Make the Cartography Room fully functional now.

The room should no longer be a decorative destination or a collection of inactive wall maps.

Every map on the wall must:

- display its correct map name
- use the exact same name everywhere in the platform
- be clickable
- open the correct map-building experience
- guide the user step by step
- remain editable
- generate a complete visual map
- support review, changes, printing, saving, and deletion

The experience must feel simple on the surface while the map intelligence works behind the scenes.

---

# Core Rule

> Every wall map must lead to a working map experience.

Do not leave placeholder maps, inactive images, broken routes, generic forms, or unfinished results screens.

---

# PART 1 — Audit the Existing Cartography Room

Before changing the interface:

1. Locate the Cartography Room page and all related components.
2. Identify every map image currently displayed on the walls.
3. Identify the current internal map registry, routes, map types, templates, database records, and saved-map structures.
4. Create one source of truth for all map types.
5. Preserve existing valid user-created maps and data.
6. Remove or repair stale routes and duplicate map definitions.

Do not invent names that conflict with existing product-approved map names.

---

# PART 2 — One Canonical Map Registry

Create or consolidate a single map-type registry.

Each map type should include:

```ts
type CartographyMapDefinition = {
  id: string;
  name: string;
  shortDescription: string;
  wallImage?: string;
  icon?: string;
  route: string;
  builderType: string;
  steps: CartographyStepDefinition[];
  resultRenderer: string;
  supportsPrint: boolean;
  supportsDuplicate?: boolean;
  supportsExport?: boolean;
  isActive: boolean;
};
```

Adapt this structure to the current codebase.

The registry must be the single source of truth for:

- wall labels
- map gallery names
- page titles
- saved-map type names
- builder routes
- result-page titles
- print titles
- edit screens
- delete confirmations

A map name must not vary between screens.

Example of an unacceptable mismatch:

- Wall label: `Vision Map`
- Builder title: `Future Vision`
- Saved item: `Goal Board`

These must use one approved name.

---

# PART 3 — Add Map Labels to the Wall

Every map image on the Cartography Room wall must have a clear label.

## Label Rules

- Place the label visually with the correct map.
- Use the exact canonical map name from the registry.
- Make labels readable against the background.
- Use Spark Estate typography and visual styling.
- Keep labels elegant and unobtrusive.
- Do not rely on hover alone.
- Labels must remain visible on desktop and accessible on smaller screens.

## Accessibility

Each map must also have:

- an accessible name
- alt text
- keyboard focus
- visible focus state
- a clear button or link role

Example:

```tsx
<button
  aria-label={`Open ${map.name}`}
  onClick={() => openMap(map.id)}
>
  <img src={map.wallImage} alt="" />
  <span>{map.name}</span>
</button>
```

---

# PART 4 — Make Every Map Clickable

Clicking a wall map must open that exact map experience.

Do not route every map to one generic unfinished page.

Each map must:

1. load the correct title
2. load the correct explanation
3. load the correct guided steps
4. use the correct questions and fields
5. generate the correct final visual structure
6. save under the correct map type

If a map type is not truly supported, do not present it as active.

Either:

- finish it now, or
- temporarily hide it until it works

No dead ends.

---

# PART 5 — Map Entry Experience

When the user selects a map, open a simple introduction.

Example:

# [Map Name]

A short sentence explaining:

- what this map helps the user understand
- when it is useful
- what they will have at the end

Primary action:

`Begin My Map`

Secondary actions:

- `Continue Existing Map` when one exists
- `View My Maps`

Do not show a dense feature list.

---

# PART 6 — Guided Step-by-Step Builder

Every map type must walk the user through its process one manageable step at a time.

## Builder Requirements

- one main question or decision per screen
- plain language
- visible progress
- Back and Continue controls
- automatic saving
- Skip when the information is optional
- examples when helpful
- no long form with every question shown at once

Recommended progress language:

`Step 2 of 6`

or:

`Getting Clear → Adding Details → Connecting Ideas → Reviewing`

Use whichever fits the existing experience best.

---

# Map-Specific Intelligence

The questions, logic, and final layout must match the purpose of each map.

Do not use the same generic questionnaire for every map.

Examples of map-specific behavior:

## Journey or Timeline Map

Should support:

- starting point
- important stages
- milestones
- turning points
- current position
- future destination
- dates or approximate timing
- ordered visual path

## Mind Map

Should support:

- central subject
- main branches
- child ideas
- notes
- rearranging branches
- adding and deleting nodes
- visual hierarchy

## Decision Map

Should support:

- decision statement
- options
- benefits
- concerns
- risks
- consequences
- values or priorities
- preferred direction
- visual comparison

## Process Map

Should support:

- process name
- starting point
- ordered steps
- decisions
- branches
- handoffs
- ending point
- dependencies

## Vision Map

Should support:

- desired future
- key life or business areas
- outcomes
- images or symbols when supported
- milestones
- next steps
- connected visual themes

## Relationship or Connection Map

Should support:

- central person, group, or subject
- related people or entities
- relationship type
- strength
- influence
- support
- tension or gaps when appropriate
- editable connections

## Priority Map

Should support:

- possible priorities
- urgency
- importance
- impact
- effort
- timing
- selected focus
- ordered or quadrant-based result

These are implementation examples only.

Use the exact map types already approved and present in the current Cartography Room.

---

# PART 7 — Builder Editing Behavior

The user must be able to change information at any time.

Support:

- Back
- edit a previous answer
- add an item
- remove an item
- rename an item
- reorder items
- move nodes or branches when the map type supports it
- change relationships
- update colors or visual groupings only if already supported
- return later and continue

Changes must update the map preview and saved data.

---

# PART 8 — Live Preview

When practical, show a simple preview during the builder.

The preview should update as information is added.

Do not let the preview overwhelm the step-by-step experience.

Recommended behavior:

- desktop: optional side preview
- mobile: preview behind a `View Map` button
- user can collapse the preview
- builder remains the primary focus

---

# PART 9 — Final Outcome Map

At the end, generate a complete visual map appropriate to the selected map type.

The final result must not be only a text summary.

It should visually represent:

- nodes
- branches
- steps
- relationships
- stages
- priorities
- routes
- or other structures required by that map type

The result screen should include:

# [User's Map Title]

Then the finished visual map.

Below or beside it, provide a short plain-language summary when useful.

---

# Final Map Actions

Keep visible actions limited.

Primary actions:

- `Edit Map`
- `Print`

Use a compact `More` menu for:

- Rename
- Duplicate, if supported
- Export, if supported
- Delete

Avoid displaying a large row of competing buttons.

---

# PART 10 — Editing the Final Map

Selecting `Edit Map` should reopen the builder with existing answers loaded.

The user must not have to start over.

After saving changes:

- regenerate or update the visual map
- preserve the map ID
- update the modified date
- return to the final map
- show a short confirmation

Example:

`Your map has been updated.`

---

# PART 11 — Print Behavior

Every completed map must support printing.

## Print Requirements

- print only the useful map content
- remove navigation, menus, chat panels, and unnecessary controls
- include the map title
- include the map type when helpful
- include the date only if appropriate
- preserve readable colors and lines
- support landscape orientation when the map needs width
- scale without cutting off content
- include a text summary only when it improves understanding

Use a print-specific stylesheet or print component.

Test real browser print preview.

Do not simply call print on the full application page.

---

# PART 12 — Save and My Maps

All maps must save automatically or clearly save during the process.

Create or complete a `My Maps` area if one does not already exist.

Each saved map should show:

- map title
- map type
- last updated date
- small preview when available

Actions:

- Open
- Edit
- More

The `More` menu may contain:

- Rename
- Duplicate
- Print
- Delete

Allow filtering by map type only if there are enough maps to justify it.

Do not add unnecessary sorting and filtering controls to an empty or small collection.

---

# PART 13 — Delete

Deleting a map must require confirmation.

Confirmation example:

# Delete this map?

`[Map Name]` will be removed from My Maps. This cannot be undone.

Buttons:

- Cancel
- Delete Map

After deletion:

- remove the map from storage
- remove related orphaned map data where safe
- return to My Maps or the Cartography Room
- show a brief confirmation

Do not use an icon-only delete action without a label or accessible name.

---

# PART 14 — Empty, Loading, and Error States

## No Saved Maps

Show:

> Your completed maps will appear here.

Primary action:

`Create a Map`

## Loading

Use the Spark Estate thinking or loading experience.

Avoid blank screens.

## Save Failure

Show:

> Your latest changes could not be saved yet.

Actions:

- Try Again
- Keep Working

Preserve unsaved information locally when possible.

## Map Rendering Failure

Show a readable fallback summary and allow the user to edit or retry.

Do not lose the user's map answers.

---

# PART 15 — Background and Room Behavior

The Cartography Room background remains atmospheric.

The user is not required to interact with decorative parts of the room.

Only the labeled wall maps should behave as map launch points.

The room should feel immersive without hiding navigation or reducing readability.

---

# PART 16 — Conversation and Shari Behavior

Shari may help the user think through a map, but the map builder must remain usable without chat.

When conversational guidance is used:

- ask one useful question at a time
- do not over-explain
- do not redirect unnecessarily
- preserve answers in the map data
- allow the user to switch between guided conversation and direct editing
- keep the user in the selected map experience

---

# PART 17 — Data Model

Use the existing database and architecture where possible.

A completed map should store at minimum:

```ts
type SavedCartographyMap = {
  id: string;
  userId: string;
  mapTypeId: string;
  title: string;
  status: "draft" | "complete";
  answers: Record<string, unknown>;
  visualData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
```

Additional structures may be required for:

- nodes
- edges
- ordered steps
- groups
- positions
- styles
- metadata

Do not store only a flattened image.

The map must remain editable.

If an image or PDF export is generated, preserve the underlying structured map data separately.

---

# PART 18 — Responsive Design

## Desktop

- wall map labels clearly visible
- maps clickable
- builder and optional preview can coexist
- final map uses available space well

## Tablet

- preserve readable labels
- avoid overly small wall-map targets
- collapse preview if needed

## Mobile

- provide an accessible list or gallery version of the wall maps
- do not force the user to tap tiny objects in a background image
- one builder step per screen
- map can pan or zoom when needed
- actions remain easy to reach

The immersive room and accessible map list may coexist.

---

# PART 19 — Accessibility

- all map choices keyboard accessible
- wall labels readable
- controls have accessible names
- drag-and-drop has non-drag alternatives
- map nodes can be selected and edited without a mouse
- visible focus states
- high enough contrast
- readable text sizes
- print result remains legible
- status is never communicated only by color

For reordering, support both:

- drag and drop
- Move Up / Move Down actions

---

# PART 20 — Testing

Test every visible map type.

For each map type confirm:

1. label matches the canonical name
2. wall map opens
3. correct builder loads
4. all steps work
5. draft saves
6. existing draft resumes
7. previous answers edit correctly
8. final visual map renders
9. final map reflects the entered data
10. Edit Map works
11. Print works
12. Rename works
13. Delete works
14. mobile view works
15. keyboard access works

Also test:

- no maps
- one saved map
- many saved maps
- incomplete draft
- save error
- render error
- refresh during builder
- return after sign-out/sign-in
- long map titles
- large maps
- printing large maps

---

# Acceptance Criteria

The Cartography Room is complete only when:

## Wall Maps

- [ ] Every visible map has a readable label.
- [ ] Each label exactly matches its canonical map name.
- [ ] Every map is clickable.
- [ ] No visible map leads to a dead end.
- [ ] Mobile users have an accessible way to select every map.

## Guided Building

- [ ] Every map has map-specific guided steps.
- [ ] Users see one manageable step at a time.
- [ ] Progress is visible.
- [ ] Drafts save.
- [ ] Users can return and continue.
- [ ] Answers remain editable.

## Final Maps

- [ ] Every map produces a visual result appropriate to its type.
- [ ] The result is not merely a text summary.
- [ ] Users can edit the finished map.
- [ ] Users can print it.
- [ ] Users can rename it.
- [ ] Users can delete it.
- [ ] Structured data remains available for future editing.

## Consistency

- [ ] Map names match everywhere.
- [ ] One registry controls map names and routes.
- [ ] Existing user maps are preserved.
- [ ] No placeholder or unsupported map appears active.
- [ ] The experience is simple and not overloaded with options.

---

# Final Experience Standard

The user should be able to:

1. enter the Cartography Room
2. understand the names of the maps on the wall
3. click the map they need
4. be guided through it one step at a time
5. see a complete visual outcome
6. make changes without starting over
7. print, rename, or delete it

The final experience should feel like Spark Estate is helping the user turn thoughts into a map they can actually see, understand, and use.
