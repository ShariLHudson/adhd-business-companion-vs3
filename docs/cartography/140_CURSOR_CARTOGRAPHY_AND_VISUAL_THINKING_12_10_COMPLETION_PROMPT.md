# 140 — Cursor Cartography and Visual Thinking 12/10 Completion Prompt

## Mission

Complete and certify the Cartographer's Studio / Visual Thinking experience as a fully functional, editable, trustworthy, ADHD-friendly part of Spark Estate.

This is not a cosmetic pass.

The Cartographer's Studio must work end to end across Projects, Create, Work, Visual Thinking, Cartography maps, Companion Intelligence, Estate navigation, saved maps, map editing, map recovery, map naming, wall display, and user guidance.

Do not redesign the successful core experience unless required to fix a defect, inconsistency, accessibility issue, or cognitive-load problem.

Protect the parts that already work:

- Project-to-map import
- Auto-populated branches
- Visual flowchart generation
- Companion Intelligence
- Canvas Only / Intelligence Only focus modes
- Project relationship awareness
- Calm visual presentation
- Resume Previous Map

The goal is to make every Cartography map accurate, editable, recoverable, understandable, and production-ready.

---

# 1. Remove the Automatic Side Chat

## Current Problem

Opening Cartography automatically opens a side chat window.

This is not intended behavior.

It reduces the available visual workspace, adds cognitive load, and competes with the map-making experience.

## Required Behavior

When the Cartographer's Studio opens:

- do not auto-open a side chat;
- do not mount a companion chat panel by default;
- do not preserve stale chat-open state from another room;
- do not open chat merely because a project or map is selected;
- give the map canvas and map controls the full intended working area.

Shari may still be available through an explicit user action such as Ask Shari, Need Help, or Companion Guidance.

That support must remain closed until the user intentionally opens it.

Opening or closing Shari must never alter, reset, or discard map state.

## Certification

Verify Cartography opens with:

- map workspace visible;
- no side chat;
- no duplicate shell;
- no overlay collision;
- no reduced canvas width caused by hidden chat state.

---

# 2. Rename the Global Menu Label

Rename the top menu button currently labeled `Create` to the exact user-facing label:

**Work to Create**

Update this label consistently wherever it represents the same global navigation group.

Do not rename internal route IDs, enums, database keys, or implementation contracts unless technically required.

## Consistency Rule

One label must have one meaning.

The label must not switch unpredictably between Create, Work, Welcome Home, Projects, or Cartography.

The current destination should be visibly indicated without changing the fundamental meaning of the menu.

---

# 3. Audit Every Cartography Map

Create a complete registry of every map that appears in:

- the Cartographer's Studio;
- map type gallery;
- maps displayed on the studio wall;
- destination gallery;
- project visualization entry points;
- saved map browser;
- any legacy visual-thinking route.

For every map, document:

- canonical map ID;
- canonical user-facing name;
- wall button name;
- gallery card name;
- route;
- intended purpose;
- required steps;
- supported editing operations;
- project/work relationship behavior;
- persistence store;
- current implementation status.

Do not guess. Inspect the repository and current runtime.

---

# 4. Make Map Names Accurate and Consistent

The name displayed on the wall, button, gallery, toolbar, saved maps, project links, breadcrumbs, Companion Intelligence, export titles, and print titles must match the canonical name.

No map may have one name on the wall, another in the gallery, and a third in the toolbar.

Internal aliases may remain for backward compatibility, but user-facing labels must be consistent.

Produce a canonical naming matrix:

| Canonical ID | Canonical Name | Previous Labels | Final Wall Label | Final Gallery Label | Route | Status |

Correct spelling, capitalization, singular/plural usage, and trademark usage where relevant.

---

# 5. Every Wall Button Must Open the Correct Map

For every map button shown on the Cartographer's Studio wall:

- verify it is clickable;
- verify it opens the correct map;
- verify it does not open an unrelated map;
- verify it does not route to a blank screen;
- verify it does not open a legacy implementation;
- verify its selected state is visible;
- verify Back returns to the correct Cartography location;
- verify reopening resumes the correct saved map when appropriate.

No decorative wall button may look active unless it works.

If a map is not production-ready, hide it rather than exposing a broken or placeholder experience.

---

# 6. Complete Every Map-Making Workflow

Every supported map must walk the user through the complete process in calm, understandable steps.

Each map must define:

1. What the map helps the user understand
2. What source information it can use
3. The first question
4. The guided sequence
5. How branches, nodes, or items are added
6. How relationships are created
7. How the visual is generated
8. How the map is edited
9. How the map is saved
10. How the user resumes later
11. How it connects to Projects or Work
12. How it is exported or shared, if supported
13. How it is archived or deleted
14. How the user returns to the source Project or Work

The user should never land on a map and wonder what to do first, how to add something, how to change it, whether it saved, or how to get back.

---

# 7. Use One Question and One Focus at a Time

Protect the Spark Estate standard:

**One Question. One Focus. Everything Else Can Wait.**

For complex maps:

- guide one decision at a time;
- progressively reveal advanced options;
- keep full structure secondary;
- collapse large lists by default;
- group more than five items into meaningful categories;
- auto-expand only the active group;
- never confront the user with a wall of unfinished nodes.

If a map has more than five major branches, group them into logical expandable categories.

---

# 8. Fix Canvas and Outline Synchronization

## Current Defect

Adding or editing a branch in the outline updates Companion Intelligence but does not refresh the visual canvas.

This creates silent data drift.

## Required Architecture

The outline, canvas, Companion Intelligence, saved map, and linked Project must derive from one canonical map model.

There must not be separate unsynchronized representations.

Whenever the user adds, renames, deletes, moves, reparents, or relinks a node—or imports or removes Project content—the following must update coherently:

- outline;
- visual canvas;
- relationship lines;
- counts;
- summary;
- risks;
- opportunities;
- recommendations;
- saved state;
- project relationship metadata.

Prefer live synchronization.

If live synchronization is technically unsafe, provide an obvious primary control:

**Update Map** or **Refresh Canvas**

The system must clearly indicate:

- Map updated
- Updating…
- Changes not yet reflected

Never allow silent divergence.

`Resume Previous Map` must resume the latest saved map state. It must not substitute for refreshing the current canvas.

---

# 9. Add Complete Editing Support

Every production map must support appropriate editing operations.

At minimum:

- add node;
- add child or sub-branch;
- rename;
- edit description;
- move or reorder;
- change parent;
- create relationship;
- edit relationship label;
- delete;
- undo;
- restore;
- save;
- duplicate;
- archive;
- move to Trash.

Where spatial editing is supported, also verify drag, resize, pan, zoom, fit to view, and keyboard movement where appropriate.

No edit may create a duplicate map or orphaned node unless the user explicitly duplicates it.

---

# 10. Add Safe Delete, Archive, and Recovery

Users must be able to clean up maps and map content.

Provide:

- delete-node confirmation when destructive;
- archive map;
- move map to Trash;
- restore map;
- undo recent deletion;
- permanent deletion only after explicit confirmation.

Deleting a map must not automatically delete its linked Project or Work.

Deleting a Project or Work must not silently destroy a map without warning and a clear relationship decision.

---

# 11. Fix the Help Control

## Current Defect

The `Help` link navigates to the map type gallery and removes the user from the active map.

## Required Behavior

A control labeled `Help` must open contextual help for the current map.

It must not navigate away.

Contextual help should explain:

- what this map is for;
- what the current step means;
- how to add or edit;
- how to update the canvas;
- how saving works;
- how to return to the linked Project;
- what Companion Intelligence is showing.

Use progressive disclosure.

The help panel must be dismissible and preserve all current map state.

If navigation to the gallery is still needed, label that control accurately, such as `Browse Map Types`, `Choose Another Map`, or `Map Gallery`.

Never label navigation as Help.

---

# 12. Project and Cartography Relationship

Projects and Cartography are directly connected. Preserve and certify this relationship.

## From Projects

- `Visualize This` opens the correct Project in Cartography;
- project sections become map branches;
- project title is preserved;
- an existing map is resumed rather than duplicated;
- newly added Project sections can be synchronized;
- newly added map branches can optionally be linked back to Project structure;
- the user can return to the exact Project.

## From Cartography

- show the linked Project clearly;
- show a clear `Return to Project` action;
- preserve project ID and current project context;
- do not expose raw internal IDs;
- do not create a second Project.

When map additions could become Project tasks or sections, ask:

> Add this to the Project too?

Options:

- Add to Project
- Keep only in Map
- Ask me later

Do not silently write structural changes back to the Project unless the behavior is already explicitly governed and expected.

---

# 13. Companion Intelligence Must Stay Accurate

Companion Intelligence may include:

- Business Summary
- Key Relationships
- Patterns
- Risks
- Opportunities
- Recommendations

Each output must reflect the current canonical map.

It must update when the map changes.

Do not display stale counts, stale branches, generic placeholder insights, unsupported conclusions, or contradictory summaries.

Clearly distinguish observed map facts, inferred patterns, and suggested next steps.

If the map has insufficient information, say so honestly.

---

# 14. Map Status and Save Truthfulness

Map states must be accurate:

- Saved
- Saving…
- Unsaved Changes
- Updating Map…
- Map Updated
- Sync Needed
- Error Saving

Do not show `Unsaved Changes` unless the user has actual unsaved edits.

Autosave should be reliable where supported.

Users should never wonder whether their visual thinking was preserved.

---

# 15. Continue and Recent Maps

Cartography must provide an immediate re-entry experience.

Show:

## Continue Mapping

- map title;
- map type;
- linked Project or Work;
- current focus;
- last edited;
- one primary Continue button.

Then show Recent Maps.

Do not hide the only or most recent map behind nested accordions.

No map should become orphaned or difficult to find.

---

# 16. Empty States

Every empty state must explain what to do.

Examples:

- No saved maps yet
- No linked Project yet
- No relationships yet
- No Companion Intelligence yet
- No branches added yet

Provide one helpful next action.

Do not render empty labels such as `Connected to…`, `Related Work…`, or `Intelligence…` with nothing underneath.

---

# 17. Navigation and Orientation

At all times, the user should know:

- I am in the Cartographer's Studio;
- which map is open;
- which Project or Work it belongs to;
- whether it is saved;
- how to return;
- how to get help;
- how to choose another map.

Do not use changing global menu labels as the only orientation cue.

Use clear breadcrumbs or contextual labels where appropriate.

---

# 18. Visual and Accessibility Standards

Verify:

- large readable controls;
- high contrast over all map backgrounds;
- keyboard navigation;
- visible focus;
- screen-reader labels;
- reduced-motion support;
- zoom controls;
- touch targets;
- text resizing;
- no reliance on color alone;
- no visual collisions;
- no clipped map labels;
- no unreadable relationship lines;
- no automatic sounds.

Canvas Only and Intelligence Only must remain available and functional.

Add or retain a balanced combined view only if it remains readable.

---

# 19. Performance and Reliability

Audit:

- hydration errors;
- stale state;
- race conditions;
- double-click requirements;
- delayed canvas generation;
- large-map performance;
- duplicate node generation;
- route-state loss;
- resume reliability;
- browser console errors.

No primary Cartography action should require a second click.

No map should disappear because of navigation.

---

# 20. Preserve Protected Experience Patterns

Do not redesign these unless necessary:

- project auto-import;
- clear flowchart;
- Companion Intelligence;
- Canvas Only;
- Intelligence Only;
- calm visual environment;
- one-focus guidance;
- reversible exploration;
- return-to-source behavior.

Improve reliability and clarity without replacing successful patterns.

---

# 21. Full Browser Certification Matrix

Test every supported map type through:

1. Open from wall
2. Open from gallery
3. Open from Projects
4. Start from empty state
5. Add content
6. Add sub-branch
7. Rename
8. Move or reorder
9. Edit relationship
10. Delete
11. Undo
12. Save
13. Refresh canvas
14. Verify Companion Intelligence updates
15. Leave and resume
16. Return to Project or Work
17. Archive
18. Restore
19. Move to Trash
20. Keyboard and accessibility behavior

For maps not supporting an operation by design, document the reason.

---

# 22. Map-by-Map Certification

Do not certify Cartography only at the shell level.

Each map type must receive its own result:

- Production Certified
- Certified with documented limitation
- Hidden pending completion
- Failed certification

Broken or incomplete maps must not remain visibly selectable.

---

# 23. Regression Protection

Run regressions for:

- Projects
- Create
- Universal Work Engine
- relationships
- Estate navigation
- map aliases
- return-to-source
- save and recovery
- Companion Intelligence
- accessibility
- reduced motion
- global menu

Preserve unrelated WIP.

Do not use `git add .`.

---

# 24. Required Deliverables

Produce:

1. Cartography implementation report
2. Complete map registry
3. Canonical naming matrix
4. Map button-to-route matrix
5. Map-by-map certification table
6. Browser evidence
7. Regression totals
8. Accessibility results
9. Known limitations
10. Final recommendation

Recommended report path:

`docs/cartography/140_CARTOGRAPHY_AND_VISUAL_THINKING_12_10_COMPLETION_REPORT.md`

Recommended evidence path:

`docs/cartography/evidence/140_CARTOGRAPHY_BROWSER_AND_REGRESSION_RESULTS.json`

---

# Final Certification Requirements

Cartography may be certified only when:

- the side chat never auto-opens;
- `Create` is renamed to `Work to Create` as specified;
- every visible map name is correct and consistent;
- every visible wall button opens the correct working map;
- every production map has a complete guided flow;
- maps can be added to, edited, renamed, reorganized, saved, archived, deleted, restored, and resumed as appropriate;
- outline and canvas cannot silently drift apart;
- Companion Intelligence reflects the current map;
- Help opens actual contextual help;
- Project relationships remain intact;
- return-to-source works;
- no raw IDs or developer terminology appear;
- no broken or placeholder map remains visible;
- browser, accessibility, and regression certification pass.

---

# Final Product Principle

> The Cartographer's Studio should help users see their thinking without forcing them to manage the machinery behind the picture.

The user should feel:

- I can see how this fits together.
- I can change it safely.
- The picture always matches my work.
- Nothing disappeared.
- I know what to do next.
- I can return to my Project whenever I am ready.

Do not certify the Cartographer's Studio because the canvas renders.

Certify it only when every map is accurate, editable, recoverable, understandable, connected, and trustworthy.
