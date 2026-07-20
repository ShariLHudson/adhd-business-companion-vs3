# Create Implementation Audit — Standards 076–090

**Status:** Phase 1 audit superseded for foundation capabilities by Phase 2 baseline.  
**Date:** 2026-07-20 (Phase 2 update)  
**Branch:** `deploy/companion-app-v3`  
**Standards commit:** `81128ff3` — docs ingest only  
**Phase 1 audit commit:** `05bc0135`  
**Foundation baseline commit:** `de0af701` — `feat(create): certify universal Create foundation with Event reference implementation`  
**Prompt:** `091_CURSOR_CREATE_IMPLEMENTATION_AUDIT_BUILD_CERTIFY_COMMIT_PUSH_PROMPT.md`  
**Phase 1 conclusion (historical):** `CREATE IMPLEMENTATION NOT READY`  
**Phase 2 conclusion:** `CREATE FOUNDATION BASELINE CERTIFIED` (automated production matrix + Event reference). **Not** “Create finished.” Full 076–090 and single-runtime extensibility still open.

> **Stale-audit warning:** Earlier code cross-checks (including post–Phase-1 subagent scans) that mark Full Workshop Map, Complete for Now, trash/restore, or command library as **Missing** are outdated relative to `de0af701`. Prefer the Phase 2 supersession table below.

---

## Phase 2 supersession (2026-07-20, commit `de0af701`)

| Capability | Phase 1 / stale scan | After `de0af701` | Evidence |
|------------|----------------------|------------------|----------|
| Full Workshop Map (077/080) | Missing / Partial | **Implemented** (shared runtime; Event configures) | `lib/workTypeSchema/`, Estate `CreateWorkspaceV2Panel` map rows, `openWorkshopMapSection` |
| Every map row → Current Focus | Unknown | **Implemented** (certified) | `productionCreateFoundation.cert.test.ts` |
| Complete for Now / Reopen | Missing | **Implemented** | `markSectionCompleteForNow`, `reopenSectionForEditing`, Focus buttons |
| Save honesty (“Saved securely”) | Uncertified | **Implemented** on Current Focus path | `creationDurable/saveState`, Focus recovery buffer |
| Continue Archive / Trash / Restore | Partial / Missing trash | **Implemented** (registry mutations) | `activeWorkspaceRegistry` + Active Work “Recently removed” |
| Work command library (084 subset) | Missing | **Partial → Implemented** for Estate work commands | `lib/createCommands/`, `CreateWorkCommandToolbar` |
| Production certification | Not started | **Automated matrix green** (37 checks; 52 related tests) | `lib/createCertification/productionCreateFoundation.cert.test.ts` |
| Single runtime per concern / config-only Work Types | — | **Not yet** | Dual status (facilitated vs EventSection); multi save stores; multi Continue lists; schema-first bootstrap incomplete |
| Browser keyboard / live Print-PDF / offline queue | — | **Still open** | Manual / Preview follow-up |
| Help Me Think / 082 full / 085 native DOCX / 088 prefs / 089 multi-tab | Missing / Partial | **Still open** | Unchanged by Phase 2 |

**Architecture rule going forward:** Event (and every Work Type) **configures** `workTypeSchema` + domain adapter; shared Create owns map open, save labels, complete/reopen, Continue mutations, and work commands. Do not reintroduce Event-only forks of those behaviors.

---

**Deep-dive (Phase 1):** [Audit Create routes/UI](11494c85-5575-4e5f-aacf-9fed6f90d893)

This audit maps the **current repository implementation** against committed Universal Creation standards 076–090. Documentation ingestion is **not** implementation completion. Sections below retain Phase 1 detail; where they conflict with the Phase 2 table, **Phase 2 wins**.

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

**Live platform:** Create Estate on `/companion` (`activeSection === "create"`) → `CurrentFocusInteraction` + `CreateWorkspaceV2Panel` (Workshop Map) + `creationDurable` + `activeWorkspaceRegistry` + `CreateWorkCommandToolbar`.

**Phase 2 baseline (see supersession table):** shared Workshop Map via `lib/workTypeSchema/`, Complete for Now / Reopen, durable save honesty on Focus, Continue trash/restore, Estate command toolbar. Still open: Help Me Think on Focus, dedicated `/create` route, single-runtime cleanup, browser/offline cert. Legacy Event disclosure (`workspace-full-map-disclosure`) is not the primary map path.

### Entry / routes

| Surface | Path / owner | Role |
|---------|--------------|------|
| Sole Create surface | `app/companion/page.tsx` → `CompanionPageClient` | `activeSection === "create"` |
| Entrance | `CreateEstateEntrancePanel.tsx` | Begin / Continue / Start New / drafts / catalog |
| Working destination | `CreateEstateWorkingPanel.tsx` | When `workspaceFirst && phase === "workspace"` |
| Current Focus UI | `CurrentFocusInteraction.tsx` | Continue · Give me ideas · I'm not sure · Skip |
| Live “map” | `CreateWorkspaceV2Panel.tsx` | Section cards, N/A, Need Ideas, Build Draft |
| UC discovery | `CreateDiscoveryWorkspace.tsx` | Pre-workspace Q&A (must not own Foundation types) |
| Projects Continue | `ProjectHomesPrototypePanel.tsx` + `ActiveWorkCard.tsx` | Continue Your Work |
| Legacy split Create | `ContentGeneratorPanel.tsx` + `openCreateWorkspace.ts` | Quarantined; still hosts `ExportActions` |
| Export API | `app/api/google/create-doc/route.ts` | Google Doc via `ExportActions` |

### Core libraries

| Library | Role |
|---------|------|
| `lib/createWorkflow.ts` / `createWorkspaceV2.ts` | Workflow + workspace-first sections |
| `lib/createEstate/` | Begin outcome, active list, quarantine |
| `lib/currentFocus/` | Focus resolve/submit, runtime records |
| `lib/activeWorkspaceRegistry/` | Continue registry, rename, remove/archive |
| `lib/creationDurable/` | Authoritative Supabase persist/hydrate/mutate |
| `lib/creationIdentity/` | Foundation classification / routing |
| `lib/eventCreationWorkspace/` | Event Full-map section set → workflow |
| `lib/universalCreationEntrypoint/` + `universalCreationEngine/` | Begin / force-new / workspace resolve |
| `lib/facilitatedCreation/` | Section status / open gates |
| `lib/createProjects/` | Canonical work ↔ Project Homes |
| `lib/createTemplates.ts` | Template sections |
| `lib/companionStorageRecovery.ts` | Canonical Create LS keys |

### Persistence path (actual)

```text
Member edit → CreateWorkflowState → runtime LS → registry LS
  → durable upsert (companion_creation_workspaces) when authed
  → verify → applyVerifiedCreationToCaches
```

| Key | Role |
|-----|------|
| `spark.runtimeCreationRecords.v1` | Runtime creation records |
| `spark.activeWorkspaceRegistry.v1` | Continue / Active Work registry |
| `spark.lastActiveWorkspaceId.v1` | Last active workspace |
| `spark.creationDurableCache.v1` | Optional cache (**never** durable success) |
| `companion-create-workflow-record-v1` | Workflow record |
| `companion-create-workflow-saved-v1` | Save-for-later |
| `companion-events-intelligence-v1` | Event records (merged into active list) |

**SoT per 076/089:** database. Resume UX still often LS-first; durable honesty before “Saved” not certified.

### Database

- `companion_creation_workspaces` — schema in `supabase/companion_creation_workspaces_schema.sql`
- Archive via uncommitted `persistCreationArchive`

### Tests (sample)

- Estate / Begin / quarantine: `lib/createEstate/*.test.ts`
- Durable / registry / focus: `creationDurable.test.ts`, `removeActiveWorkspace.test.ts`, `currentFocus/*`
- Event / engine: `eventCreationWorkspace.test.ts`, `universalCreationEngine.test.ts`
- Certification: `lib/createCertification/*`

### Live sketch

```text
Entrance (Begin|Continue|New)
  → CreateEstateWorkingPanel
        ├─ CurrentFocusInteraction (ideas / not sure / skip)
        └─ CreateWorkspaceV2Panel (section cards ≈ map)
  → creationDurable → companion_creation_workspaces
  → registry/runtime LS → ActiveWorkCard / resume lists
```

---

## B. Dead-Control Inventory (known / high risk)

| Control | Location | Issue |
|---------|----------|-------|
| Continue `···` Delete | `ActiveWorkCard` (uncommitted) | Archive/remove only; Trash/restore/permanent **Missing**; browser cert pending |
| Full Workshop Map (077) | Specs; runtime ≈ `CreateWorkspaceV2Panel` + disclosure | No dedicated map component; Event rows not browser-certified |
| Complete for Now | Section UI | **Missing**; SectionCard uses **N/A / Undo N/A** |
| Help Me Think | Specs / Talk It Out | **Not** on `CurrentFocusInteraction` |
| Universal toolbar (077_008) | Spec | No Create Estate toolbar |
| Export/print on Estate working | `CreateEstateWorkingPanel` | `ExportActions` on **legacy** ContentGenerator/Gallery/Email only |
| DOCX / MD / HTML Create-native | Create toolbar | Missing |
| Version history / compare | Create | Missing |
| Branch / Move / Save as Template | Work commands | Missing |
| Multi-tab conflict | Persistence UI | Missing |
| Offline / failed-save chrome | Create UI | Partial (mutate fail copy; not full 089) |
| Ask Chamber / Board from section | Contextual | Not section-scoped Create actions |

---

## C. Duplicate-Ownership Inventory

| Capability | Owners (conflict risk) |
|------------|------------------------|
| Creation entry / routing | `CompanionPageClient`, `frictionlessActionLayer`, `createExperienceRouting`, UC discovery, Foundation routing |
| Active work list | `activeWorkspaceRegistry`, `listActiveCreationWorkspaces`, Event records, Projects Continue cards |
| Titles / identity | `humanReadableIdentity`, runtime records, durable registry, workflow `selectedTemplateName` |
| Event sections | `eventsIntelligence` + `eventCreationWorkspace` + Create Foundation Current Focus |
| Export / print | `ExportActions` on legacy ContentGenerator / Gallery / Email — **not** Estate working panel; Founder exports separate; not one Create Output Engine (085) |
| “I’m not sure” / ideas | `CurrentFocusInteraction` + Need Ideas on section cards + GuidedAssistanceBar + conversation stuck protocol + 077/076 thinking specs |

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
| Complete for Now | Missing | Spec only; UI uses N/A / Undo N/A on section cards |
| Reopen after complete | Missing / Partial | Must never permanently lock; no Complete-for-Now path to reopen |
| Prev / Next / Return to map | Partially Implemented | Workspace V2 patterns; not certified as 077 map nav |
| Give Me Ideas / I’m Not Sure | Partially Implemented | On `CurrentFocusInteraction` (+ Need Ideas on cards) |
| Help Me Think | Missing on Create Focus | Spec / Talk It Out findability only |
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
