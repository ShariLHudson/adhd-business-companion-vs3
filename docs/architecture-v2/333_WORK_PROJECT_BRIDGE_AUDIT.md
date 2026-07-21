# 333 — Work / Project Bridge Audit

**Date:** 2026-07-21  
**Governing spec:** [330](./330_UNIVERSAL_WORK_COLLECTION_BLUEPRINT_AND_PROJECT_BRIDGE.md)  
**Related:** [326 Gap Analysis](./326_ARCHITECTURE_GAP_ANALYSIS.md) · Createability 233–236 · UWE  
**Mode:** Audit only — do not invent a second Project system  
**Verdict:** Bridge is **declared and recommended**, not **implemented as an intentional handoff contract**

---

## 1. Authoritative ownership (330)

| Concern | Must own | Repo today |
|---------|----------|------------|
| Work ID / type / history / resume | Universal Work | UWE Work identity + blueprint state |
| Create content SoT | Create / UWE sections & outputs | Section content on Work |
| Execution plan / tasks / dates | Projects | Project Homes / Projects panel (separate) |
| Collection experience framing | Collection owner (planned) | Informal / Estate rooms only |
| Blueprint guidance | Blueprint definition | UWE Blueprint registry |

**Rule to preserve:** Create remains source of truth for content. Projects manages execution. Bridge links — does not clone SoT.

---

## 2. What exists

| Artifact | Location | Behavior |
|----------|----------|----------|
| `capabilities.projectBridge` | Work Type package registration | Boolean — Event / Marketing / Business = true |
| `projectBridgeRecommendations` | `BlueprintDefinition` | Advisory strings (“Bridge when…”) |
| Createability handoff fields | 233–236 types + cert gate | `projectHandoff` + tests when claimed |
| Work relationships / cartography | UWE relationship helpers | Can link Work objects; not Project-specific bridge API |
| Suggested tasks / milestones | Blueprint definitions | Planning hints inside Create — not Project tasks |
| Projects product surface | `components/companion/projectHomes/` etc. | Member can manage projects independently |

---

## 3. What is missing (330 contract)

| Required bridge behavior | Status |
|--------------------------|--------|
| Explicit handoff offer (permission) | Missing shared API |
| Accept → create/link Project without copying Create body as new SoT | Missing |
| Decline → continue in Create | Missing (no-op by absence only) |
| Preserve Work ID on Project | Missing guaranteed link model |
| Partial Project creation compensating action | Missing (see 334) |
| Blueprint-proposed tasks → Project tasks with lineage | Missing |
| Collection view of same Work in Projects | Missing |
| Handoff provenance (who/when/why) | Missing |
| Createability: handoff claimed ⇒ tests + runtime | Gate exists; runtime absent → cert blocked |

---

## 4. Risk of wrong implementation

| Anti-pattern | Why it fails 330 |
|--------------|------------------|
| Copy section text into Project notes as new master | Dual SoT / drift |
| Auto-create Project on Blueprint start | Permission violation · cognitive load |
| Private bridge per Work Type package | Parallel runtimes |
| Treat `projectBridge: true` as “handoff works” | False availability |

---

## 5. Safe next slice

Align with [332 R1](./332_RUNTIME_COMPOSITION_IMPLEMENTATION_PLAN.md):

1. `lib/universalWorkEngine/projectBridge/` types: `HandoffOffer` · `acceptHandoff` · `declineHandoff`  
2. One Blueprint with `projectHandoff: optional` on one createability output  
3. On accept: create Project shell + relationship `workId` ↔ `projectId`; **do not** duplicate Create content  
4. Tests: accept · decline · Create still authoritative  

Do not wire auto-handoff into Shari or launch paths until accept/decline is proven.
