# Strategy Intelligence Phase 7 — Strategic Pattern Recognition Audit

**Branch:** `deploy/companion-app-v3`  
**Date:** 2026-07-23  
**Status:** Audit complete — Pattern Recognition not previously implemented

## Verdict

Phase 6 **Strategic Decision Memory** is the correct evidence base. Pattern Recognition should examine several confirmed memories and propose **tentative observations** with evidence references by ID — never copy full histories, never invent psychological labels, and never override the member’s current goals or Adaptive Companion preferences.

## Architecture reused

| Capability | Location |
|------------|----------|
| Confirmed decision journeys | `lib/strategyChamber/memory/` |
| Capture gate | `chosenDirection` + `decisionRecordConfirmed` |
| Assumptions / constraints / outcomes / revisions | Memory entry arrays with `truthStatus` |
| Continuity epistemic caution | `buildStrategicContinuityBrief` |
| Confirm UX pattern | `confirmStrategyDecisionRecord` |

## Reliable evidence sources

Include only when:

1. A `StrategicDecisionMemory` exists (passed capture gate)  
2. Status is not `archived` or `superseded`  
3. `chosenDirection.userConfirmed === true`  
4. Entry/outcome/revision refs use Memory IDs  

Treat `assumed` / `unknown` / `interpreted` / `observed` as cautionary — never permanent fact.

## Evidence that must be excluded

- Draft conversations / `memberStatements` / `draftResponse`  
- Unconfirmed Work Items  
- Companion recommendations (`isDecision: false`)  
- Ephemeral Decision Record / Synthesis views  
- Full chat transcripts  
- Spec 112 / Estate / Support Style / ADHD / SPARK pattern engines  

## Duplication risks

| Risk | Avoid |
|------|-------|
| Embed full Memory blobs in patterns | Store evidence refs by ID only |
| Re-snapshot Work Items | Detect from `listStrategicDecisionMemories()` |
| Import ADHD / SparkPattern engines | Strategy-local detectors only |
| Auto-write Adaptive Companion prefs | Forbidden |

## Persistence

| Artifact | Canonical |
|----------|-----------|
| Strategic Memory | localStorage `spark:strategy-decision-memory:v1` |
| Patterns (this phase) | localStorage `spark:strategy-decision-patterns:v1` |
| Supabase Strategy tables | None |

## Privacy & user control

- Patterns are candidates until the member accepts or dismisses  
- `useInFutureReasoning` defaults **false** until the member opts in  
- Presentation: “This may be worth noticing” — never “This is who you are”  
- Member can pause, dismiss, or supersede  

## Smallest additive design

```
lib/strategyChamber/patterns/
  types.ts
  patternStore.ts
  detectStrategicPatterns.ts
  reviewPattern.ts
  presentPattern.ts
  index.ts
```

## Deferred

Board Historical Intelligence · cross-Chamber intelligence · broad behavioral analytics · autonomous coaching · cloud sync · psychological profiling
