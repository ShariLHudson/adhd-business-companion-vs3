# 098 — Create Section Navigation and Document Assembly Report

**Status:** Partially complete (unit + Event foundation certified; browser certification not run)  
**Branch:** `deploy/companion-app-v3`  
**UWE foundation:** `834646b9` · tag `milestone/universal-work-engine-foundation`

---

## Root cause

Workshop Map clicks correctly wrote `CreateWorkflowState.activeSectionId` via `openWorkshopMapSection` → `setWorkspaceV2ActiveSection`.

Current Focus / editor did **not** re-resolve because `CreateEstateWorkingPanel` memoized `canonicalFocus` **without** `workflow.activeSectionId` in the dependency list. The map highlighted the new section while the editor stayed on the prior/first section (e.g. Introduction).

Secondary gaps:

- Editor draft seeded from recovery buffer / empty — not from saved `sectionContent`
- `workspaceCurrentFocus` / runtime `focusSectionId` not synced from `activeSectionId` on map open
- No universal Complete It Now assembler

---

## Authoritative active-section owner

**`CreateWorkflowState.activeSectionId`**, selected through Universal Work Engine:

- `selectWorkSection` / `openWorkshopMapSection`
- `resolveActiveSectionId` / `getActiveWorkSection`
- Current Focus derives via `focusFromActiveSection` in `resolveCanonicalFocus.ts`

`workspaceCurrentFocus` and runtime `focusSectionId` are mirrors, not competing masters.

---

## Shared section runtime

| API | Role |
|-----|------|
| `lib/universalWorkEngine/sectionRuntime/universalSectionRuntime.ts` | select / update / complete / reopen / facade |
| `lib/universalWorkEngine/sectionRuntime/assembleWork.ts` | validate + assemble + stale marking |
| `createUniversalSectionRuntime(workflow)` | 098-shaped facade |

---

## Editor-selection contract

1. Map click → `selectWorkSection` sets `activeSectionId` + `workspaceCurrentFocus.sectionId`
2. Panel memo depends on `activeSectionId` (+ active section content)
3. Resolver returns `focusId: section:{id}`, `savedContent` from that section
4. Editor remount key: `creationId:sectionId`
5. Draft seeds: recovery buffer → `savedContent` → empty

---

## UX requirement — one primary decision (098 addendum)

Create must not present a wall of equal choices (save · ideas · review · brainstorm · skip · complete · build · fill · help).

**Rule:** Every section presents only the controls needed to complete that section. Secondary AI assistance is available without competing with the primary writing flow. Minimize decision fatigue — one clear next step at a time.

| Mode | What the member sees |
|------|----------------------|
| **Writing this section** | Prompt · editor · one primary **Save this section** · quiet save badge |
| **Need a hand?** | Progressive disclosure — ideas, examples, review, unsure, skip |
| **When you're ready** | Done with this section · Assemble the full piece · polished draft — work-level, not writing competitors |

Silent orientation: *“You're writing this section. Everything else can wait.”*

Aligns with Spec 103 / T-003: one primary action · max 3 visible choices · calm before complexity.

---

## Independent save behavior

- Section bodies live in `workflow.sectionContent[sectionId]`
- Lifecycle edits via `applySectionLifecycleTransition` (`edit` / `complete_for_now` / `reopen`)
- Autosave recovery buffer remains per `focusId` (section-scoped)
- Durable persist still owned by `creationDurable`
- Section edits mark `assembledOutput.stale = true`

---

## Lifecycle

- **Complete for Now** — one section (`completeWorkSection` / existing UI)
- **Complete It Now** — full-piece assembly (`completeItNow`) — distinct control
- Reopen restores section into active editor

---

## Assembly

- Schema / template order preserved
- Headings + latest saved content
- Short maps (≤8 sections): all non-skipped sections required
- Long maps (Event): focus-set or at-least-one content rule
- Same Work ID on `assembledOutput.workId`
- Stale warning after later edits; rebuild via Complete It Now again

---

## Projects behavior

`syncCanonicalWorkFromCreateWorkflow` now:

- Uses the same Work ID (`resolveWorkIdFromWorkflow`)
- Copies `activeSectionId`
- Copies `assembledBody` / `assembledStale`

Continue can reopen last active section from that shared record.

---

## Legacy compatibility

- Existing `evt-*` / `work-*` IDs preserved (UWE adopt)
- Missing active section → first incomplete → first registered (`resolveActiveSectionId`)
- Unregistered Work Type labels (e.g. Marketing Campaign) use transitional templates until a package ships; `requireWorkTypePackage("marketing_plan")` still fails visibly

---

## Tests

| Suite | Result |
|-------|--------|
| `lib/universalWorkEngine/sectionRuntime/sectionNavigation.test.ts` | **8 passed** |
| `lib/universalWorkEngine/**` + foundation cert + createWorkspaceV2 | **44 passed** (combined batch) |
| Browser certification (098 Phase 12) | **Not run** |

---

## Browser evidence

Not run in this session (no interactive Estate browser pass). Manual checklist remains in the 098 Cursor prompt Phase 12.

---

## Remaining gaps

1. Browser certification of Marketing Campaign + Event subset  
2. Wire Projects UI “View Complete Piece” / Continue to open assembled body and `activeSectionId` in host surfaces (data sync is ready)  
3. Persist assembled output through durable payload fields (currently workflow + canonical work record / draftContent)  
4. CPC `onBuildDraftInFocus` still runs assistance review rather than LLM draft build — separate from Complete It Now assembler

---

## Final decision

**CREATE SECTION WORKSPACE PARTIALLY COMPLETE**

Section clicks open the correct editors in unit tests; independent content + Complete It Now assembly + Projects Work ID sync are implemented and covered by automated tests. Browser certification has not passed yet, so full CERTIFIED is withheld.
