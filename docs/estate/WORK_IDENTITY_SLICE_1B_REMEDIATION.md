# Work Identity — Slice 1B Remediation

| Field | Value |
|-------|-------|
| **Status** | **Implemented.** A narrow, three-goal remediation of the merged Slice 1B implementation, per `WORK_IDENTITY_SLICE_1B_REVIEW.md` §6's recommendation. |
| **Date** | 2026-08-08 |
| **Scope** | Exactly the three goals below. No new attachment point, no doorway extension, no change to Create panel, `SavedWorkItem`, Projects, Chamber, or Resume. |

---

## Before coding: the exact retained caller versus the probe/feasibility callers

`buildInitialSession` (`lib/universalCreation/orchestrator.ts`) is called from **four** places, falling into two categories:

| Call site | Category | What happens to its result |
|-----------|----------|------------------------------|
| `startUniversalCreationTurn` | **Retained** | Returned to the caller, eventually persisted via `saveUniversalCreationSession` |
| `resolveUniversalCreationTurn`'s catch-block recovery path (two calls, both branches) | **Retained** | Also returned as part of the founder-facing `UniversalCreationTurnResult` — a recovery path, but not a discarded one |
| `shouldEnterUniversalCreation` | **Probe** | Discarded — only `isUniversalDiscoveryComplete(session.confidence)` is read; the constructed session itself is never returned or persisted |

This is a small correction to the Slice 1B review's own framing, found while implementing: there are **two** retained call sites, not one (the recovery path in `resolveUniversalCreationTurn` was easy to miss on a first pass, since it only runs when `startUniversalCreationTurn` throws). Both needed to be covered by this remediation.

---

## Goal 1 & 2 — no minting during feasibility checks; attachment only from the retained path

**Change**: removed all `WorkId` logic from `buildInitialSession` entirely — it is now a plain, side-effect-free constructor exactly as it was before Slice 1B. A new private helper, `attachRetainedWorkIdentity(session, userText)`, wraps `buildInitialSession`'s result and is called **only** from the two retained call sites. `shouldEnterUniversalCreation` still calls `buildInitialSession` directly, unwrapped — its probe is now structurally incapable of triggering commitment evaluation or minting, because there is nothing left inside `buildInitialSession` to trigger.

This required no threading of new parameters and no change to any of `buildInitialSession`'s other 14+ callers' behavior.

---

## Goal 3 — remove the circular dependency

**What was changed**:

1. `attachWorkIdentity.ts` no longer imports `detectEmotionalState` (`companionEmotions.ts`) or `resolveSupportGate` (`workStatePriority/resolveSupportGate.ts`) at all. `attachWorkIdentityAtCreation` now takes the Support Gate tier as an explicit parameter, defaulting to the literal value `"proceed"` when the caller doesn't supply one — never a recompute.
2. `workIdentity/types.ts` no longer imports `SupportGateTier` from `resolveSupportGate.ts`, not even as a type. It declares a structurally identical local type, `CommitmentSupportGateTier`, which TypeScript treats as interchangeable with the original via structural typing — so `CompanionPageClient.tsx`'s existing Slice 1A call (passing a real `SupportGateTier` value) continues to compile and work unchanged.

**Empirical result** (measured with `madge --circular`, the same method used in the Slice 1B review, and now also encoded as an automated test — see below):

| | Before Slice 1B | After Slice 1B | After this remediation |
|---|---|---|---|
| Total circular chains in the reachable graph | 600 | 603 | 601 |
| Chains starting at `companionEmotions.ts` and reaching `universalCreation/orchestrator.ts` | 0 | 3 | **1** |

**The honest limit of this remediation**: one chain remains, and it is **not removable without a larger change than this remediation's scope allows**. It runs through `resolveCommitmentGate.ts`'s own dependency on `isGenuineConfusionSignal` (`companionEmotions.ts`) — a real, necessary, already-approved (Slice 0) piece of that function's classification logic, not an accidental import. Removing it would mean either degrading Slice 0's already-tested behavior, or moving the entire commitment decision out of `orchestrator.ts`'s import graph and into a caller several layers up (`CompanionPageClient.tsx` or an intermediate routing layer) — a materially larger, differently-scoped change than "narrow." This is named here explicitly rather than left to be rediscovered: **the circular dependency introduced by Slice 1B is reduced from three chains to one, not eliminated to zero**, and the remaining one is now precisely understood rather than an open question.

---

## The accepted trade-off from removing the recompute

Because `orchestrator.ts`'s two retained call sites do not have the live turn's real, already-computed Support Gate tier without threading a new parameter through every public caller of `startUniversalCreationTurn`/`resolveUniversalCreationTurn` (14+ files across the codebase — out of scope for a narrow remediation), they call `attachWorkIdentityAtCreation(userText)` with no tier argument, accepting the `"proceed"` default.

**What this means concretely**: a caller that reaches `startUniversalCreationTurn` *directly*, bypassing the live conversation's own Support Gate check, and whose text is *both* genuinely distressed *and* phrased as an unhedged commitment (e.g. "I'm so overwhelmed, but I want to create a workshop right now.") will now have a `WorkId` attached, where Slice 1B's internal recompute would have caught the distress and blocked it.

**Why this is an acceptable, narrow trade-off, not a regression in practice**: the live, real conversation path (`CompanionPageClient.tsx`) is completely untouched by this remediation. Its own Support Gate check (`supportGate !== "pause"`) already blocks Create Fast Path from reaching *any* of this code — `startUniversalCreationTurn` included — before a genuinely overwhelmed turn ever gets there. The weakened guarantee is scoped entirely to direct callers that skip that check, which today means test code, not founders. This trade-off is proven, not asserted, by this remediation's own Requirement 3 tests (below) confirming the live Support Gate path is unaffected, and by a dedicated test that makes the accepted edge case visible and asserted rather than silently true.

A future slice could close this gap properly by threading the real tier through, or reading it from ambient turn context — deliberately not attempted here to keep this remediation to its three stated goals.

---

## Files changed

| File | Change |
|------|--------|
| `lib/universalCreation/orchestrator.ts` | `buildInitialSession` no longer attaches identity; new private `attachRetainedWorkIdentity` helper, called from `startUniversalCreationTurn` and `resolveUniversalCreationTurn`'s recovery path only |
| `lib/workIdentity/attachWorkIdentity.ts` | Removed `companionEmotions.ts`/`resolveSupportGate.ts` imports; `supportGateTier` is now an explicit parameter with a literal `"proceed"` default |
| `lib/workIdentity/types.ts` | Removed the `SupportGateTier` import; added a local, structurally identical `CommitmentSupportGateTier` type |
| `lib/workIdentity/attachWorkIdentity.test.ts` | Updated for the new signature; adds tests for the default tier, an explicitly supplied tier, and the accepted overwhelm-default trade-off (made visible and asserted) |
| `lib/universalCreation/workIdentitySlice1BRemediation.test.ts` (new) | The four requested requirement proofs (below) |

## Tests added

11 new tests in `workIdentitySlice1BRemediation.test.ts`, plus 3 new/updated tests in `attachWorkIdentity.test.ts`:

1. **Feasibility checks do not create WorkIds** — `vi.spyOn` on `attachWorkIdentityAtCreation` proves `shouldEnterUniversalCreation` never calls it, across multiple commit-eligible inputs; a second test confirms the probe's own return value is unaffected.
2. **Real Create entry still creates/attaches a WorkId** — proves `startUniversalCreationTurn` calls `attachWorkIdentityAtCreation` exactly once per turn, attaches a real id, and that the id carries forward unchanged across every discovery turn of one session (re-confirming Slice 1B's own guarantee still holds after the relocation).
3. **Existing exploration/support behavior is unchanged** — re-verifies the real, unmodified `resolveSupportGate`/`detectEmotionalState`/`isSimpleCreateRequest` production functions produce byte-identical routing decisions, and that overwhelm/exploratory text still does not attach an identity when reaching Universal Creation.
4. **The circular dependency is removed or reduced** — a fast, deterministic static check (source text confirms the specific problematic import lines are gone) plus a real, empirical `madge --circular` check (via a temp-file redirect, after discovering `execSync` unreliably truncates large captured stdout from a non-zero-exit child process) asserting the chain count is reduced from 3 to at most 1, and that neither of the two now-removed chains' specific paths remain. This test was verified to genuinely catch a regression: reintroducing the original recompute reliably fails it (`expected 3 to be less than or equal to 1`) before being reverted.

## Regression results

- New/updated suite: 11 new tests in the remediation file + 3 updated in `attachWorkIdentity.test.ts`, all passing alongside the full existing `lib/workIdentity/` and `lib/universalCreation/` suites (543 tests passing across 48 files in the broader regression run, with the one pre-existing, unrelated `universalCreation.test.ts` module-resolution failure unchanged).
- `npx tsc --noEmit`: zero new errors.
- Confirmed via direct diff that `git status` shows only the intended files touched — no Create panel, `SavedWorkItem`, Project, Chamber, or Resume file was modified.

## Non-goals

- Does not extend `WorkId` to any new doorway, attachment point, or system.
- Does not fully eliminate the circular dependency — reduces it from three chains to one, and explains precisely why the remaining one requires a larger, differently-scoped change to close.
- Does not thread the live Support Gate tier through `startUniversalCreationTurn`'s many callers — accepts and documents the resulting narrow trade-off instead, per this remediation's own scope.
