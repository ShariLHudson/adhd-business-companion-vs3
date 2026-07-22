# Cartography Wall Map Order Correction & Routing Verification — Report

| Field | Value |
|-------|-------|
| **Date** | 2026-07-22 |
| **Prompt** | `docs/cartography/CARTOGRAPHY_WALL_MAP_ORDER_CORRECTION_CURSOR_PROMPT.md` |
| **Status** | Implemented |
| **Branch** | `deploy/companion-app-v3` |

## Root cause

Two earlier passes had left the registry **internally inconsistent**:

- `lib/cartographersStudio/mapDefinitions.ts` (source of truth for names/steps/builders) and `lib/cartographersStudio/atlas.ts` (Atlas teaching entries) were already in the order **Mind, Decision, Relationship, Process, Journey** — matching this prompt and the original `CARTOGRAPHY_ROOM_COMPLETION_REPORT.md`.
- `lib/cartographersStudio/wallMaps.ts` — the file that actually drives **wall render order, hotspot placement, and the mobile gallery** — still had the older order **Mind, Decision, Journey, Process, Relationship** (introduced in the prior "Wall Map Labels & Routing" pass), and its own regression test (`mapRegistry.test.ts`) asserted that stale order, masking the drift.

So the wall visually showed Relationship and Journey swapped relative to every other surface (Atlas, builder titles, gallery cards). No map opened the *wrong* builder — the connection graph itself (`wallMaps.ts` → `mapDefinitions.ts` → `MapEntryPanel`/`MapGuidedBuilder`/`MindMapDiscoveryInterview`) was already sound — but the **position metadata** for two of the ten maps was wrong, and the label was anchored to the **bottom** of each frame instead of the **top** the current prompt requires.

## What shipped

1. **Registry fix — `lib/cartographersStudio/wallMaps.ts`** (canonical wall order/routing registry):
   - Top row reordered to **Mind, Decision, Relationship (pos 3), Process, Journey (pos 5)**.
   - `CARTOGRAPHY_WALL_HOTSPOTS` desktop coordinates swapped so Relationship now renders at the physical 3rd wall slot (42%) and Journey at the 5th (66%) — matching the new left→right order in the actual scene image.
   - `assertWallMapRegistryComplete()` updated to assert the corrected order (this function already gates the registry and is exercised by tests).
2. **Label placement — `app/companion/cartographers-studio.css`**: the always-visible parchment label now anchors to the **top** of each `cartographers-wall-slot` (was previously anchored to the bottom, functioning as a placard beneath the frame). The frame hotspot's `inset` was flipped to match, so label + frame still form one contiguous clickable region with no visual gap.
3. **Tests**:
   - Updated `lib/cartographersStudio/mapRegistry.test.ts` order assertion to the corrected top row.
   - Added `lib/cartographersStudio/wallMapOrderAndRouting.test.ts` — locks Relationship at top-row position 3, Journey at top-row position 5, verifies hotspot left-to-right ordering matches position ordering per row, verifies the Relationship/Journey hotspot swap explicitly, and proves every one of the ten wall maps resolves to a real, active, non-placeholder map definition with its own distinct builder identity, non-empty route, print support, and (for guided-steps maps) at least one guided step.
4. **Doc hygiene**: `CARTOGRAPHY_WALL_MAP_LABELS_ROUTING_REPORT.md` annotated as superseded on this point so future readers aren't misled by the stale order it documented.

## Route audit (already sound — verified, not rebuilt)

This codebase does not use literal `/cartography/*` URL routes for the ten map builders — the whole Cartographer's Studio is a single client-state workspace (`VisualFocusWorkspacePanel.tsx`) that opens builders in place. Audited the full chain for all ten maps and found it already correctly wired (no changes needed beyond the order fix above):

- `CartographersStudioRoom` → `openWallMap(id)` → `onSelectWallMap(id)` → `VisualFocusWorkspacePanel.handleSelectWallMap` → `MapEntryPanel` (shows `definition.name`, `Begin My Map`) → `beginSelectedMap(id)`:
  - `mind-map` → `MindMapDiscoveryInterview` (dedicated discovery flow).
  - All other nine → `MapGuidedBuilder` with `getCartographyMapDefinition(id)` — each map type has its own guided steps, `resultRenderer`, and `visualFocusMode` (verified distinct per map in the new test).
- Frame image and wall-name label call the **same** `openWallMap(wall.id)` handler (`CartographersStudioRoom.tsx`) — no `href="#"`, no empty handlers found anywhere in `components/companion/cartographersStudio/`.
- Mobile gallery (`cartographers-mobile-gallery`) iterates the same `wallMapsInDisplayOrder()` registry used by the desktop wall — same order, same `openWallMap` handler.
- **Course Launch / + Branch overlay**: confirmed absent from the default room in code (`+ Branch` only appears inside `MindMapEditableCanvas`/`VisualFocusWorkspacePanel`'s tree editor, i.e. inside an active Mind Map, never over the default wall). No regression to fix here — prior work already removed it.
- **Saved maps**: no changes to `lib/visualFocus/store.ts` persistence, `VisualFocusMap` shape, or `localStorage` keys — existing saved maps are untouched.

## Files changed

| File | Change |
|---|---|
| `lib/cartographersStudio/wallMaps.ts` | Reordered top-row positions (Relationship #3, Journey #5); swapped hotspot coordinates; updated order assertion |
| `app/companion/cartographers-studio.css` | Wall label anchored to top of frame instead of bottom |
| `lib/cartographersStudio/mapRegistry.test.ts` | Updated top-row order assertion |
| `lib/cartographersStudio/wallMapOrderAndRouting.test.ts` | **New** — locks corrected order + proves every map routes to a distinct, real, non-placeholder builder |
| `docs/cartography/CARTOGRAPHY_WALL_MAP_LABELS_ROUTING_REPORT.md` | Annotated stale order line as superseded |
| `docs/cartography/CARTOGRAPHY_WALL_MAP_ORDER_CORRECTION_CURSOR_PROMPT.md` | Archived authoritative prompt |

**Canonical registry:** `lib/cartographersStudio/wallMaps.ts` (`cartographyWallMaps`, `CARTOGRAPHY_WALL_HOTSPOTS`) — drives wall render order, hotspot placement, and mobile gallery order. It is derived-consistent with `lib/cartographersStudio/mapDefinitions.ts` (names/steps/builder identity/route metadata) and `lib/cartographersStudio/atlas.ts` (teaching copy) — all three now agree on order and naming.

## Tests

```
npx vitest run lib/cartographersStudio
```

Result: **3 test files, 38 tests passed** (`mapRegistry.test.ts`, `cartographersStudioUx.test.ts`, new `wallMapOrderAndRouting.test.ts`).

## Verify in UI

1. Open Cartographer's Studio hub (empty of open workspace).
2. Confirm top row left→right: Mind Map, Decision Map, **Relationship Map**, Process Map, **Journey Map**. Bottom row unchanged: Timeline, Strategy, Opportunity, System, Priority.
3. Confirm each parchment label sits at the **top** of its frame (not below it), stays visible without hovering, and does not overlap a neighboring frame's label.
4. Click each frame image and each label — same builder opens (`MapEntryPanel` title matches the wall name; `Begin My Map` opens the correct guided builder or, for Mind Map, the Discovery interview).
5. Narrow the viewport — "Choose a map" mobile list shows the same ten names in the same corrected order and opens the same builders.
6. Confirm no "Course Launch" / "+ Branch" overlay appears over the default room wall (it only appears inside an open Mind Map's editable canvas).
7. Open an existing saved map from **Resume Previous Map** / **My Maps** — confirms saved maps were not affected by the registry change.

## Gaps / not touched (out of scope for this pass)

- `lib/visualThinkingStudio.ts` / `lib/visualThinkingStudio.test.ts` — a separate, older chat-intent recommendation surface (`project-map`/`hierarchy-tree`/`flowchart` planned types) has 16 pre-existing failing tests unrelated to the wall registry or this prompt. Not modified — flagged for a separate pass so it isn't mixed into this narrow correction.
- No literal Next.js routes exist for the ten map types (e.g. `/cartography/mind-map`); the whole studio is a single in-place client workspace. This matches the existing architecture and was preserved rather than introduced as a new routing layer, per "adapt routes to the actual codebase" in the prompt.
- The separate "center map" table hotspot (Mind Map shortcut in the middle of the room, distinct from the ten wall frames) was left unchanged — it is an additional affordance, not one of the ten required wall maps.

## Suggested commit message

```
fix(cartography): correct wall order (Relationship #3, Journey #5) and top-anchor wall labels

- lib/cartographersStudio/wallMaps.ts: reorder top row, swap hotspot
  coordinates, update order assertion
- app/companion/cartographers-studio.css: anchor wall label to top of
  frame instead of bottom
- lib/cartographersStudio/mapRegistry.test.ts: update order assertion
- lib/cartographersStudio/wallMapOrderAndRouting.test.ts: new regression
  coverage for order + non-placeholder routing
- docs/cartography: archive prompt + report
```
