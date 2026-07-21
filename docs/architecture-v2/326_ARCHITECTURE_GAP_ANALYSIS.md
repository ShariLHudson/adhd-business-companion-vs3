# 326 — Architecture Gap Analysis

**Date:** 2026-07-21  
**Prerequisites:** Architecture v2 **300–325** · Createability **233–236** · UWE live  
**Governing next specs:** [327](./327_CAPABILITY_EXECUTION_AND_CONTRIBUTION_RUNTIME.md)–[331](./331_RUNTIME_RESILIENCE_RECOVERY_AND_SAFE_DEGRADATION.md)  
**Mode:** Repository-grounded gap analysis — **do not create a parallel runtime**  
**Verdict:** Strong Work/Blueprint/Chamber/recovery fragments exist; **executable capability contracts, Collection orchestration runtime, canonical output synthesis, and intentional Project handoff are the largest composition gaps**

---

## 1. Purpose

Compare Architecture v2 specifications to the current companion-app implementation before broad Runtime Composition work (327–331).

---

## 2. Architecture v2 vs repository (summary)

| Layer (specs) | Spec intent | Repo today | Gap |
|---------------|-------------|------------|-----|
| Object model (301) | Canonical intelligence objects | UWE Work · Brain hooks · partial | DomainCapability / Collection / Contribution objects incomplete |
| Members (302) | Canonical Member files | `chamberMemberRegistry` (24) | File-family depth uneven; not execution contracts |
| Capabilities (303/310/327) | Executable DomainCapabilities | RoutingCapability + Events domain + companion registries | **No platform capability execution runtime** |
| Collections (304/328) | Orchestrated business experiences | Estate room collections + informal Handmade defs | **No Intelligence Collection composition runtime** |
| Adaptive (306–311) | Context / capability / NBA | DayState · Adapt My Day · Support Style · overwhelm | Adaptive Context façade not shipped (311 Slice 1) |
| Registry kernel (312–316) | Shared entry contract | Many live registries | Kernel types + adapters pending (316 G1) |
| Knowledge / provenance (318–323) | Retrieval + contribution provenance | Brain · canon · Research approve | Unified provenance contract missing |
| Privacy (320/324) | Data classes · temp vs durable | Hospitality permissions · DayState | No unified data-class tags |
| Observability (321/325) | Architecture health | Failure isolation · HCV/CIE | O1 health report not built |
| Createability (233–236) | Every promised output creatable | Seed blocked manifests | All Blueprints createability-blocked |
| Runtime composition (327–331) | Execute → compose → synthesize → bridge → recover | Fragments only | **This series** |

---

## 3. Universal Work Engine

| Present | Path / notes |
|---------|--------------|
| Work Types | `event_plan` · `marketing_plan` · `business_plan` |
| Blueprint registry | `lib/universalWorkEngine/blueprints/registry.ts` (~23 Blueprints) |
| Launch / origin | `launchFromCreate` · `launchFromShari` · `launchFromOrigin` |
| Research approve-before-apply | Strong mutation gate |
| Exact resume (questions/sections) | Work blueprint state store |
| Duplicate Work prevention | Foundation cert tests |
| Createability manifests | Provisional blocked seeds (233–236) |

| Missing vs 327–330 |
|--------------------|
| Capability execution request/response contract |
| Multi-capability contribution merge with conflict validation |
| Collection-owned orchestration sequence |
| Canonical Output object linked to Work (beyond section assembly / deliverable strings) |
| Project bridge implementation (capability flag + recommendations only) |

---

## 4. Blueprint framework

| Present | Gap |
|---------|-----|
| `BlueprintDefinition` structure, depth modes, adaptive questions | Outputs = `deliverables: string[]` until hand-authored createability manifests |
| Document/section assembly | Not full 329 synthesis (multi-contributor, assumptions, export contract) |
| `projectBridgeRecommendations` | Advisory copy — not intentional handoff runtime |
| Foundation certification | Necessary; createability cert currently **blocked** for all |

---

## 5. Chamber runtime

| Present | Gap |
|---------|-----|
| Member roster + room panels | Members are conversational/domain guides — not 327 executable capabilities |
| Perspective / isolation on leave | Strong (usability Phase 1) |
| Knowledge packs (uneven) | Not wired as contribution runtime with schemas |
| Events domain capabilities | Closest executable pattern — not platform-general |

---

## 6. Project bridge

| Present | Gap |
|---------|-----|
| Work Type `capabilities.projectBridge: true` | Boolean declaration only |
| Blueprint `projectBridgeRecommendations` | Human guidance strings |
| Projects room / project homes | Separate product surface |
| Createability handoff gate | Tests required when claimed; no shared bridge API |

**Gap:** No authoritative Create→Project handoff that preserves Create as source of truth, avoids duplicate content ownership, and supports accept/decline (330).

---

## 7. Output generation

| Present | Gap |
|---------|-----|
| Section content assembly from Blueprint state | Multi-contributor synthesis (329) |
| Research attachments | Universal Output status lifecycle |
| Artifact / create-estate Begin types | Bound to Work ID + provenance + edit/resume |
| Export actions (panel-level) | Declared formats on Output contract + integrity tests |
| Createability output types (234) | Typed registry exists; Blueprints not certified against it |

---

## 8. Recovery patterns

| Present | Path / notes |
|---------|--------------|
| Estate failure isolation | `routeCompanionFailure` · `sanitizeEstateFacingCopy` · `logCompanionSystemFailure` |
| Question skip/recover | `recoverSkippedQuestion` |
| Duplicate Work guards | Launch / foundation certs |
| Research review gate | Prevents unsafe apply |
| Parking Lot / CMM load resolution | Usability Phase 1 targets |
| Draft autosave (various rooms) | Uneven; not one Output draft contract |

| Missing vs 331 |
|----------------|
| Capability timeout / fallback matrix |
| Partial Collection assembly disclosure |
| Compensating actions for partial Project creation |
| Unified incident → Work-safe recovery checklist |
| Createability-aware “unavailable output” UX honesty |

---

## 9. Registries (pointer)

Full map: [316](./316_GOVERNANCE_AND_REGISTRY_AUDIT.md).  
Runtime composition must **call** existing registries via adapters — never fork UWE, Chamber, or Estate Brain.

---

## 10. Tests (what already proves integrity)

- UWE foundation / blueprint cert suites (structure, resume, duplicate prevention)
- Anywhere-origin certification (104)
- Createability audit suite (233–236) — currently asserts **blocked**
- Estate context isolation tests
- Chamber leave isolation / conversation continuity tests

**Missing:** capability execution contract tests · Collection composition tests · Output synthesis provenance tests · Project handoff accept/decline · failure-recovery for capability timeout

---

## 11. Preferred first slice (binding recommendation)

Do **not** build a parallel runtime. Prove one thin vertical:

1. **One certified capability execution contract** (types + adapter; Events or Marketing positioning candidate)
2. **One cross-member Collection** (e.g. Handmade Business or Workshop Event Collection façade)
3. **One canonical Work item** (existing UWE Work Type)
4. **One approved output** (createability-aware; draft→review→approve)
5. **One intentional Project handoff** (accept/decline; Create remains SoT)
6. **One failure-recovery test** (capability unavailable → preserve Work + disclose)

See [332](./332_RUNTIME_COMPOSITION_IMPLEMENTATION_PLAN.md).

---

## 12. Forbidden until plan says otherwise

- Second Work engine  
- Parallel Collection runtime that bypasses UWE  
- Shadow Project that copies Create content as new SoT  
- Broad Domain Capability rewrite before one execution contract  
- Presenting createability-blocked outputs as fully available  
