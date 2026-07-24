# Strategic Memory Architecture

**Runtime:** `lib/strategyChamber/memory/`  
**Audit:** `00_STRATEGIC_MEMORY_AUDIT.md`

## Product principle

> Strategic memory remembers the reasoning, conditions, and evolution of a decision—not just the final answer.

Remembered information is **not** permanently true. Every entry keeps recorded time, type, confidence, truth status, confirmation, relevance, and source.

## Authority

| Layer | Owns |
|-------|------|
| Strategy Work Item | Live strategic work (source of truth while active) |
| Decision Record | Derived confirmation view |
| Strategic Decision Memory | Durable continuity after confirmation + outcomes/revisions |
| Spec 112 / Estate memory | Preferences and companion relationship — **not** strategic process |
| Projects / Calendar / Evidence | Execution, scheduling, artifacts — linked by reference |

## Capture gate

Memory is created when:

1. `chosenDirection` is set, and  
2. `decisionRecordConfirmed` is true  

API: `confirmStrategyDecisionRecord(workItemId)` (Chamber “This looks right”).

## Core flows

1. **Capture** — snapshot question, context, assumptions (as assumed), constraints, options, chosen direction, trade-offs, risks, experiments, review triggers  
2. **Outcome** — append what happened afterward (contribution return may attach)  
3. **Revision** — new direction with prior direction retained in `revisions`  
4. **Continuity** — `buildStrategicContinuityBrief` for warm resume language + epistemic caution  

## Persistence

localStorage key: `spark:strategy-decision-memory:v1` (same V1 pattern as Work Items). No cloud sync in this phase.

## Out of scope

Strategic Pattern Recognition · Board historical intelligence · cross-Chamber orchestration · broad platform memory · autonomous routing/execution
