# 096 — Universal Work Engine Extraction Report

**Status:** Extraction complete for Event as first registered Work Type package  
**Authority:** `095_CREATE_CORE_OWNERSHIP_AUDIT.md`  
**Scope:** Consolidate certified Create Event into one Universal Work Engine  
**Out of scope (honored):** Marketing Plan · additional Work Types · Chamber-specific creation experiences  
**Commit:** Not created (per instruction — reports + tests first)

---

## Executive summary

Create Event now consumes a shared **Universal Work Engine** (`lib/universalWorkEngine/`) for:

1. Canonical Work identity (`work-*` mint + legacy adopt)  
2. Authoritative Work Type package registry (fail-visible for unknown IDs)  
3. Tasks / milestones store  
4. Research attachment (Research → Review → Approve → Apply)  
5. Cartography relationships by Work ID (no content duplication)  
6. Durable DB boundary enforcement (tests)

Event remains the certified domain package for schemas, sections, Event terminology, Blueprints, risks, deliverables, and task *suggestions*. It no longer mints competing master IDs or owns a private universal registry/save/identity path.

---

## Files changed

### New — Universal Work Engine

| Path | Role |
|------|------|
| `lib/universalWorkEngine/types.ts` | Shared types + `UnknownWorkTypeError` |
| `lib/universalWorkEngine/index.ts` | Public API (Work Type packages import from here) |
| `lib/universalWorkEngine/identity/allocateCanonicalWorkId.ts` | Sole mint (`work-…`) |
| `lib/universalWorkEngine/identity/resolveWorkIdentity.ts` | Adopt / alias / coalesce |
| `lib/universalWorkEngine/identity/workIdentityStore.ts` | Identity + alias store |
| `lib/universalWorkEngine/identity/workIdentity.test.ts` | Duplicate-prevention + adopt tests |
| `lib/universalWorkEngine/registry/universalWorkTypeRegistry.ts` | Authoritative package registry |
| `lib/universalWorkEngine/registry/bridgeWorkTypeSchema.ts` | Bridge to legacy `WorkTypeSchema` |
| `lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType.ts` | Event package registration |
| `lib/universalWorkEngine/tasks/workTasksApi.ts` | Universal tasks / milestones |
| `lib/universalWorkEngine/research/researchAttachment.ts` | Research approve-before-apply |
| `lib/universalWorkEngine/cartography/workRelationships.ts` | Cartography relationship layer |
| `lib/universalWorkEngine/boundaries/durableAccessGuard.ts` | Approved durable owners |
| `lib/universalWorkEngine/boundaries/architectureBoundaries.test.ts` | Architecture boundary suite |

### Wired callers (identity / registry / bridges)

| Path | Change |
|------|--------|
| `lib/createSharedSession.ts` | `newCreateSessionId` → `allocateCanonicalWorkId` |
| `lib/createCommands/duplicateCreationWorkspace.ts` | Duplicate mint → UWE |
| `lib/createProjects/canonicalWorkRecord.ts` | Projects mint → UWE |
| `lib/currentFocus/creationRecord.ts` | Fallback mint → UWE |
| `lib/creationDurable/mapping.ts` | Fallback durable id → UWE |
| `lib/eventsIntelligence/guideEventPlanning.ts` | New Event id → UWE; `canonicalWorkId` = master |
| `lib/eventsIntelligence/projectsBridge.ts` | Same Work ID for Projects; sync tasks into UWE |
| `lib/createWorkspaceV2.ts` | UWE registry; throw `UnknownWorkTypeError` for resolved-but-unregistered IDs |
| `lib/createWorkRuntime/resolveCreateWorkRuntime.ts` | `coalesceWorkflowWorkId` |
| `lib/createCommands/dispatchCreateWorkCommand.ts` | Work ID coalesce via UWE |
| `lib/universalCreationEngine/cartographySync.ts` | Cartography refs via UWE Work IDs |
| `lib/workTypeSchema/schemas/eventPlan.ts` | Delegates registration to Event UWE package |
| `lib/workTypeSchema/schemas/certProbe.ts` | Explicit UWE package registration for cert probe |
| `lib/eventCreationWorkspace/applyWorkspaceToCreateWorkflow.ts` | Uses `ensureEventPlanWorkTypeRegistered` |

### Tests updated for `work-` prefix / schema authority

- `lib/createCommands/createCommands.test.ts`  
- `lib/createCertification/productionCreateFoundation.cert.test.ts`  
- `lib/createWorkspaceV2.test.ts` (SOP/Marketing fail-visible)  
- `lib/createProjects/createProjectsIntegration.test.ts`  
- `lib/eventCreationWorkspace/eventCreationWorkspace.test.ts`  
- `lib/currentFocus/legacyRuntimeRetirement.test.ts`  
- `lib/currentFocus/exactWorkspacePersist.test.ts`  
- `lib/activeWorkspaceRegistry/activeWorkspaceRegistry.test.ts`  

### Reports

- `docs/create-experience/096_UNIVERSAL_WORK_ENGINE_EXTRACTION_REPORT.md` (this file)  
- `docs/create-experience/097_UNIVERSAL_WORK_ENGINE_BLOCKERS.md`

---

## Universal owners established

| Capability | Owner |
|------------|--------|
| Work ID mint | `allocateCanonicalWorkId` |
| Identity resolve / aliases | `resolveCanonicalWorkId`, `coalesceWorkflowWorkId` |
| Work Type registry | `registerWorkTypePackage` / `requireWorkTypePackage` |
| Tasks & milestones | `lib/universalWorkEngine/tasks/workTasksApi.ts` |
| Research attachments | `lib/universalWorkEngine/research/researchAttachment.ts` |
| Cartography relationships | `lib/universalWorkEngine/cartography/workRelationships.ts` |
| Durable DB access | `lib/creationDurable/repository.ts` (unchanged; boundary tests added) |
| Section lifecycle / commands / save pipeline / Continue | Existing frozen Create owners (`createSectionLifecycle`, `createCommands`, `creationDurable`, `activeWorkspaceRegistry`) |

---

## Event-specific owners retained

| Domain concern | Location |
|----------------|----------|
| Event Plan map sections / focus defaults | `lib/workTypeSchema/schemas/eventPlanMap.ts` |
| Event Record model & foundation Q&A | `lib/eventsIntelligence/` |
| Event workspace bind → Create workflow | `lib/eventCreationWorkspace/` |
| Event task *confirmation* / suggestion policy | `addConfirmedEventTask` (writes into UWE store via sync) |
| Event Blueprints / forgotten-item / risks / deliverables | Existing Event packages (unchanged domain) |
| Event certification journeys | `lib/createCertification/*` Event reference cases |

Event package under UWE (`packages/eventPlan/`) registers configuration only — does **not** mint IDs, call durable repository, or own save/resume/commands.

---

## Identity migration approach

| Case | Behavior |
|------|----------|
| **New** Create / Event / Duplicate / Projects work | Mint `work-{suffix}` via UWE |
| **Existing** `evt-*` certified Event records | `adoptLegacyWorkIdAsCanonical` — id stays `evt-*` as master (no rewrite, no orphan, no duplicate mint) |
| **Legacy** `create-*` / `ws-*` / `cw-*` / `creation-*` | Adopted as canonical when first seen, or registered as **aliases** of an existing master via `coalesceWorkflowWorkId` |
| Event ↔ Projects | New Events set `canonicalWorkId = record.id` at create; Projects bridge upserts with the **same** id (stops competing `cw-*` masters for new Event work) |

Compatibility rule: never silently rewrite durable primary keys on existing rows.

---

## Registry design

- **Authoritative:** `universalWorkTypeRegistry` (`WorkTypePackage`)  
- **Bridge:** `registerSchemaAsWorkTypePackage` / `requireSchemaForWorkTypeId` keep Workshop Map bootstrap on `WorkTypeSchema`  
- **Registered packages:** `event_plan` (product), `cert_probe` (certification only, explicit)  
- **Fail-visible:** `requireWorkTypePackage` and `initializeWorkspaceV2Workflow` throw `UnknownWorkTypeError` when a label resolves to an ID with no package (e.g. `sop`, `marketing_plan`) — no silent generic template for those IDs  
- **Freeform labels** with no resolved Work Type ID may still use transitional templates (Email, Newsletter, Course Outline, custom)  
- Work Type packages may supply domain configuration only — no private registry/save/identity/command/version/resume owners

---

## Task and milestone extraction

- Universal store: tasks (subtasks via `parentTaskId`), owners, due dates, status, dependencies, milestones, completion timestamps, section / project / source context  
- Event domain still holds confirmed tasks on `EventRecord` for Event UX; `syncEventRecordToProjects` / `addConfirmedEventTask` push into UWE via `syncEventTasksIntoUniversalWork`  
- Event-specific suggestion copy and confirmation gates remain Event-owned

---

## Research model

Shared `ResearchRecord` attaches to: work · section · task · milestone · decision · project · blueprint · cartography_node.

Flow enforced in API:

`draft` → `in_review` → `approved` | `rejected` → `applied`

`applyApprovedResearch` records applied-change summaries only — **never** mutates master Create/Event content automatically.

---

## Cartography relationship model

Kinds: supports · depends_on · contains · implements · informs · related_to · reused_from · part_of · visualizes  

Edges reference canonical Work IDs (and cartography/project/blueprint refs). `syncCreationToCartography` resolves Work ID through UWE and does not copy work body into Cartography.

---

## Database boundary enforcement

- Approved writer: `lib/creationDurable/repository.ts` (+ existing creationDurable helpers / ops scripts)  
- Boundary tests scan Event / Event package / createAssets / research trees for direct table / repository access  
- No Chamber / Cartography / Board / Body Doubling shadow persistence path introduced in this extraction

---

## Tests added / updated

| Suite | Result (this run) |
|-------|-------------------|
| `lib/universalWorkEngine/**` | **12 passed** |
| `productionCreateFoundation.cert.test.ts` | **passed** (Event reference) |
| `universalCreateRuntimeConsolidation.cert.test.ts` | **passed** |
| `createCertification.test.ts` | **passed** |
| `createCommands.test.ts` | **passed** |
| `createProjectsIntegration.test.ts` | **passed** |
| `schemaFirstBootstrap.test.ts` | **passed** |
| `eventCreationWorkspace.test.ts` | **passed** |

**Combined final batch:** 9 files · **65 passed** · 0 failed  

Command:

```text
npx vitest run lib/universalWorkEngine \
  lib/createCertification/productionCreateFoundation.cert.test.ts \
  lib/createCertification/universalCreateRuntimeConsolidation.cert.test.ts \
  lib/createCertification/createCertification.test.ts \
  lib/createCommands/createCommands.test.ts \
  lib/createProjects/createProjectsIntegration.test.ts \
  lib/workTypeSchema/schemaFirstBootstrap.test.ts \
  lib/eventCreationWorkspace/eventCreationWorkspace.test.ts
```

Architecture proofs covered:

- UWE core does not import Event Intelligence  
- Event package does not mint Work IDs  
- Forbidden packages do not call durable repository  
- Unknown Work Types fail visibly (registry + bootstrap)  
- One canonical Work ID survives create → alias → research → cartography → tasks  
- Existing `evt-*` remains accessible as canonical  

---

## Event regression results

| Gate | Outcome |
|------|---------|
| Production Create foundation (Event reference) | Pass |
| Universal Create runtime consolidation (cert_probe) | Pass |
| Event Creation Workspace bind / document authority | Pass |
| Schema-first Event Plan / Workshop bootstrap | Pass |
| Identity adopt for legacy `evt-*` | Pass |

Pre-existing CPC **source-string** checks outside this batch (e.g. `shouldBindWorkspace` / `enterCreationFromShari` presence in `CompanionPageClient.tsx`) may still fail due to unrelated estate host WIP — they are not Universal Work Engine regressions. See `097`.

---

## Unresolved risks (non-blocking for Event UWE extraction)

1. **Labels that resolve to unregistered Work Types** (`SOP`, `Checklist`, `Proposal`, `Marketing Plan`) now throw at bootstrap instead of template fallthrough. Correct per architecture; Begin UX should catch `UnknownWorkTypeError` with Shari recovery voice before those types ship as packages.  
2. **In-memory UWE stores** (tasks, research, relationships, identity aliases) are runtime/session aids — durable truth for work content remains `creationDurable`. Persist identity map / research history to durable storage is a future hardening step.  
3. **Analytics / ecosystem `evt-*` mints** outside Create Work (`ecosystem/eventStore`, `closedLoopLearning`) intentionally untouched — not Create master work identities.  
4. Marketing Plan / SOP packages not built (by design).

---

## Completion checklist

| Requirement | Met |
|-------------|-----|
| Event certification suite (foundation + consolidation) passes | Yes |
| Existing Event data accessible (`evt-*` adopt) | Yes |
| One canonical Work ID authoritative for new work | Yes (`work-*`) |
| Universal registry authoritative | Yes |
| Research approve-before-apply shared model | Yes |
| Cartography references Work IDs without duplication | Yes |
| Tasks/milestones no longer Event-owned as universal engine | Yes |
| Database access boundaries enforced by tests | Yes |
| No premature new Work Type | Yes |

**Verdict:** Universal Work Engine extraction is complete for Event as first consumer. Do not start Marketing Plan until Begin surfaces handle `UnknownWorkTypeError` calmly and any remaining CPC host string certs are addressed separately.
