# Create Registry — Audit Executive Summary

**Date:** 2026-07-23  
**Audit prompt:** [`../CREATE_REGISTRY_REPOSITORY_AUDIT_CURSOR_PROMPT.md`](../CREATE_REGISTRY_REPOSITORY_AUDIT_CURSOR_PROMPT.md)  
**Master inventory (product SoT):** [`../CREATE_MASTER_INVENTORY_AND_REGISTRY.md`](../CREATE_MASTER_INVENTORY_AND_REGISTRY.md)  
**Detail pack:** this folder (`create-registry-*-*.md`)

---

## Verdict

Create is **architecturally fragmented but not empty**. Four guided work types are real; ~26 Browse peers are simple drafts behind the same menu. The master inventory’s readiness/`isUserVisible` rule is **not implemented**. First safe move: **registry foundation + honesty**, not mass builder builds.

The two Downloads master inventory files (`…registry.md` and `…registry (1).md`) are the same product spec — filed once as `CREATE_MASTER_INVENTORY_AND_REGISTRY.md`.

---

## Counts (evidence-based)

| Metric | Count | Notes |
|---|---:|---|
| Repository-defined catalog labels | **42** | `createCatalogData.ts` |
| Browse parent types | **30** | `createParentTypes.ts` |
| Browse categories (current) | **7** | not master 9 |
| Guided UWE work types registered | **4** | Event, Marketing Plan, Business Plan, Facebook Community |
| Simple-artifact parents | **26** | shared content-generator depth |
| Routed away | **1** | Client Avatar |
| Production Ready (browser certified) | **0** | browser NOT_RUN |
| Working with limitations | **4** | guided + unit/foundation tests |
| Partially built | **26** | draft depth |
| Visible but broken (proven) | **0 proven** | overclaim risk instead |
| Wrong route | **1** | Client Avatar (intentional) |
| Generic placeholder / Coming Soon in catalog | **0 proven** | Personal category empty (“more on the way”) |
| Duplicate clusters | **several** | see gap analysis |
| Obsolete / stale docs | **yes** | e.g. “33 items” simplification report |
| Missing release essentials | **yes** | visibility honesty, Based on Your Business, browser cert, How Do I… |
| Save failures (proven this pass) | **needs-audit** | durable path exists |
| Reopen failures (proven this pass) | **needs-audit** | resume path exists |
| Project handoff failures (proven) | **needs-audit** | bridges partial |
| Profile/avatar Create-home gaps | **yes** | Based on Your Business missing; avatar not Create output |

Under the **master visibility rule**, user-visible ready types today: **0**.  
Under **current UI gates**, members still see launchable catalog/Browse peers.

---

## What works (keep)

- Ownership contract + Begin outcomes (clarify/confirm/open/error)  
- Durable `companion_creation_workspaces` + Active Workspace Registry  
- Four UWE packages with foundation tests  
- Help Me Choose / Browse More / Continue Working / Find Previous Work  
- Create→Project linking primitives (`createProjects/*`)

---

## What must not be assumed

- Menu parity ≠ guided depth  
- Filenames / blueprint counts ≠ production ready  
- Profile context docs ≠ Create-home personalization  
- `resolveWorkTypeIdFromLabel` ≠ registered schema  

---

## Recommended first implementation PR

**Title:** `feat(create): add canonical creation registry foundation with visibility gates`

**Scope:**

- Add `lib/createRegistry/` types, master 9 categories, seed items for the 4 guided types (+ optional bridge helpers)  
- `computeIsUserVisible` + unit tests  
- Document dual-read migration; **no** Create UI redesign  

**Non-goals:** new builders; Based on Your Business UI; deleting `CREATE_CATALOG`; renaming Browse in the same PR  

**Acceptance:**

- [ ] Types match master inventory schema  
- [ ] Visibility is false unless status ready **and** verification flags true  
- [ ] Seeds cover 4 guided types with stable IDs  
- [ ] Existing Begin/Browse/UWE paths unchanged  
- [ ] Tests pass for visibility + seed integrity  

**Follow-on:** Phase 1 browser cert for the 4; Phase 3 point Browse/Begin at registry.

---

## Deliverables index

| File | Contents |
|---|---|
| [`create-registry-current-architecture.md`](./create-registry-current-architecture.md) | Architecture + flows |
| [`create-registry-audit-matrix.md`](./create-registry-audit-matrix.md) | Per-type matrix |
| [`create-registry-gap-analysis.md`](./create-registry-gap-analysis.md) | Master vs current gaps |
| [`create-registry-implementation-plan.md`](./create-registry-implementation-plan.md) | Phases 1–7 |
| This summary | Counts + first PR |

**Related prior audit:** `docs/architecture-v2/SPARK_ESTATE_CREATE_EXPERIENCE_INVENTORY_AND_GAP_AUDIT.md`

---

## Audit completeness checklist

- [x] Current Create definitions located  
- [x] User-facing entry points located  
- [x] Discoverable types listed with evidence-based status  
- [x] Routes/builders mapped  
- [x] Persistence traced  
- [x] Profile/avatar traced  
- [x] Create→Project traced  
- [x] Reconciled with master inventory categories  
- [x] Duplicates/aliases identified  
- [x] Release-essential gaps listed  
- [x] Phased plan actionable  
- [x] First PR bounded  
- [x] Unverified items marked needs-audit (not asserted as fact)
