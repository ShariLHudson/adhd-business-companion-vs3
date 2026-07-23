# Create Registry — Phased Implementation Plan

**Date:** 2026-07-23  
**Rule:** Preserve working Begin / entrypoint / durable save / four guided packages. Incremental migration only.

---

## Phase 1 — Stabilize release blockers (complexity: L)

**Goals:** Trust before taxonomy.

| Work | Impact | Risk | Files likely |
|---|---|---|---|
| Founder/browser certify save + reopen for 4 guided types | High | Medium | creationDurable, UWE packages, founder validation |
| Trace simple-artifact save certainty (Spec 113) | High | Medium | ContentGeneratorPanel, createDraftPersistence, creationDurable |
| Quarantine/hide known wrong peers (overclaiming multi-artifact) *or* label depth honestly | High | High (product call) | createParentTypes, entrance copy |
| Prove Workshop → Event Plan; phantom sop/checklist/proposal IDs | Medium | Medium | inferWorkType, workTypeSchema |
| Project source-link non-duplication smoke | Medium | Medium | createProjects/* |

**Tests:** durable hydrate/save; resume lists; non-regression Begin clarify/confirm/open.  
**Rollback:** feature flags on any visibility changes; no schema drop.  
**PR boundary:** trust-only; no 9-category rename yet.

---

## Phase 2 — Canonical registry foundation (complexity: M) ← **first recommended product PR**

**Goals:** Types + categories + readiness validation; migrate **only** the 4 guided types + a few honest simple types as `needs-audit` / not user-visible under master rule.

| Deliverable | Notes |
|---|---|
| `CreationLifecycleStatus` + `CreationRegistryItem` types | Match master inventory schema |
| Category + subcategory records for master 9 | Seed data; Browse can still show 7 until Phase 3 |
| Visibility helper `computeIsUserVisible(item)` | Pure function + unit tests |
| Seed entries for event_plan, marketing_plan, business_plan, facebook_community | `lifecycleStatus: "needs-audit"` or `"testing"` until browser pass |
| Adapter: `registryItemFromParentType` / catalog bridge | Dual-read; do not delete CREATE_CATALOG yet |

**Files to add (proposed):**

- `lib/createRegistry/types.ts`  
- `lib/createRegistry/categories.ts`  
- `lib/createRegistry/items.seed.ts`  
- `lib/createRegistry/visibility.ts`  
- `lib/createRegistry/visibility.test.ts`  
- `lib/createRegistry/index.ts`  

**Files to modify (minimal):** none required for UI yet; optional re-export from createEstate for discoverability.

**Tests:** schema shape; visibility false unless all verified; seed IDs stable; no emoji required in registry.  
**Non-goals:** UI redesign; Based on Your Business; new builders.  
**Rollback:** unused module — delete or leave unused.  
**Complexity:** M  
**Suggested PR title:** `feat(create): add canonical creation registry foundation with visibility gates`

---

## Phase 3 — Migrate Create discovery (complexity: L)

**Goals:** Browse / Help Me Choose / Begin matching / search / recent read from registry.

| Step | Dependency | Complexity |
|---|---|---|
| Map 7→9 categories in Browse UI | Phase 2 | M |
| Help Me Choose parents from registry | Phase 2 | M |
| Begin `matchCatalogFromText` → registry aliases | Phase 2 | M |
| Continue Working unchanged (registry projections) | — | S |
| Add Based on Your Business section (profile signals) | Profile APIs | L |
| Remove duplicate Explore Ideas taxonomy | After Browse stable | S |

**Risk:** breaking Begin heuristics — keep adapters + golden tests for known prompts.  
**PR boundaries:** one PR categories; one PR Begin matching; one PR Based on Your Business.

---

## Phase 4 — Business and avatar context (complexity: L)

- Selected business context on create  
- Saved avatar + multi-avatar modes from master inventory  
- Progressive, optional profile prompts  
- Inherit into Project home  

**Depends on:** Business Estate / People I Help data models.  
**Risk:** Medium — keep non-blocking.

---

## Phase 5 — Contextual How Do I… (complexity: M)

- Registry `help` metadata  
- Page-aware + route-aware help  
- Action-oriented steps (not architecture jargon)

---

## Phase 6 — Certify release-essential builders (complexity: XL overall; ship as many M PRs)

Prioritize repair/build only after visibility honesty:

1. Event Plan (deepen ops only if release-essential)  
2. Marketing Plan (second blueprint depth)  
3. Business Plan deliverable manifests  
4. Facebook Community browser cert  
5. Then highest-value simple→guided promotions (e.g. Offer, Funnel) **one at a time**

Do **not** attempt all planned master-inventory types.

---

## Phase 7 — Relationship intelligence (complexity: L)

- Usually Created Together  
- Bundle suggestions  
- Chamber / map / Board recommendations from registry IDs  

---

## Suggested sequence vs audit prompt

Matches audit §15 order. Only deviation: Phase 1 visibility honesty may temporarily **reduce** visible peers before Phase 2 registry lands — prefer labeling depth over silent dead cards.

---

## Rollback considerations (global)

- Keep `CREATE_CATALOG` until Begin + Browse dual-read proven.  
- Never delete UWE package registration in a registry PR.  
- Visibility tighten behind flag `createRegistryVisibilityV1`.  
- Durable schema changes additive only.
