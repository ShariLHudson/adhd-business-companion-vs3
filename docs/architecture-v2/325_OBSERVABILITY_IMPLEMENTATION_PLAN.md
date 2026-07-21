# 325 — Observability Implementation Plan

**Date:** 2026-07-21  
**Governing specs:** [321](./321_INTELLIGENCE_OBSERVABILITY_AUDIT_AND_ARCHITECTURE_HEALTH.md) · [322](./322_PLATFORM_MASTER_INDEX_AND_DOCUMENTATION_GRAPH_ARCHITECTURE.md) · [312](./312_UNIVERSAL_REGISTRY_ARCHITECTURE.md) · [316](./316_GOVERNANCE_AND_REGISTRY_AUDIT.md)  
**Related audits:** [323 Knowledge](./323_KNOWLEDGE_AND_PROVENANCE_AUDIT.md) · [324 Privacy](./324_PRIVACY_AND_ADAPTATION_AUDIT.md)  
**Mode:** Plan — improve architecture visibility **without** changing user-facing behavior first  
**Verdict:** Telemetry and failure isolation exist; **architecture health reporting and documentation graph automation do not**

---

## 1. Current observability inventory

| Layer | Present | Path / notes |
|-------|---------|--------------|
| System failure logging | Yes (dev) | `logCompanionSystemFailure` — never member-facing |
| Estate error isolation | Yes | `estateContextIsolation` · Shari recovery voice |
| Conversation quality telemetry | Partial | HCV / CIE / CQRI buffers — no conversation bodies |
| Create orchestration observability | Doc + some runtime | `083_007_OBSERVABILITY_AND_EVENTS.md` |
| Routing / Work integrity logs | Partial | UWE audit trails; not unified architecture health |
| Architecture health dashboard | **Missing** | Spec’d in 321 |
| Documentation graph / machine Master Index | **Missing** | 317 is human Markdown; 322 wants graph + export |
| User-reported quality signals | Informal | Corrections exist; not structured 321 signals |

---

## 2. Missing health checks (priority)

| Check | Severity if broken | First detector |
|-------|--------------------|----------------|
| Duplicate canonical Work creation | Critical | Extend UWE tests / launch guards |
| Private persistence path / shadow Work | Critical | Architecture boundary tests (already some UWE guards) |
| Missing owner on production DomainCapability | High | After Capability Registry façade |
| Uncertified / revoked dependency in production | High | Certification Registry (later) |
| Cross-business private-data leak | Critical | After multi-business DNA |
| Energy/motivation conflation | Moderate | Adaptive Context façade unit tests |
| Awaiting-answer / mention-launch violations | High | Existing tests — keep green; add CI health summary |
| Stale Master Index / broken doc links | Moderate | Doc graph slice |
| Missing provenance on material Research apply | Moderate | Provenance contract (323) |

---

## 3. Recommended safe implementation slice (primary)

### Slice O1 — Architecture Health Report (offline / CI)

**Goal:** Visibility without UX change.

**Build:**

1. `lib/architectureV2/health/` (types only first, then collectors)  
2. Collectors that **read** existing registries and emit a markdown/JSON report:  
   - UWE Work Type + Blueprint counts  
   - Chamber Member count  
   - Duplicate-risk naming notes (static list from 316)  
   - Presence of required Architecture v2 docs (300–325) via filesystem  
   - Optional: cert test file presence globs  
3. Vitest or script: `architectureHealth.report.test.ts` fails only on **critical** structural absences (e.g. missing Constitution 315 file), not on soft warnings  
4. Human output: `docs/architecture-v2/evidence/ARCHITECTURE_HEALTH_LATEST.md` (generated, optional in CI artifact)

**Explicitly out of scope for O1:**

- New logging pipeline  
- New profile store  
- New retrieval/RAG stack  
- Member-facing dashboard  
- Changing Shari responses  

**Success:** Maintainers and agents can open one health report and see SoT risks without rediscovering the repo.

---

## 4. Follow-on slices

| Slice | Focus | Depends on |
|-------|-------|------------|
| **O2** | Documentation metadata front-matter + link integrity for `docs/architecture-v2/` | 322 · 317 |
| **O3** | Provenance contract types + Research/UWE contribution attach points | 318 · 323 |
| **O4** | Adaptive Context façade + choice-limit metrics (private) | 311 · 324 |
| **O5** | Structured user quality signals (correction → enum) — store anonymized counts | 321 · conversation continuity |
| **O6** | Registry kernel health (orphans, missing owners) | 312 · 316 G1–G2 |
| **O7** | Member-facing architecture dashboard (founder-only first) | O1 stable |

---

## 5. Alignment with prior plans

| Plan | Overlap |
|------|---------|
| 311 Adaptive | O4 = Adaptive Context façade |
| 316 Governance | O1/O6 = registry visibility; G1 kernel types can feed health |
| 317 Master Index | O2 extends 317 toward 322 graph |
| 305 Foundation | Duplicate-risk list seeds O1 static rules |

**Order preference:** O1 (this plan’s primary slice) can ship **before** Domain Capability Registry. Do not wait for Workshop pilot.

---

## 6. Privacy of observability

- Logs must not include conversation bodies, health details, or full Business DNA  
- Prefer IDs, enums, counts, and severities  
- Follow Estate isolation: never surface health internals in member chat  
- User-reported signals stored as categories, not raw rant text, when automated  

---

## 7. Testing plan for O1

- Unit: collectors return stable shape  
- Unit: missing 315 / 317 / UWE index export fails critical  
- Unit: soft warnings do not fail CI by default  
- No browser tests required for O1  

---

## 8. Completion criteria for this landing (docs)

- Specs **318–322** in `docs/architecture-v2/`  
- Audits **323–324** complete  
- This plan **325** names O1 as the visibility-first slice  
- **317** Master Index updated  

**Implementation of O1 code:** separate focused PR when approved.
