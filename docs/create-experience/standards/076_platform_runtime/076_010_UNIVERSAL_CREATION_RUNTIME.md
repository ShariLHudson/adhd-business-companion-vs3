# 076 — Universal Creation Runtime

## Status
Authoritative platform runtime specification for all creation experiences across Spark Estate™.

## 1. Mission
Provide one shared runtime that governs how every meaningful work experience begins, develops, pauses, resumes, changes direction, integrates with other platform capabilities, and completes.

This runtime must be used by:

- Create
- Projects
- Chamber Members
- Round Table Board Directors
- Founder Studio
- Business Estate
- Research
- Knowledge
- Cartography
- Decision Compass
- every strategy, template, framework, plan, checklist, campaign, event, report, SOP, and future creation experience

No consumer may create an incompatible local runtime.

## 2. Runtime Promise
The runtime must protect five things at all times:

1. the member’s intent
2. the work identity
3. the work content
4. the work context
5. the member’s ability to continue without starting over

## 3. Runtime Entry Conditions
A creation runtime begins when the member intends to:

- create something new
- continue existing work
- revise or improve work
- convert one form of work into another
- research within work
- ask a Chamber Member or Board Director to contribute
- turn work into execution
- publish, export, print, or share
- resume after interruption

## 4. Authoritative Runtime Sequence

```text
Member input
  → present-intent resolution
  → authoritative classification
  → ownership decision
  → work identity resolution
  → workspace resolution
  → context hydration
  → action execution
  → authoritative persistence
  → read-back verification
  → member-facing confirmation
  → next-step recommendation
```

No later stage may silently reinterpret an earlier authoritative decision.

## 5. Runtime States

```ts
type UniversalCreationRuntimeState =
  | "idle"
  | "intent_resolving"
  | "classifying"
  | "ownership_resolving"
  | "identity_resolving"
  | "workspace_initializing"
  | "workspace_hydrating"
  | "active"
  | "editing"
  | "researching"
  | "collaborating"
  | "saving"
  | "recovering"
  | "converting"
  | "publishing"
  | "paused"
  | "completed"
  | "archived"
  | "error";
```

## 6. Runtime Invariants

- One turn has one authoritative owner.
- One work item has one immutable Work ID.
- One classification controls structure and workspace type.
- One persistence path is authoritative.
- One failed action may not silently fall through to an incompatible runtime.
- One stale session may not override present intent.
- One member-facing success state requires verified completion.
- One work item may appear in many surfaces without becoming many hidden copies.

## 7. Entry Modes

### 7.1 Start New
Creates a new Work ID.

### 7.2 Resume
Hydrates an existing Work ID and active context.

### 7.3 Switch
Leaves current work safely and opens another work item.

### 7.4 Continue in Place
Applies the turn to the active work and section.

### 7.5 General Conversation
Exits work ownership for the turn without deleting or closing the work.

### 7.6 Collaborate
Routes a bounded request to Chamber, Board, Research, or another capability while preserving source identity.

### 7.7 Convert
Creates a linked derivative, never an invisible replacement.

## 8. Runtime Ownership
Ownership is determined from present intent before sticky continuity or local feature state.

The runtime must distinguish:

- continue current work
- edit current work
- start something new
- switch work
- general conversation
- research
- Chamber request
- Board request
- project action
- navigation
- clarification

Continuity is not ownership by default.

## 9. Runtime Error Contract
Every runtime error must return:

```ts
type RuntimeErrorContract = {
  code: string;
  stage: string;
  memberMessage: string;
  workSafe: boolean;
  retryable: boolean;
  fallbackAction?: string;
  technicalContext?: unknown;
};
```

A runtime failure may not:

- falsely report success
- create a second work item as a workaround
- discard member content
- route to an unrelated workflow
- restart discovery automatically

## 10. Pause and Resume
On pause, the runtime must persist:

- Work ID
- active section
- unsolved questions
- latest durable version
- current structure
- next recommended step
- last member-visible state

On resume, the runtime must restore context in plain language.

## 11. Completion
Completion may be:

- member-declared
- milestone-based
- approval-based
- output-based
- execution-based

Completion does not remove editability.

Completed work may still be reopened, revised, duplicated, converted, published, or archived.

## 12. Runtime Telemetry
Track:

- selected owner
- selected classification
- Work ID
- source surface
- persistence outcome
- handoff outcome
- recovery outcome
- resume outcome
- dead-action detection
- repeated-question detection
- stale-session bypass
- time to first useful output

## 13. Certification
The runtime passes only when browser evidence proves:

- correct owner
- correct classification
- correct Work ID
- correct workspace
- real persistence
- refresh recovery
- stale-session bypass
- no silent fallthrough
- no duplicate hidden work
- truthful success and failure
