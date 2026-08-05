# SOP Build Journey — Approval Record

**Date approved:** 2026-08-05
**Approved by:** Founder (Shari)
**Status:** Binding. Implementation authorized to begin at Phase 1.

This is a permanent decision record. It exists so a future session can act correctly without rereading the full specification and handoff.

---

## What is approved

| Artifact | Status |
|---|---|
| [`SOP_BUILD_JOURNEY_SPECIFICATION.md`](./SOP_BUILD_JOURNEY_SPECIFICATION.md) | **Approved** — acceptance standard for the SOP pilot and reference pattern for future Build Types |
| [`SOP_BUILD_JOURNEY_IMPLEMENTATION_HANDOFF.md`](./SOP_BUILD_JOURNEY_IMPLEMENTATION_HANDOFF.md) v1.1 | **Approved** — the coding plan |
| Architectural decisions **D1–D5** | **Approved** — recorded in the handoff |

---

## The five decisions, in one line each

- **D1 — `RuntimeCreationRecord` is the Working Memory carrier.** Extend it additively. Do not adopt `CreationWorkspace`; ADR-013 routes single artifacts away from that surface, and a second record per creation is a duplicate system.
- **D2 — Research is deferred out of the SOP pilot.** No "Research This" on SOP sections until real retrieval exists. The canonical SOP scenario depends on *current official instructions*, and model-recalled steps presented as procedure would send a new hire confidently wrong.
- **D3 — Phase 3 begins with output repair.** Fix the inert "Build a polished draft" button and its failing guard test before adding any new output capability. This is a hard gate on Phase 4.
- **D4 — Section expansion (4 → 7) lands in Phase 1.** `templateSections` is frozen per record, so a later move would strand in-flight work.
- **D5 — A decision gate stands before Phase 2.** The Working Memory field list must be confirmed in writing before any code writes member answers into the extended shape.

---

## Why SOP at all

SOP is not being built because an SOP builder is needed. It is the **first complete proof of the shared operating model** — Registry → Conversation → Knowledge → Output → Save → Resume → Continuation. Seven more Build Types inherit whatever pattern this establishes.

The goal is not "build all SOP functionality." It is one honest vertical slice.

---

## The finding that shaped the plan

SOP **already runs end to end today** — entry, classification, confirm, workspace, questions, save, resume — entirely through shared infrastructure. Verified live, not inferred.

> There is no missing path. There is missing content.

The gap between live behavior and the specification is almost entirely *what Spark says and remembers*. This is why the pilot is a thin Build Definition and not an engine. **If a phase proposes new machinery, it is probably solving the wrong problem.**

---

## Implementation begins at Phase 1

Phase 1 is foundation only:

- Extend `CreateTemplateSection` with optional authoring fields
- Replace `SOP_SECTIONS` with the Knowledge Finger's sections and authored prompts
- Prefer the authored prompt in `resolveCanonicalFocus`
- Correct the registry `builderType` to `guided-conversation`
- Tests

**Not in Phase 1:** conversation UI changes, output generation, visibility changes, Working Memory fields, research, maps.

---

## SOP remains hidden until verification gates pass

`sop` stays `lifecycleStatus: "needs-audit"` with all verification flags false, and therefore invisible to members, until **route, save, reopen, and required-actions are each verified against a real live run**.

Visibility flips only at the end of Phase 4, in its own commit, with the evidence recorded. It is not a progress indicator and must never be flipped early to show momentum. Making SOP visible while D3's repair is outstanding would ship the specification's clearest prohibition — claiming success for something that did not happen.

---

## Standing constraints

- Do not create an SOP engine, package, store, or `lib/sop/`.
- Do not register `sop` as a UWE work type.
- Do not duplicate conversation, saving, research, mapping, registry, or Working Memory systems.
- Preserve ADR-013, the confirm-before-create gate, and the durable save path.
- Preserve one continuous conversation with Shari.
- The member never manages internal capabilities.
- Reuse before reinvention: Reuse → Extend → Connect → Orchestrate → Create.

---

## Method note for future sessions

Material claims in handoff v1.0 were wrong and were caught only by tracing the running app: a draft-generation path assumed to exist has zero callers, an assemble step assumed missing is real and working, and a regression guard had been failing in place of documentation. None of it was visible from the specification, the registry, or a green-looking suite.

**Verify running behavior before building on it.** That is the most transferable thing about this pilot.
