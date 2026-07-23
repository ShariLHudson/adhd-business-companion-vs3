# Create Registry — Current Architecture Map

**Date:** 2026-07-23  
**Method:** Repository evidence only. Unverified runtime behavior is marked `needs-audit`.  
**Product source of truth (target):** [`../CREATE_MASTER_INVENTORY_AND_REGISTRY.md`](../CREATE_MASTER_INVENTORY_AND_REGISTRY.md)  
**Prior inventory:** [`../../architecture-v2/SPARK_ESTATE_CREATE_EXPERIENCE_INVENTORY_AND_GAP_AUDIT.md`](../../architecture-v2/SPARK_ESTATE_CREATE_EXPERIENCE_INVENTORY_AND_GAP_AUDIT.md)

---

## 1. One-sentence reality

Create today is a **multi-registry discovery surface** (catalog + Browse parents + audit ledger) over **two runtimes**: four guided Universal Work Engine packages, and ~26 simple-artifact drafts sharing one content-generator workspace. There is **no** single master registry with readiness/`isUserVisible` gates matching the master inventory schema.

---

## 2. Architecture map

```text
Member entry
  CreateEstateEntrancePanel
    ├─ Continue Working          → Active Workspace Registry projections
    ├─ “What would you like…”    → resolveCreateBeginOutcome → confirm/open/clarify
    ├─ Find Previous Work        → CreateFindPreviousWorkPanel / draft lists
    └─ Browse More / Help Me Choose → CreateBrowseCategoriesPanel
         └─ CREATE_BROWSE_CATEGORIES + CREATE_PARENT_TYPES
              └─ catalogLabels → CREATE_CATALOG / createWorkflow

Open / create work
  resolveUniversalCreationEntrypoint  (canonical public open API)
  resolveCreateBeginOutcome           (Begin UI ownership)
  launchFromCreate / Anywhere-Origin  → Universal Work Engine (guided types)
  createWorkflow / ContentGenerator   → simple-artifact drafts

Persistence
  creationDurable → companion_creation_workspaces (Supabase)
  activeWorkspaceRegistry → Continue Working / resumeTarget estate-create

Projects
  createProjects/* → optional Project Home link (project_home_id)
```

---

## 3. Key files

| Area | Path | Purpose |
|---|---|---|
| Ownership contract | `lib/createEstate/createOwnershipContract.ts` | Declares canonical owners; quarantines legacy stacks |
| Legacy catalog | `lib/createCatalogData.ts` · `lib/createCatalog.ts` | 42 labeled items, match terms, optional `route` |
| Browse taxonomy | `lib/createEstate/createParentTypes.ts` | 7 categories, 30 parent types |
| Option audit | `lib/createEstate/createOptionAudit.ts` | Label → parent/subtype ledger |
| Launchable filter | `lib/createEstate/activeCreationTypes.ts` | `hasLaunchableCreateWorkflow` gate |
| Begin routing | `lib/createEstate/resolveCreateBeginOutcome.ts` | clarify / confirm / open / error |
| Intent confirmation | `lib/createEstate/createIntentConfirmation.ts` | Spec 131 confidence bands |
| Entrypoint | `lib/universalCreationEntrypoint/` | Anywhere-origin open |
| Guided packages | `lib/universalWorkEngine/packages/{eventPlan,marketingPlan,businessPlan,facebookCommunity}/` | 4 registered work types |
| Work schemas | `lib/workTypeSchema/registry.ts` | Schema map (phantoms: sop/checklist/proposal) |
| Durable save | `lib/creationDurable/` · `supabase/companion_creation_workspaces_schema.sql` | Authoritative persistence |
| Active work | `lib/activeWorkspaceRegistry/` | Resume / continue lists |
| Project link | `lib/createProjects/` | Canonical work ↔ Project Home |
| Entrance UI | `components/companion/CreateEstateEntrancePanel.tsx` | Create home |
| Browse UI | `components/companion/CreateBrowseCategoriesPanel.tsx` | Help Me Choose / Browse More |
| Draft UI | `components/companion/ContentGeneratorPanel.tsx` · CreateWorkspaceV2* | Simple artifacts |

---

## 4. Data flow (discovery → open)

1. Member types free text or picks Browse parent/subtype.
2. Begin path runs `resolveCreateBeginOutcome` (domain detectors + catalog match + confidence).
3. Medium confidence → confirm; high → open; low → clarify. Never silent Work create (Spec 130/131).
4. Open goes through `resolveUniversalCreationEntrypoint` / launch helpers.
5. Guided types attach a registered work-type package + blueprint sections.
6. Other labels fall into shared create workflow → draft generator.

---

## 5. Persistence flow

1. Workspace identity + payload written via `creationDurable` to `companion_creation_workspaces`.
2. Active Workspace Registry projects rows for Continue Working.
3. Browser memory / localStorage alone is **not** durable success.
4. Reopen uses registry resume targets (`estate-create`) + hydrate pipeline.
5. Archive / trash / delete statuses live on registry entries — **needs-audit** for every simple-artifact path end-to-end in browser.

---

## 6. Routing flow

| Entry | Converges? | Notes |
|---|---|---|
| Create home Begin | Yes (Begin owner) | `resolveCreateBeginOutcome` |
| Browse More / Help Me Choose | Mostly | Resolves to catalog labels then open |
| Shari / Anywhere-Origin | Yes (entrypoint) | `resolveUniversalCreationEntrypoint` + launch |
| Direct/deep links | **needs-audit** | Multiple historical shells still exist |
| Client Avatar card | Routed away | `route: "client-avatars"` — not a Create output |

Parallel stacks (`universalCreation/`, platform intent blueprint registry, Explore Ideas cards) still exist; ownership contract marks some as quarantine/adapters.

---

## 7. Profile / avatar flow

| Concern | Current state |
|---|---|
| Based on Your Business (Create home) | **Not present** as a named entrance section |
| Business Profile prefill | Blueprint `profileContext` stack (273–278) for guided work types — not Create catalog |
| Client Avatar in Create | Catalog routes out; audit `keep: false` |
| Multi-avatar selection on create | **Not found** on Create entrance |
| Context suggestions | `contextAwareSuggestions.ts` uses **recent work type**, not full Business Profile |

---

## 8. Project handoff flow

1. Optional connect via `createProjects/connectCanonicalWorkToProjectHome.ts`.
2. Source creation should remain; Project stores source reference (`project_home_id`).
3. Guided types have stronger bridges (e.g. Facebook Community explicit-only).
4. Simple artifacts often use Project picker — automatic always-on handoff **needs-audit**.
5. Target master rule: Create = content source of truth; Projects = execution — **partially implemented**, not certified.

---

## 9. What is *not* in the current architecture

- Single `CreationRegistryItem` schema with lifecycle + verification flags  
- Nine master categories (Market & Grow / Sell & Convert / Develop Ideas / …)  
- `isUserVisible` computed from `ready` + route/save/reopen/actions verified  
- Browse by Goal (as named surface)  
- Contextual How Do I… driven by registry metadata  
- Chamber / Cartography / Board recommendations driven by registry IDs  

---

## 10. Safe migration seam

Keep Begin + entrypoint + durable save + four guided packages stable. Introduce a new canonical registry **beside** `CREATE_PARENT_TYPES` / `CREATE_CATALOG`, migrate a small set of working types first, then point Browse/Help Me Choose/Begin matching at the registry without deleting launchable workflows.
