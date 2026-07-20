# Create Implementation Audit — Standards 076–090

**Status:** Phase 1 complete (code inspection). Browser certification **not** started.  
**Date:** 2026-07-20  
**Branch:** `deploy/companion-app-v3`  
**Standards commit:** `81128ff3` — docs ingest only  
**Prompt:** `091_CURSOR_CREATE_IMPLEMENTATION_AUDIT_BUILD_CERTIFY_COMMIT_PUSH_PROMPT.md`  
**Conclusion for Phase 1:** `CREATE IMPLEMENTATION NOT READY`

This audit maps the **current repository implementation** against committed Universal Creation standards 076–090. Documentation ingestion is **not** implementation completion.

Classification legend:

| Tag | Meaning |
|-----|---------|
| Implemented | Code path exists and appears wired for the requirement |
| Partially Implemented | Some of the requirement exists; gaps remain |
| Missing | No meaningful implementation found |
| Conflicting | Multiple behaviors compete or contradict standards |
| Duplicate | Same capability owned in more than one place |
| Dead / Nonfunctional | UI or API present but does not complete the job |
| Not Applicable | Outside current product surface |

---

## A. Current Create Architecture Map

### Entry / routes

| Surface | Path / owner | Role |
|---------|--------------|------|
| Estate Create entrance | `CreateEstateEntrancePanel.tsx` | Begin / continue Create |
| Create working destination | `CreateEstateWorkingPanel.tsx` + `CreateWorkspaceV2Panel.tsx` | Primary Creation Destination UI |
| Companion orchestration | `app/companion/CompanionPageClient.tsx` | Routes intent → Create / Projects / UC |
| Universal Creation discovery | `CreateDiscoveryWorkspace.tsx` | Pre-workspace Q&A (should not own Foundation types) |
| Projects Continue | `ProjectHomesPrototypePanel.tsx` + `ActiveWorkCard.tsx` | Continue Your Work cards |
| Legacy shells | `ContentGeneratorPanel.tsx`, older create builder paths | Still present; quarantine rules exist |

### Core libraries

| Library | Role |
|---------|------|
| `lib/createWorkflow.ts` | In-memory/session Create workflow state |
| `lib/createWorkflowRecordStore.ts` | Persist workflow record (localStorage) |
| `lib/createEstate/` | Destination begin outcomes, launchers, active workspace listing |
| `lib/currentFocus/` | Current Focus model, runtime creation records |
| `lib/activeWorkspaceRegistry/` | Continue registry, rename, remove/archive |
| `lib/creationDurable/` | Authoritative Supabase persistence (`companion_creation_workspaces`) |
| `lib/creationIdentity/` | Classification / Foundation routing helpers |
| `lib/eventCreationWorkspace/` | Event section bind + Event workshop enrichment |
| `lib/eventsIntelligence/` | Event records, lifecycle |
| `lib/createTemplates` / workspace V2 sections | Section schema for templates |
| `lib/createCertification/` | Journey/certification tooling (docs + assessors) |
| `lib/projects/activeWork/` | Continue card models |

### Persistence path (actual)

```text
Member edit
  → React / CreateWorkflowState
  → runtime creation record (localStorage spark.runtimeCreationRecords.v1)
  → active workspace registry (spark.activeWorkspaceRegistry.v1)
  → optional workflow record (companion-create-workflow-record-v1)
  → durable upsert (companion_creation_workspaces) when authenticated
  → verify / mark authoritative
```

**Source of truth per 076/089:** database. **Today:** local layers are still heavily used; durable path exists but UI often does not wait for verified durable success before implying progress.

### Database

- Table: `companion_creation_workspaces` (`supabase/companion_creation_workspaces_schema.sql`)
- Status field supports `active` / `archived` (archive mutation added in uncommitted `persistCreationArchive`)

### Tests (sample)

- Create Estate / launchers / scroll contracts under `lib/createEstate/*.test.ts`
- Durable creation: `lib/creationDurable/creationDurable.test.ts`
- Remove Continue: `lib/activeWorkspaceRegistry/removeActiveWorkspace.test.ts` (uncommitted)
- Foundation routing / Checklist handoff tests under `lib/creationIdentity/` (when present)
- Certification journeys: `lib/createCertification/*`

---

## B. Dead-Control Inventory (known / high risk)

| Control | Location | Issue |
|---------|----------|-------|
| Continue card `···` Delete | `ActiveWorkCard` (uncommitted wiring) | Partial: archive/remove exists in registry; Trash/restore/permanent delete per 084 **Missing**; browser cert pending |
| Full Workshop Map section rows | Event destination | Partial: Event has sections via Event workspace; **not** verified that every 077 Event map row is clickable with editor + complete/reopen |
| “Complete for Now” | Section UI | Missing / unclear as distinct member action; lifecycle language incomplete |
| Version history / compare | Create workspace | Missing as member-facing Create command |
| Export DOCX / Markdown / HTML from Create workspace | Create toolbar | Missing as Create-native; `ExportActions` covers copy/print/Google for artifact text elsewhere |
| Branch / Move / Save as Template | Work commands | Missing or only partial elsewhere |
| Multi-tab conflict warning | Persistence UI | Missing |
| Offline / failed-save recovery chrome | Create UI | Missing / Partial (durable fail messages exist in mutate layer; not full 089 UI) |
| Ask Chamber / Ask Board from section | Contextual actions | Partial at Estate level; not certified as section-scoped Create actions |

---

## C. Duplicate-Ownership Inventory

| Capability | Owners (conflict risk) |
|------------|------------------------|
| Creation entry / routing | `CompanionPageClient`, `frictionlessActionLayer`, `createExperienceRouting`, UC discovery, Foundation routing |
| Active work list | `activeWorkspaceRegistry`, `listActiveCreationWorkspaces`, Event records, Projects Continue cards |
| Titles / identity | `humanReadableIdentity`, runtime records, durable registry, workflow `selectedTemplateName` |
| Event sections | `eventsIntelligence` + `eventCreationWorkspace` + Create Foundation Current Focus |
| Export / print | `ExportActions`, Founder exports, Gallery, ContentGenerator — not one Create Output Engine (085) |
| “I’m not sure” / ideas | `currentFocus` guidance strings, GuidedAssistanceBar, conversation stuck protocol, standards 077/076 thinking |

---

## D. Data-Safety Risks

| Risk | Evidence | Severity |
|------|----------|----------|
| “Saved” before durable verify | Durable contract exists; UI honesty not certified | High |
| Hydrate resurrection of archived Continue work | Mitigated in uncommitted registry hydrate fix; must certify after commit | High |
| Stale UC session intercepting Foundation types | Partially fixed (Checklist certification); other types need re-cert | High |
| CompanionPageClient mega-WIP | ~4k-line dirty file mixes Create with unrelated Estate work | High (process) |
| Delete from Continue without Trash | Current path archives/removes from Continue; restore UX incomplete | Medium |
| Wrong Work ID on resume | Multiple ID spaces (session, event, runtime, durable) | High |
| Multi-tab overwrite | No Create multi-tab lock/warning found | Medium |
| Local-only work lost on device change | Durable list requires auth; unsigned-in path is LS-only | Medium |

---

## E. Implementation Order (dependency-aware)

Do **not** start broad UI until each slice has browser evidence.

1. **Isolate Create WIP** from unrelated dirty tree (narrow branches or surgical staging).
2. **Work identity + durable persistence honesty** (076 runtime V2 / 089) — no false Saved.
3. **Continue delete semantics** (084): archive vs Trash vs permanent; certify Scenario 5.
4. **Event Full Workshop Map** as reference Work Type (077 / 080 Event schema) — every row opens.
5. **Section editor contract**: edit, autosave, complete-for-now, reopen, prev/next, return to map.
6. **Command library** (084): disable dead controls with reasons; implement critical set.
7. **Print / PDF** (085) for Event — then other formats only when real.
8. **Contextual intelligence** (076 thinking / 077 help / 083) scoped to Work+Section IDs.
9. **Preferences / a11y / mobile** (079, 088, 090).
10. **Certification report + scoped commits** (prompt Phase 9–10).

---

# Standard-by-Standard Classification

## 076 — Universal Creation Architecture V2 (Bundles 01–14)

| Bundle / theme | Class | Current files | Gap / risk | Recommended next | Browser test |
|----------------|-------|---------------|------------|------------------|--------------|
| 01 Constitution / ADHD / Shari | Partially Implemented | Voice + Estate rules; Create UX uneven | Standards not enforced as runtime gates | Encode non-negotiables as release checks | Scenario 1–3 |
| 02 Runtime foundation | Partially Implemented | `creationDurable`, registry, runtime records | Multiple runtimes (UC vs Foundation vs Event) | One ownership path per turn (already started) | 1, 4, 8 |
| 03 Workspace | Partially Implemented | `CreateWorkspaceV2Panel`, Estate working | Not full 076_workspace_v2 shell/versioning | Align panel to 077/079 | 1–3 |
| 04 Thinking | Partially Implemented | Focus guidance strings | Not full Help Me Think / Choose engines | Wire section-scoped actions | 6 |
| 05 Research | Missing / Partial | Research elsewhere in Estate | No Create research writeback | Defer after Event section loop | Later |
| 06 Outputs | Partially Implemented | `ExportActions` | Not Create Output Engine | Print/PDF Event first | 7 |
| 07 Integrations | Partially Implemented | Projects Continue, Chamber | Incomplete Project conversion / Board | After map+save | 4 |
| 08 Governance | Partially Implemented | Docs + some hardening docs | Not operational change control | Use this audit + cert report | — |
| 09 AI collaboration | Missing / Partial | Chamber roster | No multi-agent Create orchestration | After 083 wiring | Later |
| 10 Knowledge evolution | Missing | — | No post-complete knowledge extract | Defer | Later |
| 11 Adaptive UX | Partially Implemented | Some progressive UI | No energy/focus adaptation in Create | After core editor | 9 |
| 12 Automation | Missing | — | No Create workflow engine | Defer | Later |
| 13 Intelligence quality | Partially Implemented | Trust kernel / certainty specs elsewhere | Not Create-scoped telemetry | Telemetry after core | Later |
| 14 Analytics | Missing | — | No Create friction analytics | Defer | Later |

### Cross-cutting 076 findings

| ID | Requirement | Class | Files | Behavior | Gap | Risk | Impl | Deps | Browser |
|----|-------------|-------|-------|----------|-----|------|------|------|---------|
| 076-R1 | Single runtime ownership | Conflicting | CompanionPageClient, UC, Foundation, Event | Sticky UC vs Foundation partially fixed | Other consumers may still fork | High | Finish ownership gate for all Foundation types | creationIdentity | 1, 3 |
| 076-R2 | Immutable Work ID | Partially Implemented | durable `workspaceId`, sessionId, eventId | IDs exist but multiple namespaces | Resume can pick wrong id | High | Canonical Work ID resolver | registry + durable | 4 |
| 076-R3 | Authoritative DB SoT | Partially Implemented | `creationDurable` | LS still primary for many resumes | Data loss / false continuity | High | Resume only after durable verify when authed | 089 | 2, 8 |

---

## 077 — Universal Working Workspace

| Requirement | Class | Notes |
|-------------|-------|-------|
| Full Workshop Map | Partially Implemented | Event sections exist; not certified as 077 map with all required rows |
| Every section row clickable | Unknown / Partial | Needs browser proof |
| Section editor (edit/save/autosave) | Partially Implemented | Current Focus + section content |
| Complete for Now | Missing / Partial | Vocabulary in standards; member action not certified |
| Reopen after complete | Missing / Partial | Must never permanently lock |
| Prev / Next / Return to map | Partially Implemented | Navigation exists in workspace V2 patterns |
| Give Me Ideas / I’m Not Sure / Help Me Think | Partially Implemented | Guidance labels; not full 077 contextual engines |
| Workshop Map → Projects | Partially Implemented | Continue cards / project links |

---

## 078 — Component Library

| Requirement | Class | Notes |
|-------------|-------|-------|
| Shared Create components | Partially Implemented | Many `Create*.tsx` components; not one certified library API |
| Section component contracts | Partially Implemented | Varies by Event vs document templates |
| UI certification | Missing | No 078 browser cert package executed |

---

## 079 — Workspace Interface

| Requirement | Class | Notes |
|-------------|-------|-------|
| Navigation system | Partially Implemented | Estate + workspace panels |
| Dialogs / confirmations | Partially Implemented | Delete confirm on Continue (uncommitted); incomplete command set |
| Panels / drawers / inspector | Partially Implemented | Frosted + side patterns elsewhere |
| Command bar | Missing / Partial | No unified Create command bar per 084/079 |
| Responsive / touch | Partially Implemented | Estate mobile rules; Create not certified (Scenario 9) |
| A11y / cognitive usability | Partially Implemented | Estate standards; Create keyboard path not certified |
| Interface state persistence | Partially Implemented | Workflow + registry |

---

## 080 — Work Type & Section Schema

| Work type | Class | Notes |
|-----------|-------|-------|
| Event schema | Partially Implemented | Event Intelligence + bind; not full 080_003 row set certified |
| Checklist / Task Plan | Partially Implemented | Foundation Checklist routing certified earlier; map/editor incomplete vs 077 |
| Marketing / SOP / Strategic Plan / Content | Missing / Partial | Templates/types exist in places; not 080-complete |
| Schema versioning / migration | Missing | — |
| Composition / conditional sections | Partial | Event dynamic sections (053 lineage) |

---

## 081 — Templates & Starters

| Requirement | Class | Notes |
|-------------|-------|-------|
| Template registry | Partially Implemented | Create templates / pickers exist |
| Starter draft engine | Partially Implemented | Discovery + templates |
| Example library | Partially Implemented | Projects examples; Create examples uneven |
| Personalization / versioning | Missing / Partial | — |

---

## 082–083 — Collaboration / Orchestration

| Requirement | Class | Notes |
|-------------|-------|-------|
| Capability routing | Partially Implemented | Estate intelligence + Create routing |
| Context assembly | Partially Implemented | Focus + workflow |
| Multi-expert coordination | Missing / Partial | Chamber exists; not Create orchestrator |
| Response synthesis | Partially Implemented | Chat engines |
| Failure / fallback | Partially Implemented | Estate recovery voice |
| Observability | Partial | Persist traces; not full 083 events |

---

## 084 — Command & Action Library

| Command group | Class | Notes |
|---------------|-------|-------|
| Create New / Open / Recent | Partially Implemented | Entrance + Continue |
| Rename | Partially Implemented | Active Work rename (durable) |
| Duplicate / Branch / Move | Missing | — |
| Archive / Restore | Partially Implemented | Archive via remove Continue; Restore UX incomplete |
| Trash / Permanent delete | Missing | Delete ≈ archive/remove today |
| Save as Template | Missing | — |
| Save / Autosave | Partially Implemented | Needs durable honesty |
| Undo / Redo / Find / Replace | Missing / Partial | Browser defaults only |
| Section complete / reopen / skip | Missing / Partial | — |
| Attach / link / notes / tasks | Partial | Event assets elsewhere |
| Print / Export formats | Partial | Print/copy/Google; DOCX/MD/HTML Create-native Missing |
| Prev/Next/Jump/Return | Partial | — |

---

## 085 — Output & Publishing

| Requirement | Class | Notes |
|-------------|-------|-------|
| Print system | Partially Implemented | `ExportActions` print |
| PDF export | Partially Implemented | jsPDF in other domains; Create Event PDF not certified |
| DOCX / MD / HTML | Missing | — |
| Publishing / delivery | Partial | Google Doc path |
| Branding / layout / watermarks | Missing | — |
| Output lineage | Missing | — |

---

## 086 — Media & Attachments

| Requirement | Class | Notes |
|-------------|-------|-------|
| Upload / insert / library | Missing / Partial | Not Create-universal |
| Transcripts / OCR | Missing | — |
| Retention / deletion | Missing | — |

---

## 087 — Search & Discovery

| Requirement | Class | Notes |
|-------------|-------|-------|
| Create search index | Missing | — |
| In-work search | Missing / Partial | — |
| Saved searches | Missing | — |

---

## 088 — Preferences

| Requirement | Class | Notes |
|-------------|-------|-------|
| Editor / layout prefs | Missing / Partial | Global prefs exist (`companionStore`) not Create-scoped |
| AI prefs / autosave prefs | Missing / Partial | — |
| Accessibility / energy modes | Partial | Estate / profile |
| Shortcut customization | Missing | — |

---

## 089 — Recovery, Resilience, Sync

| Requirement | Class | Notes |
|-------------|-------|-------|
| Autosave + durable save | Partially Implemented | Durable mutate + LS |
| Crash / refresh recovery | Partially Implemented | Registry hydrate / workflow record |
| Offline / reconnect | Missing | — |
| Conflict resolution | Missing | — |
| Backup / restore / retention | Missing / Partial | Archive only |
| Multi-tab / multi-device | Missing | — |
| Failure messages | Partially Implemented | Durable fail copy; not full member recovery chrome |

---

## 090 — Testing, Certification, Release

| Requirement | Class | Notes |
|-------------|-------|-------|
| Test matrix / E2E scenarios | Partially Implemented | Unit + some journeys; prompt Scenarios 1–10 not browser-certified |
| A11y / performance / security gates | Missing as Create release package | — |
| Regression suite | Partial | Vitest pockets |
| Release gates | Not met | Blocking gaps above |

---

# Dirty Create-Related Paths (preserve unrelated work)

**Do not** `git add .`. Create-touched dirty/untracked areas include (non-exhaustive):

- `app/companion/CompanionPageClient.tsx` (mixed mega-diff — isolate before commit)
- `components/companion/Create*.tsx` (several modified + new)
- `components/companion/projectHomes/ActiveWorkCard.tsx`, `ProjectHomesPrototypePanel.tsx`
- `lib/activeWorkspaceRegistry/`, `lib/creationDurable/`, `lib/currentFocus/`, `lib/createEstate/`, `lib/createWorkflow*.ts`, `lib/projects/activeWork/`, `lib/eventsIntelligence/` (partial)
- Uncommitted hardening docs under `docs/create-experience/` (045–074 standards, HARDENING_*, etc.) — **exclude** unless required

Unrelated dirty count at audit time: **~920+** paths. Preserve exactly.

---

# Browser Certification Status

| Scenario | Status |
|----------|--------|
| 1 Create New Event | Not run in this audit |
| 2 Edit and Save | Not run |
| 3 Complete and Reopen | Not run |
| 4 Continue | Partial historical evidence for Checklist; Event not re-certified here |
| 5 Delete from Continue | Code partial; browser not certified |
| 6 Contextual Help | Not run |
| 7 Print / Export | Not run |
| 8 Save Failure | Not run |
| 9 Mobile | Not run |
| 10 Accessibility | Not run |

---

# Completion Decision (Phase 1)

**`CREATE IMPLEMENTATION NOT READY`**

Phase 1 audit is complete. Broad implementation must follow §E order with browser evidence. Do not declare certification until release-blocking scenarios pass.

---

## Suggested next commits (after isolation)

1. `audit(create): map implementation against standards 076-090` ← this file (+ prompt copy)
2. Then scoped feat commits per prompt Phase 10 — **never** mix unrelated dirty paths
