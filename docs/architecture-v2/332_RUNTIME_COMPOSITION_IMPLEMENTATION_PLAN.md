# 332 — Runtime Composition Implementation Plan

**Date:** 2026-07-21  
**Governing specs:** [327](./327_CAPABILITY_EXECUTION_AND_CONTRIBUTION_RUNTIME.md)–[331](./331_RUNTIME_RESILIENCE_RECOVERY_AND_SAFE_DEGRADATION.md)  
**Gap analysis:** [326](./326_ARCHITECTURE_GAP_ANALYSIS.md)  
**Related:** [311 Adaptive](./311_ADAPTIVE_INTELLIGENCE_IMPLEMENTATION_PLAN.md) · [316 Governance](./316_GOVERNANCE_AND_REGISTRY_AUDIT.md) · [325 Observability](./325_OBSERVABILITY_IMPLEMENTATION_PLAN.md) · Createability 233–236  
**Mode:** Plan — extend UWE / Chamber / Projects; **no parallel runtime**  
**Primary slice:** R1 — one vertical composition proof

---

## 1. Goals

1. Make at least one capability **executable** through a predictable contract (327).  
2. Compose that capability inside one Collection experience (328).  
3. Produce one canonical Output with provenance (329).  
4. Offer one intentional Project handoff (330).  
5. Prove one failure path does not lose Work (331).  

---

## 2. Non-goals (this plan)

- Platform-wide Domain Capability Registry rewrite  
- All Blueprints createability-certified  
- New Work identity system  
- Member-facing architecture dashboard  
- Automatic Project creation without permission  

---

## 3. Slice sequence

### R1 — Vertical composition proof (smallest safe)

| Piece | Recommendation | Notes |
|-------|----------------|-------|
| Capability | One Events or Marketing DomainCapability adapter | Reuse Events package or a single marketing capability; types in `lib/universalWorkEngine/capabilityExecution/` |
| Collection | Workshop Event **or** Handmade Business façade | Collection ID + owner Member + contributors list only — not a new folder system |
| Work | Existing `event_plan` or `business_plan` Work | `initializeWorkFromBlueprint` |
| Output | One deliverable promoted to typed Output | Align with createability entry; status `draft` → `awaiting_review` → `approved` |
| Project handoff | Optional bridge after approve | Accept / Decline; link Work↔Project; Create remains SoT |
| Recovery test | Capability unavailable | Retain request · no Work mutation · Shari-safe message · resume |

**Success:** One integration test file covers request → contribution → approve output → handoff accept/decline → capability failure.

### R2 — Execution contract hardening

- Input/output schema validation  
- Approval modes (advisory / draft / transform)  
- Timeout + certified fallback declaration  
- Provenance fields on every contribution (318/323)

### R3 — Collection orchestration modes

- Explore / Guided / Direct Work (328) for the pilot Collection only  
- Exact resume of Collection progress on UWE Work state  

### R4 — Output synthesis rules

- Deduplicate contributor text  
- Assumptions vs facts  
- Export integrity when claimed  

### R5 — Scale adapters

- Second Collection  
- Registry kernel read adapters (316 G1–G2) feeding execution  
- Createability promote: pilot Blueprint `pass_with_declared_limits`

---

## 4. Alignment with prior plans

| Plan | Relationship |
|------|----------------|
| 311 Adaptive | R1 may read Adaptive Context when façade exists; do not block R1 on it |
| 316 Governance | Capability IDs via aliases; no registry greenfield |
| 325 Observability | Log execution correlation IDs privately; O1 can later count execution failures |
| 233–236 Createability | Pilot output must not claim `available` until createability gates pass |

---

## 5. Proposed code homes (extend, don’t fork)

| Concern | Home |
|---------|------|
| Capability execution types + runner | `lib/universalWorkEngine/capabilityExecution/` |
| Collection composition façade | `lib/universalWorkEngine/collections/` (pilot definitions only) |
| Output contract | `lib/universalWorkEngine/outputs/` (or extend createability types) |
| Project bridge | `lib/universalWorkEngine/projectBridge/` calling existing Projects APIs |
| Recovery helpers | Reuse `companionContextRouting` + UWE mutation guards |

---

## 6. Testing plan (R1)

- Unit: execution request validation  
- Unit: advisory mode cannot mutate Work  
- Unit: draft apply requires approval  
- Integration: full vertical  
- Integration: capability timeout / unavailable → Work unchanged  
- Integration: Project handoff declined → no Project; Work intact  
- Integration: Project handoff accepted → link only; Create content not copied as new SoT  

---

## 7. Completion criteria for this landing (docs)

- Specs **327–331** stored  
- Gap analysis **326** complete  
- Plan **332** + audits **333–334** complete  
- **317** Master Index updated  

**R1 code:** separate focused PR when approved.
