# 076 — Create Foundation Certification

**Status:** CERTIFIED (Checklist handoff) · Document Create Foundation routing authority  
**Date:** 2026-07-20  
**Governing process:** [062 Implementation & Certification](./062_IMPLEMENTATION_AND_CERTIFICATION_STANDARD.md) · [065 Certification Template](./065_CERTIFICATION_TEST_SPECIFICATION_TEMPLATE.md)  
**Extends:** [059 Discovery → Workspace](./059_DISCOVERY_TO_WORKSPACE_TRANSITION_STANDARD.md) · [070 Authoritative Truth](./070_AUTHORITATIVE_TRUTH_STANDARD.md) · [071 Continuity](./071_WORKSPACE_CONTINUITY_STANDARD.md) · [073 Human-Readable Identity](./073_HUMAN_READABLE_WORKSPACE_IDENTITY_STANDARD.md) · [074 Production Hardening](./074_PRODUCTION_HARDENING_PERSISTENCE_AND_RELIABILITY.md)  
**Does not redesign:** Universal Creation Platform 045–065 · Create Foundation workspace runtime · Checklist question copy

---

## Mission

Create Foundation document types (including **Checklist**) must enter the standard Create Foundation runtime:

```text
originalRequest
  → Intent Detection
  → workingIntent
  → Document Classification   ← sole authority from here
  → Template Selection
  → Workspace Type
  → Workspace Structure
  → Title
  → Persistence
  → Resume
```

Universal Creation discovery may **not** own, intercept, recreate, or resume those requests.

---

## Ownership Rule (binding)

Once `shouldRouteDirectlyToCreateFoundation(classification)` is **true**:

1. Clear or ignore any stale `universal-creation-session-v1`
2. Do not route to `universal_creation` owner
3. Route only via `openUniversalCreationFromText` → `startFreshCreateFromEstate`
4. On handoff failure: explicit truthful Create error — **never** `tryUniversalCreationFlow` as fallback

Authoritative helper (all three former leak paths must use it):

- `lib/creationIdentity/createFoundationRouting.ts`
  - `shouldRouteDirectlyToCreateFoundation`
  - `resolveCreateFoundationClassification`

---

## Certification Decision

| Field | Value |
|---|---|
| Decision | **CERTIFIED** (Checklist Create Foundation handoff) |
| Scope | Checklist (and other Foundation-direct document types per helper) |
| Out of scope | Email / sales funnel / other pre-workspace UC discovery types |
| Runtime | companion-app · local `previewTest=1` browser |

**Reason:** Browser-proven that Checklist no longer enters Universal Creation discovery; Create Foundation workspace opens; workflow record persists; hard refresh shows Welcome Home continue card; stale UC session is bypassed.

---

## Required Evidence

- [x] Implementation files identified
- [x] Canonical routing authority identified (`createFoundationRouting.ts`)
- [x] Unit tests passed (`createFoundationRouting.test.ts`, `checklistCreateFoundationHandoff.test.ts`, identity / event bind tests)
- [x] Frictionless / CREATE fast-path regression updated (Foundation types ≠ UC discovery)
- [x] Authenticated browser proof (local preview)
- [x] Persistence verified (`companion-create-workflow-record-v1`)
- [x] Return / Welcome Home verified after hard refresh
- [x] Stale UC bypass verified
- [x] No UC discovery session created for Checklist
- [ ] Full Projects surface audit (Welcome Home continue proven; Projects browse optional follow-up)
- [ ] Accessibility suite scored for Create Foundation workspace
- [x] No open P0 routing defects for Checklist handoff

---

## Closed Leak Paths (must remain closed)

| Path | Former failure | Closure |
|---|---|---|
| **A** | Sticky UC continuity returned before Foundation handoff | Classify + clear stale Foundation UC **before** `resolveContinuityTurnGate`; `routeTurnToOwner` refuses Foundation UC owners |
| **B** | `openUniversalCreationFromText` false → fallthrough to `tryUniversalCreationFlow` | Explicit Create error + `return` — no UC fallback |
| **C** | `resolveFrictionlessAction` → `tryUniversalCreationFlow` with no Foundation gate | Early Foundation gate at top of frictionless; gates inside `tryUniversalCreationFlow` / `resolveCreateFastPathAction` |

---

## Certification Scenarios

### Scenario 1 — Fresh Checklist → Create Foundation

**Given** `universal-creation-session-v1` cleared; no workflow record  
**When** Member sends `Client Onboarding Checklist`  
**Then**

- No UC discovery session created
- `companion-create-workflow-record-v1` written with `itemType: "Checklist"`
- Checklist workspace opens (Current Focus / Getting Started)
- Title is Checklist-aligned (not Workshop-mashed)

**Evidence (2026-07-20 browser):**

```text
universal-creation-session-v1: null
companion-create-workflow-record-v1: present
  itemType: Checklist
  title: Client Onboarding Checklist
UI: Checklist · Getting Started · CURRENT FOCUS
```

**Result: PASS**

---

### Scenario 2 — Hard refresh → Welcome Home

**Given** Scenario 1 completed  
**When** Hard refresh companion  
**Then** Welcome Home continue card shows **Client Onboarding Checklist** (In Progress)

**Evidence:**

```text
Continue Where You Left Off
Client Onboarding Checklist
In Progress
```

**Result: PASS**

---

### Scenario 3 — Stale UC session cannot trap Checklist

**Given** `universal-creation-session-v1` planted with `documentType: "checklist"`, `questionIndex: 1`  
**When** Member sends `create a brand new client onboarding checklist`  
**Then**

- Stale UC cleared (`ucAfter: null`)
- No discovery questions (`One question at a time` / process-outcome prompts absent)
- Checklist Create Foundation workspace opens again

**Evidence:**

```text
ucBefore: true (qIndex 1)
ucAfter: null
wfItemType: Checklist
discoveryQuestion: false
checklistUi: true · focus: true
```

**Result: PASS**

---

### Scenario 4 — Pre-workspace UC types still use discovery

**Given** Email or sales funnel create request  
**When** Frictionless CREATE path runs  
**Then** UC discovery may still run (`shouldRouteDirectlyToCreateFoundation` = false)

**Evidence:** unit (`createFoundationRouting.test.ts`, `createFastPath.test.ts`)  
**Result: PASS** (unit)

---

## Runtime Map (certified)

| Step | Authority |
|---|---|
| Classification | `resolveCreateFoundationClassification(userText)` before continuity |
| Handoff | `openUniversalCreationFromText` → `startFreshCreateFromEstate` |
| Type label | `workingIntent` → `classificationTypeFromWorkingIntent` |
| Template / structure | Document Classification only (Event bind forbidden for Checklist) |
| Persistence | `commitCreateWorkflowRecord` / durable begin |
| Resume | Active workspace registry + Welcome Home |

---

## Implementation Trace

| Concern | Location |
|---|---|
| Foundation routing helper | `lib/creationIdentity/createFoundationRouting.ts` |
| Identity / classification | `lib/creationIdentity/deriveCreationIdentity.ts` |
| Continuity refuse UC | `lib/conversationContinuity/routeTurnToOwner.ts` |
| Send-path handoff | `app/companion/CompanionPageClient.tsx` (before continuity gate) |
| Frictionless gate | `lib/frictionlessActionLayer.ts` |
| Unit proof | `lib/creationIdentity/createFoundationRouting.test.ts` |

---

## CHECKLIST HANDOFF

**PASS**

---

## Exact Next Recommended Step

1. Optional: confirm Projects browse list shows the same Checklist workspace identity  
2. Record accessibility score for Create Foundation Current Focus surface  
3. Keep Rule of Three — do not reopen UC discovery for Foundation-direct types without board approval
