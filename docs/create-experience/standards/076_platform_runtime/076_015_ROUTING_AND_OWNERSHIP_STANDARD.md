# 076 — Routing and Ownership Standard

## 1. Purpose
Define who owns each turn, action, workspace, and mutation across the Universal Creation Experience.

## 2. Foundational Rule
Resolve present intent and authoritative classification before continuity ownership.

Sticky workflow state may inform routing.

It may not control routing against present intent.

## 3. Ownership Types

```ts
type TurnOwner =
  | "general_conversation"
  | "universal_creation"
  | "active_workspace"
  | "projects"
  | "research"
  | "chamber"
  | "board"
  | "navigation"
  | "clarification";
```

## 4. Ownership Resolution Order

```text
1. detect explicit management/navigation command
2. resolve present intent
3. resolve authoritative classification
4. determine start-new / continue / switch / general
5. evaluate active work relevance
6. select one owner
7. execute
8. persist
9. return
```

## 5. Start-New Authority
When the member explicitly asks to create something new:

- do not resume prior work
- do not let stale UC sessions intercept
- create a new Work ID
- preserve prior work
- confirm the new title and type

## 6. Continue Authority
Continue applies only when the turn meaningfully refers to:

- active work
- active section
- explicit title
- previous unfinished step
- content currently visible

## 7. Switch Authority
Switch must:

- preserve current work
- resolve target work
- update active context
- avoid applying new content to prior work

## 8. General Conversation Exit
Unrelated questions must not be forced into current work.

The current work remains safe and resumable.

## 9. Chamber Routing
A Chamber request should:

- identify requested Member or expertise
- package bounded context
- preserve source Work ID
- return contribution to the same work
- avoid creating a new hidden document

## 10. Board Routing
A Board request should:

- identify decision or review scope
- send relevant context
- return perspectives
- avoid prescriptive final authority
- preserve the member’s decision ownership

## 11. Research Routing
Research routing must distinguish:

- general research
- work-level research
- section-level research
- Project task research
- current-fact verification
- deep research

## 12. Project Routing
Projects own execution.

Universal Creation owns work content.

A request to edit strategy content should not be captured as a task update.

A request to schedule execution should not be treated as document editing.

## 13. Clarification
Clarification asks one necessary question and waits.

It must not answer itself.

It must not create a session loop when the platform can create a useful starting point.

## 14. No Silent Fallthrough
If the selected owner fails:

- return a truthful error
- preserve state
- offer a valid next step

Do not silently call another incompatible runtime.

## 15. Ownership Telemetry
Log:

- present intent
- selected owner
- active Work ID
- classification
- stale owner bypass
- fallback attempted
- fallback blocked
- return reason

## 16. Certification Scenarios
Prove:

- Checklist goes directly to Universal Creation
- Retreat keeps event enrichment
- stale UC session is bypassed
- unrelated question exits active work
- explicit continue resumes
- explicit start-new creates new Work ID
- Chamber request routes correctly
- Board request routes correctly
- failed handoff does not fall through
- clarification waits
