# Work Identity — Slice 0 Review

| Field | Value |
|-------|-------|
| **Status** | **Review only. No code changes in this document or this delivery.** |
| **Date** | 2026-08-08 |
| **Purpose** | Architectural review of the merged Slice 0 (`lib/workIdentity/`) before any Slice 1 wiring begins — fit against existing architecture, duplicate-concept check, circular-dependency risk, Slice 1 scope, and confirmation of the smallest safe runtime connection. |
| **Reviews** | `lib/workIdentity/types.ts`, `lib/workIdentity/resolveCommitmentGate.ts`, `lib/workIdentity/resolveCommitmentGate.test.ts` — as actually merged, not as originally sketched in `WORK_IDENTITY_IMPLEMENTATION_PLAN.md` §1 (one deliberate difference is called out in §4). |

---

## 1. Does the new module fit existing architecture?

**Yes — it follows the same shape as the most recently established precedent in this codebase, `lib/workStatePriority/`, deliberately.**

| Convention | `lib/workStatePriority/` (precedent) | `lib/workIdentity/` (this slice) |
|------------|-----------------------------------------|--------------------------------------|
| One pure decision function per concern, no class, no singleton | `resolveSupportGate()` | `resolveCommitmentGate()` |
| Reuses existing detectors rather than reimplementing them | `detectEmotionalState`, `isGenuineConfusionSignal` (both from `companionEmotions.ts`) | `SIMPLE_CREATE_VERB_RE`, `inferDocumentTypeFromCreateText` (`createFastPath.ts`), `isGenuineConfusionSignal` (`companionEmotions.ts`) |
| Accepts precomputed upstream state rather than recomputing it | Accepts an optional precomputed `EmotionalState` | Requires a precomputed `SupportGateTier` as part of its input context |
| Doc comment names the exact design document and section it implements | References `WORK_STATE_PRIORITY_MODEL.md` | References `COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §7 by name in the module header |
| Test file structure — `describe` blocks per tier/category, negative assertions alongside positive ones | `resolveSupportGate.test.ts` | `resolveCommitmentGate.test.ts` |
| Built and unit-tested before any live call site references it | True at merge time (Phase 2 wired it in afterward) | True at merge time — confirmed zero consumers (§3) |

No existing architectural pattern had to be bent or special-cased to accommodate this module — it is a same-shaped sibling to the Support Gate, one layer further along the same turn.

---

## 2. Duplicate concepts already present that should remain separate

Four existing systems share enough surface vocabulary with this module to be worth naming explicitly, so none of them are accidentally merged or reimplemented later:

| Existing system | What it actually does | Why it stays separate |
|--------------------|---------------------------|----------------------------|
| **Conversation Commitment Engine** (`lib/conversationCommitmentEngine/`) | Resolves whether a founder's short reply ("yes"/"no") accepts or declines an invitation **Spark itself** just offered. | Already disambiguated in `COMMITMENT_RECOGNITION_DESIGN_REVIEW.md` §0 — opposite direction of the same word. Confirmed at Slice 0: `resolveCommitmentGate.ts` has no import of, and no dependency on, this module. |
| **Workspace Discovery Mode / `isContentBrainstorming`** (`lib/messageClassification.ts`) | Detects a founder wanting brainstorming or ideas **inside an already-active creation session** (e.g., "give me some ideas for this newsletter" while a draft is already open) — governs a discovery *sub-phase* of work already committed to. | A newly-confirmed, previously-unnamed adjacency worth stating plainly: this is not the same "exploration" `resolveCommitmentGate` reasons about. Commitment Recognition decides *whether work exists at all*; `isContentBrainstorming` operates entirely *after* that decision, inside a session that already has one. Conflating the two would misclassify an already-committed founder asking for brainstorming help as if they hadn't committed yet. |
| **Estate Discovery Mode** (`lib/estateBrain/discoveryMode.ts`) | A narrow, topic-scoped flow (SOP / focus / business-growth / research only) for orienting a founder before routing. | Already addressed in `WORK_IDENTITY_MODEL.md` §5 as a different, narrower mechanism than general exploration. Confirmed unchanged and untouched by this slice. |
| **Chamber Activation V2's tiered-evidence signal model** (`resolveChamberExpertActivationV2.ts`) | A structurally similar shape (weighted signals → an eligibility/confidence decision) but answering a completely different question — *which expert lens should inform this turn*, never *did the founder commit to work*. | Worth naming because the shape (evidence tiers → a gated outcome) is genuinely similar and could tempt a future engineer to "unify" them. They must not be — Chamber activation is stateless per-turn expert selection; commitment recognition is a boundary-crossing decision about work identity. Different domains, coincidentally similar architecture. |

**No merge, no shared abstraction, and no shared store is proposed for any of the four** — each remains exactly as it is today.

---

## 3. Future circular dependency risks

**Today: none.** `lib/workIdentity/` currently has **zero consumers** anywhere in the codebase (confirmed by search) — it is a brand-new leaf that nothing imports yet, and it imports only from two already-stable leaves:

```
lib/workIdentity/resolveCommitmentGate.ts
  → lib/universalCreation/createFastPath.ts   (SIMPLE_CREATE_VERB_RE, inferDocumentTypeFromCreateText)
  → lib/companionEmotions.ts                  (isGenuineConfusionSignal)

lib/workIdentity/types.ts
  → lib/workStatePriority/resolveSupportGate.ts   (type-only: SupportGateTier)
```

Neither `createFastPath.ts` nor `companionEmotions.ts` nor `resolveSupportGate.ts` imports anything from `lib/workIdentity/` or from each other in a way that loops back — all three are themselves leaves (`companionEmotions.ts` depends only on `messageClassification.ts`; `resolveSupportGate.ts` depends only on `companionEmotions.ts`). The dependency graph is a strict tree today, not a cycle.

**Two concrete risks for Slice 1+, named precisely so they're designed around rather than discovered later:**

1. **`resolveCommitmentGate` must always be called from *above* `createFastPath.ts`, never wired *into* it.** Because `resolveCommitmentGate.ts` already imports from `createFastPath.ts`, if a future change called `resolveCommitmentGate` from *inside* `createFastPath.ts` itself (for instance, folding it into `isSimpleCreateRequest`), the dependency would invert and cycle: `createFastPath.ts` → `workIdentity` → `createFastPath.ts`. The correct call site is a caller of `createFastPath.ts` — confirmed concretely in §5 below — never `createFastPath.ts` itself.
2. **`lib/workIdentity/` must never import from `lib/conversationSession/` (the barrel or any of its adapters) or from `lib/universalCreation/orchestrator.ts`.** Today, `orchestrator.ts` already imports the `conversationSession` barrel (`@/lib/conversationSession`), which re-exports `conversationSession/adapters/universalCreationAdapter.ts`. That adapter currently only imports `universalCreation/types.ts` and `documentRegistry.ts` — both stable "shape" leaves, never `orchestrator.ts` itself — which is exactly why no cycle exists there today. `workIdentity` must follow the identical discipline: when Slice 2+ needs the adapter to read or attach a `workId`, it should do so purely by reading a plain field already present on `UniversalCreationSession`'s own type (once added — see §4), never by importing anything from `lib/workIdentity/` into the adapter, and never by having `lib/workIdentity/` import the `conversationSession` barrel or `orchestrator.ts`. `lib/workIdentity/` should remain, permanently, a "pure decision" leaf with no upward dependency on either of those two modules.

---

## 4. What Slice 1 should touch, and what must remain untouched

### One correction to the original plan, found during this review

`WORK_IDENTITY_IMPLEMENTATION_PLAN.md` §1 originally sketched Slice 0 as also adding an optional `workId?` field to `UniversalCreationSession` (`lib/universalCreation/types.ts`) and `SessionArtifact` (`lib/conversationSession/types.ts`), plus a `"possibility"` status value. **The Slice 0 actually approved and merged was narrower than that** — types and `resolveCommitmentGate` only, entirely inside the new `lib/workIdentity/` directory, touching no existing file. That was the right call (it made Slice 0 even more inert than originally planned), but it means **Slice 1 now needs to include those two small additive type changes before it can attach a `workId` to anything** — they were not done yet.

### Slice 1 should touch

| File | Change | Risk |
|------|--------|------|
| `lib/universalCreation/types.ts` | Add `workId?: string` to `UniversalCreationSession` | Purely additive, optional field — no existing reader is affected (§3 of `WORK_IDENTITY_TRANSITION_RULES.md`'s migration note: undefined is a legal, expected state) |
| `lib/conversationSession/types.ts` | Add `workId?: string` to `SessionArtifact`; add `"possibility"` to `SessionArtifactStatus` | Same — additive, optional, no existing `switch`/comparison on the status enum is broken by adding a new member it doesn't check for |
| `app/companion/CompanionPageClient.tsx`, at the existing Support Gate call site (`resolveSupportGate(trimmed, createTurnEmotionalState)`, currently the line immediately preceding the `isSimpleCreateRequest(...) && supportGate !== "pause"` condition) | Add a call to `resolveCommitmentGate`, passing the already-computed `supportGate` tier — confirmed in §5 as the smallest safe connection point | The one behavior-relevant change in this slice; must be flag-gated |
| A new, small minting helper (e.g. `lib/workIdentity/mintWorkId.ts`) | Generates a fresh `WorkId` — deliberately **not** part of Slice 0 per the request's own constraint ("not create workIds") | New, small, pure, unit-testable in isolation before it's called from anywhere — same discipline as Slice 0 itself |

### Slice 1 must leave untouched

- `resolveCommitmentGate.ts`'s own decision logic — Slice 1 is a wiring exercise, not a redesign. If a founder-language validation round (still to come, per the Implementation Plan §6) surfaces a real classification gap, that is its own reviewed change, not something to fold silently into the wiring commit.
- `resolveSupportGate.ts`, `SIMPLE_CREATE_VERB_RE`, `inferDocumentTypeFromCreateText`'s existing matching behavior — read-only dependencies, per `WORK_IDENTITY_IMPLEMENTATION_PLAN.md` §4.
- The Conversation Commitment Engine, Workspace Discovery Mode / `isContentBrainstorming`, Estate Discovery Mode, and Chamber activation (§2 above) — none of these four are touched by Slice 1.
- `conversationSession/adapters/universalCreationAdapter.ts`'s dual-write logic — Slice 1 does not yet need the mirror to carry `workId` (that begins at Slice 2, per the Implementation Plan's own sequencing); adding the field to the two type files above is preparation, not activation.
- Any actual minting/attachment of a `workId` to a live session — Slice 1, per the Implementation Plan, should confirm the gate's decision is trustworthy in production-shaped conditions before anything downstream depends on the id it would produce (see §5's "observe-first" refinement).

---

## 5. Confirming the smallest safe first runtime connection

**Location, exact and singular**: `app/companion/CompanionPageClient.tsx`, immediately after the existing line `const supportGate = resolveSupportGate(trimmed, createTurnEmotionalState);` and before the `if (isSimpleCreateRequest(trimmed) || universalCreationContinuation) && supportGate !== "pause")` condition it already guards. This is the single call site every design document in this series has pointed at — the one place the Support Gate tier is already computed and already available, with no additional plumbing required to satisfy `resolveCommitmentGate`'s required input.

**One refinement this review adds, narrower than Slice 1's own §1 sketch**: split Slice 1 itself into two even smaller steps, rather than wiring gate-and-act in one commit:

1. **Observe-only** (the actual smallest safe first connection): call `resolveCommitmentGate` at that exact site, behind `NEXT_PUBLIC_WORK_IDENTITY_V1`, and — when the flag is on — do nothing with the result except record it via the same diagnostic-logging pattern this call site already uses (`logConversationPipelineDiagnostic`, already called a few lines below in the same block). No `workId` is minted, no behavior changes even with the flag on. This produces real founder-language data on how the gate performs against live traffic shape before anything depends on its answer being correct.
2. **Act** (a second, separately reviewed step, still within "Slice 1" but not its first commit): once the observe-only step's logged outcomes have been checked against a founder-language validation round (per the Implementation Plan §6), begin actually mint­ing a `workId` on `"commit"` and attaching it to the session.

This ordering is consistent with — not an addition to — the discipline already used for `resolveSupportGate` itself (built and unit-tested before being wired in) and for Chamber Activation V2 (a flag-gated, observed rollout before the default flip). It simply applies the same "prove it before you depend on it" step one turn earlier than the original plan's Slice 1 sketch called for.

---

## 6. Non-goals

- No code implemented by this review.
- Does not implement the `workId?` field additions or the `mintWorkId` helper named in §4 — names them as Slice 1's required first commits, does not write them.
- Does not implement the observe-only logging call named in §5.
- Does not revisit or re-approve `resolveCommitmentGate`'s own decision logic — this review is about placement and dependency safety, not the classifier itself.

Stopping here, per the request — Slice 1 is not implemented by this document.
