# Work Identity — Post-Remediation Verification

| Field | Value |
|-------|-------|
| **Status** | **Verification review only. No code changes.** |
| **Date** | 2026-08-08 |
| **Purpose** | A short checkpoint before Slice 2 — confirm the architecture, exact reach, and remaining risk of Work Identity as it stands after the Slice 1B Remediation. |
| **Method** | Every claim below is a direct, exhaustive grep/read against the current merged code, not a restatement of prior documents. |

---

## 1. Current architecture, in one picture

```
lib/workIdentity/            (leaf — zero imports of orchestration or emotion-detection code)
  types.ts                     WorkId, CommitmentSupportGateTier (local, not imported), 
                                CommitmentGateOutcome/Reason, CommitmentRecognitionContext, 
                                CommitmentGateResult, WorkIdentityTransitionEvent (data only)
  resolveCommitmentGate.ts     pure decision: commit / explore / clarify
  mintWorkId.ts                pure id generator (crypto.randomUUID, same pattern as
                                conversationSession/pauseResume.ts's newArtifactId)
  attachWorkIdentity.ts        attachWorkIdentityAtCreation(userText, tier = "proceed")
                                → WorkId | undefined, gated by isWorkIdentityV1Enabled()
  commitmentGateDiagnostics.ts in-memory-only log (Slice 1A, observe-only)
  observeCommitmentGate.ts     void-returning observe call (Slice 1A)

lib/universalCreation/orchestrator.ts   (the only production caller of attachWorkIdentity.ts)
  buildInitialSession()          plain constructor again — no WorkId logic at all
  attachRetainedWorkIdentity()   the one wrapper that calls attachWorkIdentityAtCreation
    called from:
      startUniversalCreationTurn()                        (line 317)
      resolveUniversalCreationTurn()'s recovery path  (lines 483, 491)
    NOT called from:
      shouldEnterUniversalCreation()                       (the discarded feasibility probe)

app/companion/CompanionPageClient.tsx   (the only other production caller)
  observeCommitmentGate()   Slice 1A — void return, diagnostics only, no WorkId ever read here
```

**Exhaustive check**: exactly three files in the entire repository import anything from `lib/workIdentity/` — `orchestrator.ts`, `CompanionPageClient.tsx`, and the two Work Identity test files. Nothing else.

---

## 2. Exact places WorkId can currently be created

Only one function ever mints one — `mintWorkId()` — and it is called from exactly one place: inside `attachWorkIdentityAtCreation`. That function is, in turn, called from exactly one place — `attachRetainedWorkIdentity` (`orchestrator.ts`) — which is itself called from exactly **three** call instances, all genuinely retained:

1. `startUniversalCreationTurn` (line 317) — the real, live chat-entry path.
2. `resolveUniversalCreationTurn`'s exception-recovery path, both of its branches (lines 483, 491) — a narrower, less common path, but still one whose result is returned to the founder.

All three require `NEXT_PUBLIC_WORK_IDENTITY_V1` to be on (default: off) and `resolveCommitmentGate` to return `"commit"` for the given text and tier.

---

## 3. Exact places WorkId cannot yet flow

Confirmed by grepping for `.workId` (property access) across the entire repository: it appears **only** inside the two Work Identity test files and one design document. It does not appear in:

- **`SessionArtifact` / the Conversation Session spine** — `conversationSession/adapters/universalCreationAdapter.ts`'s dual-write mirror still copies none of it; `pauseActiveArtifact`/`resumeArtifact`/`artifactStack` remain entirely unaware `WorkId` exists.
- **`SavedWorkItem`** (`lib/savedWorkStore.ts`) — no field, no reference.
- **`Project`** (`lib/companionStore.ts`) — no field, no reference. (The `recentWorkId` function found there is a pre-existing, unrelated local helper name — coincidental, not a connection.)
- **The Create panel** (`lib/createExecution.ts`, `lib/createExperience/`) — no reference. (`createExecution.ts`'s `savedWorkId` field refers to a `SavedWorkItem`'s own `id`, a different, pre-existing concept with a similar name — also coincidental.)
- **Chamber** (`lib/chamberExpertise/`, `lib/chamberIntelligence/`) — no reference.

So today, a `WorkId` lives and dies inside a single `UniversalCreationSession` object, in `localStorage`, for as long as that session continues being loaded and advanced directly. The moment that session is mirrored, paused, saved, or handed to any other system, the identity does not travel with it.

---

## 4. Remaining risks before connecting additional doorways

1. **One circular import chain remains, by design decision, not oversight.** `orchestrator.ts → attachWorkIdentity.ts → resolveCommitmentGate.ts → companionEmotions.ts`, closing back to `orchestrator.ts` via a long, pre-existing, unrelated path. Root cause: `resolveCommitmentGate.ts`'s own necessary, already-approved (Slice 0) use of `isGenuineConfusionSignal`. Confirmed inert in practice (full suite passes), but any *new* doorway that also calls into `resolveCommitmentGate` from another non-leaf module risks adding further cycles the same way Slice 1B originally did — this is worth checking fresh for each new call site, not assumed safe by precedent.
2. **The `"proceed"`-default trade-off is now load-bearing for two call sites, not one.** Both retained callers in `orchestrator.ts` rely on the literal default rather than the live turn's real Support Gate tier. This remains safe only because the *live* conversation path is gated upstream, before reaching either of them. A future doorway that calls into `startUniversalCreationTurn`/`resolveUniversalCreationTurn` **without** an equivalent upstream Support Gate check would inherit this same default with no upstream protection at all — this should be checked explicitly for any new caller, not assumed.
3. **No attachment point exists yet for anything to *receive* a `WorkId` from a second doorway.** Connecting the Create panel today would have nothing to connect *to* — `SavedWorkItem` has no field. This is a prerequisite, not a parallel task, for Slice 2 if Slice 2 is Create-panel parity.
4. **The flag-flip-mid-session gap remains as previously documented**: a `UniversalCreationSession` already in progress when the flag turns on does not retroactively gain an identity. Unremediated because it was never in scope — restated here so it isn't rediscovered as a surprise later.

None of these are new; all were named in the Slice 1B review or remediation. This section exists to confirm they are still the *complete* list — no new risk category was found during this verification.

---

## 5. Confirmed: no accidental integrations

Verified exhaustively via direct search, not inference:

| System | Searched for | Result |
|--------|-------------------|--------|
| Create panel (`lib/createExecution.ts`, `lib/createExperience/`) | any import of `lib/workIdentity/`, any `.workId` reference | **None found** |
| `SavedWorkItem` (`lib/savedWorkStore.ts`) | same | **None found** |
| `Project` (`lib/companionStore.ts`) | same | **None found** — one unrelated, coincidentally-named `recentWorkId()` helper confirmed pre-existing and unconnected |
| Chamber (`lib/chamberExpertise/`, `lib/chamberIntelligence/`) | same | **None found** |
| Resume (`conversationSession/pauseResume.ts`, `conversationSession/adapters/universalCreationAdapter.ts`) | same | **None found** |
| Exploration-adjacent (`estateBrain/discoveryMode.ts`, `createExplorationMode.ts`) | same | **None found** — `discoveryMode.ts` does call `shouldEnterUniversalCreation` (the probe), which is exactly the call this remediation made safe |

**Confirmed clean.** The only three files in the repository referencing `lib/workIdentity/` at all are `orchestrator.ts`, `CompanionPageClient.tsx`, and the Work Identity test suite itself.

---

Stopping here, per the request — no code changes, no Slice 2 work.
