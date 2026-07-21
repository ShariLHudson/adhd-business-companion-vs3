# 334 — Resilience and Recovery Audit

**Date:** 2026-07-21  
**Governing spec:** [331](./331_RUNTIME_RESILIENCE_RECOVERY_AND_SAFE_DEGRADATION.md)  
**Related:** [326](./326_ARCHITECTURE_GAP_ANALYSIS.md) · Estate context isolation · UWE mutation guards  
**Mode:** Audit only — extend existing recovery; do not add a second logging/UX failure product  
**Verdict:** Member-facing failure isolation is strong; **capability/Collection/Project composition failure modes are largely unspecified in runtime**

---

## 1. Resilience priorities (331) vs today

| Priority | Status | Evidence |
|----------|--------|----------|
| 1. Preserve user input | Partial–strong | CMM `originalText` · various drafts · chat input rules |
| 2. Preserve canonical Work | Strong | UWE Work identity · no silent second Work (cert tests) |
| 3. Prevent duplicate Work | Strong | Launch duplicate prevention tests |
| 4. Prevent unsafe mutation | Strong | Research approve-before-apply · foundation certs |
| 5. Preserve provenance | Partial | Research / Brain; not universal Output provenance |
| 6. Useful fallback | Partial | Shari recovery voice; not capability fallback matrix |
| 7. Support recovery | Partial | `recoverSkippedQuestion` · Estate route recovery UI |
| 8. Record incident | Dev-only | `logCompanionSystemFailure` — never member-facing |

---

## 2. Failure category map

| Category (331) | Current handling | Gap |
|----------------|------------------|-----|
| Registry unavailable | Uncommon; hard fail / empty | No certified degraded catalog UX |
| Capability unavailable | N/A (no execution runtime) | Need retain-request + disclose (R1) |
| Contributor timeout | N/A | Timeout + fallback fields on 327 contract |
| Connected source unavailable | Integration-specific | Must not invent content (estate isolation helps) |
| Model generation failure | Chat failure routing | Good member copy; Work may be untouched |
| Database error | Varies by surface | No unified Work-safe checklist |
| Conflict | Blueprint overwrite approvals | Good pattern to reuse for Output merge |
| Stale context | Continuity / correction paths | Adaptive temp context decay incomplete |
| Approval failure | Research review | Extend to Output approve |
| Export failure | Panel-level | Createability export integrity |
| Browser/navigation | Estate route recovery | Living Place leave restores origin (nav standard) |
| Partial Project creation | **Missing** | Compensating action required before bridge ships |
| Duplicate detection uncertainty | Prefer no invent | Keep “ask / don’t create” |
| Permission failure | Various | Never escalate to technical instructions in chat |

---

## 3. Safe degradation patterns already in repo

| Pattern | Home | Reuse for 327–331 |
|---------|------|-------------------|
| Shari recovery voice | `routeCompanionFailure` | Capability / Collection failures |
| Never expose system internals | `sanitizeEstateFacingCopy` | All composition errors |
| Approve before apply | Research attachments | Output + capability transformation |
| Exact resume | Blueprint question/section state | Collection progress |
| Soft structure undo | Blueprint structure editing | Prefer over hard delete |
| Loading must resolve | Usability Phase 1 | Collection assemble / capability wait |

---

## 4. Draft preservation

| Surface | Autosave / recover | Notes |
|---------|-------------------|-------|
| UWE section content | Work blueprint state | Strong for Create Work |
| Clear My Mind | Capture preserve rules | Trust-critical |
| Journal / Evidence | Room-specific | Uneven |
| Canonical Output (329) | **Missing** | Need draft snapshots when R1 lands |
| Project handoff mid-flight | **Missing** | 333 + compensating actions |

---

## 5. Required recovery tests (before R1 ships)

1. Capability unavailable mid-request → Work unchanged · request retained · member sees calm disclosure  
2. Draft Output approve fails → draft retained · not marked approved  
3. Project handoff accept fails after Project shell create → compensate (delete or mark incomplete) · Work intact  
4. Collection partial assemble → incomplete synthesis not presented as final  
5. Duplicate Work uncertainty → do not create second Work  

---

## 6. Safe next slice

Ship recovery **with** [332 R1](./332_RUNTIME_COMPOSITION_IMPLEMENTATION_PLAN.md), not after:

- Execution result union: `ok` | `draft` | `needs_approval` | `unavailable` | `failed_safe`  
- `failed_safe` / `unavailable` never mutate Work  
- Member copy via existing Estate isolation helpers  
- One vitest covering capability unavailable  

Do not build a new observability product for this — private correlation IDs + existing system logger suffice until 325 O1.
