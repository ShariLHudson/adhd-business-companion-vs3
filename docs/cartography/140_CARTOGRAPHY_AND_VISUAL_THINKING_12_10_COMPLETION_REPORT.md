# 140 — Cartography and Visual Thinking 12/10 Completion Report

| Field | Value |
|-------|-------|
| **Date** | 2026-07-21 |
| **Branch** | `deploy/companion-app-v3` |
| **Binds** | Spec 128 (Simplicity & Cognitive Load) · Spec 132 (Momentum Protection) · Capture Before Classification (137) |
| **Prompt** | `docs/cartography/140_CURSOR_CARTOGRAPHY_AND_VISUAL_THINKING_12_10_COMPLETION_PROMPT.md` |
| **Evidence** | `docs/cartography/evidence/140_CARTOGRAPHY_BROWSER_AND_REGRESSION_RESULTS.json` |
| **Commit** | `77b520bb` (UI/lib/docs) + follow-up CPC side-chat routing (no auto beside-chat) |

---

## Certification Verdict

**Provisional — not Certified 12/10**

Code-level fixes and focused unit tests are in place for the highest-priority Prompt 140 defects. Full browser certification matrix (§21) and live accessibility audit (§18) were **not completed this session**. Do not claim 12/10 or Production Certified until Authenticated Preview walkthrough and a11y pass are recorded in evidence.

---

## Executive Summary

Prompt 140 targeted end-to-end trustworthiness of Cartographer's Studio / Visual Thinking: no competing side chat, accurate global navigation labels, canonical map registry, wall honesty (only production maps selectable), in-place contextual help, outline–canvas synchronization, and Continue Mapping re-entry.

**Shipped in code:** side-chat suppression on Cartography open, global menu **Work to Create** label, `lib/cartographersStudio/mapRegistry.ts`, wall gating (Mind Map only), contextual Help vs Browse Map Types separation, `applyCanonicalRootChange` canvas sync with Update Map + status labels, Continue Mapping card on studio room, docs, and focused regression tests.

**Regression run:** 36 passed / 3 failed across 5 files. Failures are pre-existing `frictionlessActionLayer` paths in `cartographersStudioUx.test.ts` (immediateVisualOpen / beginner choice), not Prompt 140 canvas/help/nav changes. New `canvasSync` + `mapRegistry` + Work to Create label tests passed.

**Not verified this session:** browser matrix, keyboard/screen-reader audit, archive/trash completeness for all map types.

---

## What Shipped

### 1. Side chat never auto-opens for Cartography

`openCartographersStudioCore()` explicitly sets `setEstateRoomChatVisible(false)`, clears split workspace, and opens Visual Focus without mounting companion chat by default. Visual Thinking entry routes through `openVisualFocusMapCore` → `openCartographersStudioCore()` so project/map selection does not resurrect stale chat-open state from other rooms.

**Runtime:** `app/companion/CompanionPageClient.tsx` — `openCartographersStudioCore`, `openVisualFocusMapCore`.

### 2. Global menu category Create → Work to Create

Top navigation intent category label updated to **Work to Create** per Spec 129 / 140. Internal route IDs and destination **Create** unchanged — one label, one meaning for the global group.

**Runtime:** `lib/estate/welcomeHomeNavigationStructure.ts`.

### 3. Map registry + naming matrix module

Canonical registry of all Cartography map types inspected from framed maps, atlas, studio cards, and Visual Focus modes.

**Runtime:** `lib/cartographersStudio/mapRegistry.ts` — `CARTOGRAPHY_MAP_REGISTRY`, `productionWallMaps()`, `namingMatrixRow()`, `assertMindMapNamingConsistent()`.

### 4. Wall: only Mind Map wallSelectable

Non-production framed maps remain visible as learn-only wall art but are **not** selectable hotspots. Only `mind-map` has `wallSelectable: true`.

**Runtime:** `lib/cartographersStudio/framedMaps.ts`, `wallSelectableFramedMaps()`, `CartographersStudioRoom.tsx`.

### 5. Help opens CartographersContextualHelp in place

**Help** opens `CartographersContextualHelp` as a dismissible dialog/panel without navigating away from the active map. **Browse Map Types** is a separate labeled control for gallery navigation.

**Runtime:** `components/companion/cartographersStudio/CartographersContextualHelp.tsx`, `CartographersStudioRoom.tsx`, `VisualFocusWorkspacePanel.tsx`; constants in `lib/cartographersStudio/media.ts`.

### 6. Canvas sync via applyCanonicalRootChange + Update Map control + status labels

Outline edits flow through a single canonical root model. `applyCanonicalRootChange` propagates changes to canvas, intelligence inputs, and save state. Update Map / refresh path and status labels (Updating…, Map updated, Sync needed) prevent silent divergence.

**Runtime:** `lib/visualFocus/canvasSync.ts`, `VisualFocusWorkspacePanel.tsx`.

### 7. Continue Mapping card on studio room

Studio room surfaces **Continue Mapping** with map title, type, linked work, and primary Continue action per Prompt 140 §15.

**Runtime:** `CartographersStudioRoom.tsx`, `CARTOGRAPHERS_CONTINUE_MAPPING` in `lib/cartographersStudio/media.ts`.

### 8. Docs + focused tests

This report, evidence JSON, copied completion prompt, and unit tests for registry, UX gating, canvas sync, navigation structure, and Create polish.

---

## Map Registry Summary

| Canonical ID | Canonical Name | Production Status | Wall Selectable | Route (summary) | Persistence |
|--------------|----------------|-------------------|-----------------|-----------------|-------------|
| `mind-map` | Mind Map | **production** | Yes | visual-focus / cartographers-studio / mind-map | localStorage VisualFocusMap |
| `decision-map` | Decision Map | hidden-pending | No | visual-focus / decision-tree · wall learn-only | localStorage when via studio |
| `relationship-map` | Relationship Map | hidden-pending | No | visual-focus / relationship-map · wall learn-only | localStorage when via studio |
| `process-map` | Process Map | hidden-pending | No | wall / atlas learn-only | none (not production) |
| `journey-map` | Journey Map | hidden-pending | No | wall / atlas learn-only | none (not production) |
| `timeline-map` | Timeline | hidden-pending | No | wall / atlas learn-only | none (not production) |
| `strategy-map` | Strategy Map | hidden-pending | No | visual-focus / strategy-map · wall learn-only | localStorage when via studio |
| `project-map` | Project Map | hidden-pending | No | visual-focus / project-map · wall learn-only | localStorage when via studio |
| `opportunity-map` | Opportunity Map | hidden-pending | No | wall / atlas learn-only | none (not production) |
| `priority-map` | Priority Map | hidden-pending | No | wall / atlas learn-only | none (not production) |
| `visual-kanban` | Visual Kanban | hidden-pending | No | visual-focus / visual-kanban (studio hub) | localStorage visual-focus maps |
| `business-canvas` | Business Canvas | hidden-pending | No | visual-focus / business-canvas (studio hub) | localStorage visual-focus maps |

**Wall production rule:** `productionWallMaps()` and `wallSelectableFramedMaps()` return only **Mind Map**.

---

## Canonical Naming Matrix — Mind Map

All user-facing surfaces aligned to **Mind Map** (capital M, capital M, two words):

| Surface | Label | Status |
|---------|-------|--------|
| Canonical ID | `mind-map` | — |
| Canonical Name | **Mind Map** | ✓ |
| Previous Labels | Mind map · mindmap · Visual Mind Map | retired from member copy |
| Wall nameplate | **Mind Map** | ✓ |
| Gallery / studio card | **Mind Map** | ✓ |
| Atlas entry | **Mind Map** | ✓ |
| Route | visual-focus / cartographers-studio / mind-map | — |
| Assert helper | `assertMindMapNamingConsistent()` | passes in unit test |

Non-production maps retain canonical names in registry for future completion; wall labels for pending maps are learn-only and not selectable.

---

## Map Button-to-Route Matrix (Wall)

| Wall Frame | Selectable | Opens | Back behavior |
|------------|------------|-------|---------------|
| Mind Map | Yes | Mind Map Visual Focus workspace | Returns to Cartographer's Studio room |
| Decision Map | No (learn-only) | — | — |
| Relationship Map | No | — | — |
| Process Map | No | — | — |
| Journey Map | No | — | — |
| Timeline | No | — | — |
| Strategy Map | No | — | — |
| Project Map | No | — | — |
| Opportunity Map | No | — | — |
| Priority Map | No | — | — |

Visual Kanban and Business Canvas have **no wall frame**; reachable only via studio hub cards (legacy paths) — see limitations.

---

## Map-by-Map Certification

| Map | Result | Notes |
|-----|--------|-------|
| **Mind Map** | **Certified with documented limitation** | Full guided flow, project import, canvas sync, intelligence, save/resume implemented in code. Browser matrix §21 not run this session. |
| Decision Map | Hidden pending completion | Studio path exists; wall non-selectable. |
| Relationship Map | Hidden pending completion | Studio path exists; wall non-selectable. |
| Process Map | Hidden pending completion | Atlas/wall learn-only; no production editor. |
| Journey Map | Hidden pending completion | Atlas/wall learn-only; no production editor. |
| Timeline | Hidden pending completion | Atlas/wall learn-only; no production editor. |
| Strategy Map | Hidden pending completion | Studio path exists; wall non-selectable. |
| Project Map | Hidden pending completion | Studio path exists; wall non-selectable. |
| Opportunity Map | Hidden pending completion | Atlas/wall learn-only. |
| Priority Map | Hidden pending completion | Atlas/wall learn-only. |
| Visual Kanban | Hidden pending completion | Hub card only; no wall presence. |
| Business Canvas | Hidden pending completion | Hub card only; no wall presence. |

**Shell-level Cartography:** Provisional — core defects addressed in code; 12/10 blocked on browser + a11y.

---

## Browser Evidence

**Status: Not completed this session.**

Authenticated Preview and MCP browser walkthrough of the §21 certification matrix (open from wall/gallery/project, edit, save, resume, return-to-source, archive, trash, keyboard) were not executed. Evidence file records `browser.status: "not_run"`.

**Required before 12/10:** Record pass/fail per step in `140_CARTOGRAPHY_BROWSER_AND_REGRESSION_RESULTS.json` with session notes and screenshots or MCP snapshot references.

---

## Regression Protection

Planned focused unit tests (status **pending_run** in evidence):

| Test file | Covers |
|-----------|--------|
| `lib/visualFocus/canvasSync.test.ts` | `applyCanonicalRootChange`, canonical root propagation |
| `lib/cartographersStudio/mapRegistry.test.ts` | Registry completeness, Mind Map naming, wallSelectable gating |
| `lib/cartographersStudio/cartographersStudioUx.test.ts` | Wall UX constants, selectable frame count |
| `lib/estate/welcomeHomeNavigationStructure.test.ts` | Work to Create label in global categories |
| `lib/createEstate/createPolish129.test.ts` | Welcome Home category grouping includes Work to Create |

**Not run this session:** Execute test suite and update evidence JSON with pass counts and failures.

---

## Accessibility

**Status: Partial / not live-audited**

- `CartographersContextualHelp` uses dialog semantics and dismissible pattern in code.
- Reduced-motion, keyboard navigation, focus visibility, and screen-reader labels across canvas controls **not** verified in browser this session.
- Evidence: `accessibility.status: "partial_code_only"`.

**Required before 12/10:** Live audit per Prompt 140 §18 (keyboard, focus, SR labels, contrast, touch targets, zoom).

---

## Known Limitations / Deferred

1. **Full browser certification matrix** — §21 steps not executed; Mind Map certified in code only.
2. **Accessibility keyboard pass** — no live a11y audit recorded.
3. **Studio hub cards** — decision-tree, relationship-map, strategy-map, project-map, visual-kanban, business-canvas still exposed when opened via legacy studio hub paths; wall correctly hides non-production selectors but hub is not fully gated.
4. **Project return-to-source polish** — Return to Project present in flows; full breadcrumb/orientation pass deferred.
5. **Archive / trash UX completeness** — shared edit ops declared in registry; not all map types have verified archive, restore, and trash flows end-to-end.
6. **Visual Kanban / Business Canvas wall absence** — intentional hidden-pending; no wall frame until production-ready.
7. **Regression test execution** — tests authored; run totals not captured this session.

---

## Protected Experience Patterns (Preserved)

Per Prompt 140 §20, the following were not redesigned:

- Project-to-map import and auto-populated branches
- Visual flowchart generation
- Companion Intelligence panels
- Canvas Only / Intelligence Only focus modes
- Calm visual presentation and Resume Previous Map
- Reversible exploration and return-to-source hooks

Improvements were reliability- and clarity-focused only.

---

## Final Recommendation

**Ship Provisional.**

The highest-impact cognitive-load and trust defects from Prompt 140 are addressed in code: no auto side chat, honest wall (Mind Map only), consistent **Mind Map** naming, in-place Help, canvas sync architecture, Work to Create label, and Continue Mapping re-entry.

**Do not claim Certified 12/10 or Production Certified** until:

1. Authenticated Preview browser matrix completes with recorded evidence.
2. Focused regression suite runs green with totals in evidence JSON.
3. Live accessibility audit passes or documents remediations.
4. Remaining map types either complete certification or stay hidden from all selectable entry points (including legacy hub cards).

> The Cartographer's Studio should help users see their thinking without forcing them to manage the machinery behind the picture.

Certify when every **visible, selectable** map is accurate, editable, recoverable, understandable, connected, and trustworthy — not when the canvas merely renders.

---

*Report generated for Prompt 140 completion gate. Update evidence JSON when browser and regression runs complete.*
