# Strategic Pattern Recognition Architecture

**Runtime:** `lib/strategyChamber/patterns/`  
**Audit:** `00_STRATEGIC_PATTERN_AUDIT.md`  
**Evidence base:** Strategic Decision Memory (Phase 6)

## Product principle

> A pattern is a supported observation across several relevant strategic experiences—not a label, diagnosis, prediction, or permanent truth.

Present as: **“This may be worth noticing.”**  
Never: **“This is who you are.”**

## Distinction from Memory

| Layer | Role |
|-------|------|
| Strategic Memory | Remembers one decision journey |
| Pattern Recognition | Notices a possible recurring relationship across several memories |

Patterns **link** to memory IDs. They do not copy full histories.

## Pipeline

1. Load reliable memories (`chosenDirection.userConfirmed`, not archived/superseded)  
2. Detect candidates (assumptions, constraints, revisions, experiment follow-through)  
3. Require ≥2 supporting decisions for a candidate; ≥3 for `ready_for_review`  
4. Member accept / dismiss / pause  
5. `useInFutureReasoning` only after explicit accept + opt-in  

## Authority

- Pattern detectors advise  
- Member confirms usefulness  
- Shared Strategy engine / Adaptive Companion prefs are **not** overwritten  
- Current goals, evidence, and decisions always win over an old pattern  

## Persistence

`spark:strategy-decision-patterns:v1` (localStorage V1)

## Out of scope

Psychological profiling · ADHD diagnosis · Board Historical Intelligence · cross-Chamber analytics · autonomous coaching · cloud sync
