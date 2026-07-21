# 099 — Blueprint Builder, Grouped Maps, and Connected Work (Foundation)

**Final Decision:** `BLUEPRINT BUILDER AND CONNECTED WORK PARTIALLY COMPLETE`  
**Reason:** Foundation engine + Estate map/connection UX shipped with contract tests. Browser certification and full Calendar / Visual Thinking write UX deferred.  
**Companion (framework blockers):** [`099_BLUEPRINT_FRAMEWORK_BLOCKERS.md`](./099_BLUEPRINT_FRAMEWORK_BLOCKERS.md) — separate concern; keep both docs.  
**Authority:** Universal Work Engine · Create Experience · Estate usability (no admin dashboard)

---

## Scope delivered (this pass)

| Area | Status |
|------|--------|
| Content isolation by `workId` + `sectionId` | Certified + committed (`fix(create): isolate content by work and section identity`) |
| `BlueprintGroup` model + Event group pack | Done — UWE-owned |
| Configurable flat/grouped threshold (default 12) | Done |
| Collapsible Workshop Map (Event first) | Done — Estate Create UI |
| Structure edit APIs (add/rename/duplicate/soft-delete/undo/move/group) | Done — UWE |
| Save structure as blueprint + create Work with version pin | Done |
| Relationships: section/group sources + richer targets | Done |
| Quiet `Connected to…` disclosure (Project first) | Done — Calendar/VT stubs honest |
| Contract tests | Done (`blueprintBuilder.cert.test.ts`) |
| Browser certification | **Not run** |

---

## Phase 1 — Content isolation (root cause)

**Symptom:** Workshop Map label updated to the selected section, but the Current Focus textarea kept the previous section’s text.

**Root cause:**

1. Editor draft/recovery was not rebound strictly on `workId::sectionId`.
2. Failed-save restore could re-apply draft onto the wrong Focus when selection changed mid-flight.

**Fix:**

- Seed from section-scoped recovery or that section’s `savedContent` only (`lib/currentFocus/sectionEditorContent.ts`).
- Rebind Current Focus on identity change (`CurrentFocusInteraction.tsx`).
- Lock failed-save ownership at submit (`CreateEstateWorkingPanel.tsx`).

**Certification:** `lib/currentFocus/sectionEditorContent.test.ts`.

---

## Phase 2 — Grouped / collapsible maps

**Owner:** `lib/universalWorkEngine/blueprints/mapGrouping.ts` + Event pack  
`lib/universalWorkEngine/packages/eventPlan/eventPlanMapGroups.ts`

Event groups (aligned to existing section IDs):

1. Foundation  
2. Planning  
3. Program  
4. Promotion  
5. Event Day  
6. After the Event  

**Rule:** `groupMapWhenSectionCount >= threshold` (default **12**). Short maps (e.g. Marketing Campaign) stay flat.

**UI:** `components/companion/GroupedWorkshopMap.tsx` — collapsible headers, `k of n complete`, active section’s group opens, Expand/Collapse all under secondary disclosure, `aria-expanded` button headers. Collapse never mutates content/status.

---

## Phases 3–5 — Structure editing

**Owner:** `lib/universalWorkEngine/blueprints/structureEditing.ts`

Stable `sectionId` / `groupId`. Moves change order only. Soft-delete + in-session undo. Structure edits on Spark/system blueprints bump version via registry (new version), never silently rewrite pinned Works.

Guided Work continues to edit `sectionContent` only. Blueprint Builder structure ops are UWE APIs; Estate map remains click-to-focus for Guided writing.

---

## Phases 6–8 — Save / version / Create from blueprint

- `saveStructureAsBlueprint` — Create workshop structure → UWE registry (name + optional description; content empty unless `retainSectionDefaults`).
- `initializeWorkFromBlueprint` — one Work ID, empty (or default) section content, stores `sourceBlueprintId` + `blueprintVersion`.
- Later structural bump does **not** mutate pinned Work content; `previewBlueprintStructureUpdate` surfaces added/removed/renamed/moved for intentional adopt.

---

## Phases 9–13 — Connections

**Owner:** `lib/universalWorkEngine/cartography/workRelationships.ts`

- `sourceEntityType`: `work` | `group` | `section`
- Targets include: `project`, `work`, `blueprint`, `cartography_node`, `calendar-event`, `visual-thinking`, `task`, `research`, `file`, `journal-entry`, `evidence`, `person`, `goal`
- Dedupe on link; unlink removes edge only (never deletes target)

**UX:** `ConnectedWorkDisclosure` near Current Focus / When you're ready — list + progressive Add connection. Project uses existing bridge patterns; Calendar / Visual Thinking show honest “not connected yet” stubs.

---

## Explicit gaps (not foundation blockers)

| Gap | Notes |
|-----|--------|
| Full Calendar write UX | Relationship record + stub only |
| Visual Thinking map sync UI | Stub only |
| Full My Blueprints library chrome | Deferred |
| Drag-and-drop reorder | Move up/down APIs only |
| Browser certification | Not run this pass |
| Marketing Plan | Out of scope |

---

## Architecture (no third blueprint system)

```
UWE blueprints/     → structure, groups, versions, save/create
UWE section runtime → sectionContent keyed by sectionId
UWE workRelationships → Connected to…
Create Estate UI    → GroupedWorkshopMap + Focus editor + disclosure
```

Create V2 save-structure actions bridge into UWE registry. Do not grow a private Create-only blueprint runtime.

---

## Tests

| Suite | Result |
|-------|--------|
| `blueprintBuilder.cert.test.ts` | Pass (grouping, structure/undo, save/create/version, relationships, Event groups) |
| `sectionEditorContent.test.ts` | Pass (isolation) |
| Broader UWE / Event / Create batch | See commit notes / CI |

### Reusable certification contract (future Work Types)

1. Long maps (≥ threshold) with `mapGroups` → grouped; short → flat.  
2. Collapse/expand never mutates `sectionContent` or completion.  
3. Structure ops keep stable IDs; soft-delete + undo restore metadata.  
4. Save structure → registry; create Work pins version; empty content by default.  
5. Blueprint version bump does not overwrite existing Work content.  
6. Relationships dedupe; unlink ≠ delete target.  
7. Editor seeds only from `workId::sectionId` identity.

---

## Commits (suggested / applied order)

1. `fix(create): isolate content by work and section identity`  
2. Grouped maps + Event group pack + map UI  
3. Structure edit APIs  
4. Save structure / version pin  
5. Connections + Connected to…  
6. Tests + this report  

**Staging rule:** narrow paths only — never `git add .`.
