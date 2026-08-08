# Work Identity — Slice 1B Review

| Field | Value |
|-------|-------|
| **Status** | **Review only. No code changes in this document or this delivery.** |
| **Date** | 2026-08-08 |
| **Reviews** | The merged Slice 1B implementation (`lib/workIdentity/mintWorkId.ts`, `attachWorkIdentity.ts`, and their tests; the two-field addition to `lib/universalCreation/types.ts`; the one-line addition to `lib/universalCreation/orchestrator.ts`'s `buildInitialSession`). |
| **Method** | Every claim below was verified directly against the merged code and, where a structural question was at stake, against an actual dependency-graph tool (`madge`) run both before and after Slice 1B's change (using `git show` to briefly restore the pre-Slice-1B version of `orchestrator.ts` for comparison, then restoring the merged version exactly — confirmed via diff that the working tree ended byte-identical to the committed state). Nothing was left modified by this review. |

---

## 1. Did attaching WorkId happen at the correct architectural boundary?

**Partially — the constructor is correctly identified, but it is shared with a second caller whose intent is different, and that matters.**

`buildInitialSession` is genuinely the sole function that builds a `UniversalCreationSession` from scratch (confirmed again for this review). But it has **two callers with different intents**, not one:

1. `startUniversalCreationTurn` — the real entry point; its result is returned to the founder and persisted via `saveUniversalCreationSession`.
2. `shouldEnterUniversalCreation` (`orchestrator.ts` line 96) — calls `buildInitialSession` **only to check** `isUniversalDiscoveryComplete(session.confidence)` as a yes/no feasibility probe. The constructed session is **discarded** — never returned, never persisted.

`shouldEnterUniversalCreation` is called from at least 14 other files across the codebase (`conversationStabilization/goalClassifier.ts`, `conversation/primaryTurnClassifier.ts`, `estateBrain/discoveryMode.ts`, `frictionlessActionLayer.ts`, `estateBrain/routeEstateIntelligence.ts`, and others) — meaning **`attachWorkIdentityAtCreation` (and the `resolveCommitmentGate` evaluation, and potentially a real `mintWorkId()` call) currently runs every time any of those 14+ call sites merely asks "would this be a valid creation request," not only when a session is genuinely being started.** No wasted id is ever persisted or duplicated anywhere — this is not a correctness bug — but it means identity is being minted (and immediately thrown away) far more often than real creation actually happens, and the boundary chosen is one level too low: it does not distinguish "checking whether this *would* work" from "this *is* happening now."

**Correct boundary, more precisely**: `startUniversalCreationTurn` — the point at which a session's construction is actually kept — not `buildInitialSession` itself, which two different kinds of caller both reach.

---

## 2. Does the current implementation support both doorways without divergence?

**No — and this is an expected, correctly-scoped limitation, not an oversight, but it should be stated plainly rather than left implicit.**

Slice 1B covers exactly one doorway: chat-based creation (`startUniversalCreationTurn` → `buildInitialSession`). Verified directly for this review:

- The Create panel's real completion path, `createProjectFromDocument()` (`lib/createExecution.ts`), takes `{ title, artifactType, body, tasks }` and has **zero reference** to `orchestrator.ts`, `buildInitialSession`, or `startUniversalCreationTurn` anywhere in its call chain (confirmed by search across `lib/createExperience/`).
- `SavedWorkItem` (`lib/savedWorkStore.ts`) — the record that path produces — has **no `workId` field, and no lineage field of any kind** (`id`, `title`, `artifactType`, `body`, `status`, `savedLocation`, `typeFolder`, `preview`, `tags`, `sourceWorkspace`, `projectId?`, `projectName?`, `googleDocId?`, `googleDocUrl?`, `createdAt`, `updatedAt` — confirmed exhaustively).

So today, a founder who starts and finishes a piece of work entirely through the Create panel gets **no identity at all** — not a different one, simply none. This matches `WORK_IDENTITY_IMPLEMENTATION_PLAN.md` §1's own sequencing (Create-panel parity was always planned as **Slice 5**, after Project-linking and SessionArtifact propagation) — so this is on-plan, not a defect. But it means **"doorway should not determine destiny" is not yet achieved — only one of the two doorways currently participates at all.**

---

## 3. Did this introduce duplicate identity concepts?

**No new duplicate concept was introduced — `workId` is one additive field with one meaning.** But this review found a **disconnection**, not a duplication, worth naming precisely:

`syncUniversalCreationToSession` (`lib/conversationSession/adapters/universalCreationAdapter.ts`) — the existing dual-write that mirrors a `UniversalCreationSession` into a `SessionArtifact` on every save — was read in full for this review. Its `patch` object copies `currentIntent`, `currentNeed`, `creationMode`, `universalCreationDocumentType`, `universalCreationPhase`, `answeredQuestions`, `studioReadinessLevel`, `draftContent`, `currentStage`, `currentStudio`; its `setActiveArtifact(...)` call copies `itemType`, `title`, `draftContent`, `documentType`. **`workId` appears in neither.** This means, as of Slice 1B:

- `UniversalCreationSession` has a real `workId`.
- Its own `SessionArtifact` mirror — the exact object `pauseActiveArtifact`/`resumeArtifact`/`artifactStack` operate on — has **no knowledge that a `workId` exists at all.**

This is not two identities competing for the same work; it is one identity that exists in exactly one place and is invisible to a sibling system whose entire purpose (per `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md`) is tracking "what's being worked on" across pauses. `SavedWorkItem` and `Project` links were confirmed to have no field and no write path touching `workId` either (§2) — no duplication there either, simply absence.

---

## 4. Is persistence sufficient for the next phase?

**Sufficient for one thing only: a single, uninterrupted chat conversation continuing its own Universal Creation session.** Not sufficient for anything beyond that yet. Concretely missing attachment points, in the order they would need to be closed:

1. **`SessionArtifact` mirror** (§3 above) — needed before `workId` can survive a Support Gate pause, a room change, or any interaction with the already-built pause/resume mechanism.
2. **`SavedWorkItem`** — no field exists yet (§2); needed before a *completed* piece of work has any durable identity at all, from either doorway.
3. **`Project` links** — correctly still untouched and out of scope; would only ever need `workId` to travel *alongside* `projectId`, never in place of it.
4. **`artifactStack`'s paused entries** — inherits directly from (1); a paused piece of work today has no way to say "this is the same `workId` as the session that gets resumed."

Persistence *to `localStorage`* for the one thing Slice 1B actually covers works correctly — confirmed by Slice 1B's own passing tests (`workId` round-trips through `JSON.stringify`/`JSON.parse`, and survives every `advanceUniversalCreation` step via the existing `{...session, ...}` spread pattern, unchanged).

---

## 5. Hidden risks found

### 5.1 Dependency direction / circular imports — **a real, newly introduced risk, empirically confirmed**

This is the most important finding of this review, and it directly qualifies a claim made in `WORK_IDENTITY_SLICE_0_REVIEW.md` §3.

**Method**: ran `madge --circular` against `lib/companionEmotions.ts` + `lib/universalCreation/orchestrator.ts` twice — once against the merged Slice 1B code, and once against `orchestrator.ts` as it existed immediately before Slice 1B (restored briefly via `git show <parent-commit>`, then put back exactly as merged; confirmed via diff that nothing was left changed).

| | Before Slice 1B | After Slice 1B |
|---|---|---|
| Total circular chains detected in this reachable graph | 600 | 603 |
| Chains that both start at `companionEmotions.ts` **and** pass through `universalCreation/orchestrator.ts` | **0** | **3** |

**Root cause, traced precisely**: `attachWorkIdentity.ts` imports `detectEmotionalState` from `companionEmotions.ts` and `resolveSupportGate` from `workStatePriority/resolveSupportGate.ts` — both real, value-level imports (not `import type`), needed to recompute the Support Gate tier (§1's design choice in the Slice 1B implementation). Separately, and entirely pre-existing: `companionEmotions.ts`'s own transitive fan-out (through `messageClassification.ts` and roughly sixty further files) already reaches `conversation/emotionalFirstResponseSequence.ts`, which already imports `universalCreation/orchestrator.ts` directly (confirmed at that file's own import line). Before Slice 1B, that long chain was **acyclic** — a one-way path into `orchestrator.ts`, nothing closing the loop back out. Slice 1B's new edge, `orchestrator.ts → workIdentity/attachWorkIdentity.ts → companionEmotions.ts`, is exactly the edge that closes it.

**Why this qualifies the Slice 0 review's finding rather than contradicting it**: that review correctly found `lib/workIdentity/`'s imports of `companionEmotions.ts` and `resolveSupportGate.ts` safe when the *calling* module was `CompanionPageClient.tsx` — a true leaf (a page component nothing else in `lib/` imports). That analysis was correct for Slice 1A. It does not automatically transfer to a *different* calling module: `orchestrator.ts` is not a leaf — it is a heavily-connected module many other files import, and (unlike `CompanionPageClient.tsx`) it turns out to already sit downstream of `companionEmotions.ts` via an unrelated chain. The lesson: **"is this import safe" depends on *where the call site is*, not only on what the imported module itself imports** — a leaf-only rule applied once is not a permanent guarantee for every future call site.

**Practical severity, honestly assessed**: low today, but real. Every module newly involved in the closed loop (`attachWorkIdentity.ts`, `mintWorkId.ts`, `resolveCommitmentGate.ts`, `companionEmotions.ts`, `resolveSupportGate.ts`) exports plain functions with no top-level side effects and nothing invoked at import time — the classic failure mode for circular imports (a value used before its defining module finishes evaluating) has no opportunity to occur here. This is corroborated directly: the full regression suite (530+ tests) passes with zero failures attributable to this change. But it is now real, structural technical debt — a future change to any file in this loop that *does* introduce a top-level side effect would have a latent landmine to step on, and it was not present before this slice.

### 5.2 Migration concerns

A `UniversalCreationSession` already in `localStorage` before this slice has no `workId` key at all — confirmed harmless, since the field is optional everywhere it could be read, and none exist yet outside `lib/workIdentity/` and `orchestrator.ts` itself. One nuance worth stating explicitly rather than leaving implicit: **flipping the flag on while a founder already has an in-progress session (started before the flip) does not retroactively assign it an identity.** That session will continue indefinitely with `workId: undefined`, since attachment only happens at construction (§1), never retrofitted onto an existing one. This is consistent with the design (`WORK_IDENTITY_TRANSITION_RULES.md`'s Create verb is a one-time, at-commitment event) — but it is a real operational consequence of the flag-flip moment that should be a documented, deliberate acceptance, not a silently-discovered gap later.

### 5.3 Duplicate work creation

No duplicate *persisted* record was found — `buildInitialSession` remains the sole constructor, and every continuation path (`advanceUniversalCreation`, `applyAnswer`, `finalizeDiscovery`) spreads the existing session, never rebuilding one. The one real finding here is §1's wasted-probe-mint issue: not duplication of a record, but redundant, semantically-odd evaluation of commitment (and, when the flag is on and the text is commit-eligible, an actual discarded `mintWorkId()` call) every time a feasibility check runs rather than only when a session is genuinely kept.

### 5.4 Resume/return behavior

Directly downstream of §3's finding: `pauseActiveArtifact`/`resumeArtifact` (the Conversation Session spine's own pause/resume mechanism, the whole subject of `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md`) remain completely unaware `workId` exists, because the mirror that feeds them never received it. The **only** resume path that currently preserves identity is the one Slice 1B's own tests cover: continuing the *same, still-loaded* `UniversalCreationSession` object directly via `advanceUniversalCreation` within one uninterrupted conversation. The moment a founder's work is paused via the Support Gate or a room change and later resumed through the *separate*, already-built artifact-stack mechanism, today's code has no way to recognize it as the same `workId` — because that mechanism was never told one exists.

---

## 6. Recommended smallest safe next slice

**Not a new attachment point (Create panel, `SavedWorkItem`, or `SessionArtifact`) — a narrow remediation slice that closes the two concrete defects this review found, before anything else is built on top of them.**

Building the next feature-facing attachment point *now* would mean extending a foundation that (a) already closed three new circular-import chains and (b) already mints and discards identity far more often than real creation happens — compounding both problems rather than fixing them while the surface area is still small enough to fix cheaply. Concretely, the smallest safe next slice should do exactly two things and nothing else:

1. **Move the attachment call from `buildInitialSession` to `startUniversalCreationTurn`.** `startUniversalCreationTurn` is the one caller whose result is actually kept; `shouldEnterUniversalCreation`'s call to `buildInitialSession` (a discarded feasibility probe) would no longer trigger commitment evaluation or minting at all. This directly closes §1 and §5.3's finding, and does not touch discovery behavior, Exploration, Support Gate, Research, Chamber, or Projects — the same non-negotiables this slice and Slice 1B were both scoped to.
2. **Remove the new circular-import edge**, most simply by changing `attachWorkIdentityAtCreation`'s signature to *accept* an already-computed `supportGateTier` (and, if needed, emotional state) as an optional parameter, falling back to recomputing only when the caller doesn't supply one. Since `startUniversalCreationTurn`'s own callers (Support Gate–adjacent call sites) already compute this tier upstream in the same turn, most real call sites can pass it in directly, removing the need for `attachWorkIdentity.ts` to import `companionEmotions.ts`/`resolveSupportGate.ts` at all in the common case. This directly closes §5.1's finding at its root rather than leaving a dormant cycle to reason about later.

Both changes are small, mechanical, and testable in isolation the same way Slice 1B itself was — and both should be validated with the same regression discipline (full test suite plus a fresh `madge --circular` comparison) before moving on to any new attachment point.

**After that remediation slice**, the next feature-facing slice in priority order (per §4) would be the `SessionArtifact` mirror gaining `workId` — the one attachment point every other missing piece (resume behavior, pause/resume, eventual `SavedWorkItem` lineage) depends on. This document does not design that slice; it only orders it correctly relative to the remediation above.

---

## 7. Non-goals

- No code implemented or modified by this document. `git status`/`diff` confirm the repository was left byte-identical to the merged Slice 1B state after this review's investigation.
- Does not implement the remediation slice recommended in §6 — names it precisely, does not build it.
- Does not re-litigate Slice 1B's core design (attaching identity via `resolveCommitmentGate` at session construction) — that design is sound; this review's findings are about *where exactly* within that design the attachment call sits, and one import-level side effect of how it recomputes its input.

Stopping here, per the request — no implementation, no further design artifacts, until this is reviewed.
