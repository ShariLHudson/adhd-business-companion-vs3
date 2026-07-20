# 076 — State Management Standard

## 1. Purpose
Define shared state responsibilities and prevent conflicting local state from becoming a competing source of truth.

## 2. State Categories

### 2.1 Authoritative Domain State
Persisted work identity, sections, lifecycle, versions, relationships, research, and permissions.

### 2.2 Runtime State
Current owner, active command, pending mutation, recovery state.

### 2.3 Workspace UI State
Active view, open panels, selection, scroll, collapsed sections.

### 2.4 Ephemeral State
Draft input, transient menu state, temporary highlights, unsaved editor buffer.

### 2.5 Cache State
Local snapshots used for speed or recovery.

Cache is never authoritative.

## 3. State Ownership Table

| State | Owner | Persistence |
|---|---|---|
| Work identity | domain layer | authoritative DB |
| Section content | domain layer | authoritative DB |
| Lifecycle | domain layer | authoritative DB |
| Version history | version service | authoritative DB |
| Active view | workspace UI | session/local preference |
| Selection | editor | ephemeral |
| Unsaved buffer | editor recovery | local cache until saved |
| Research result | research service | authoritative when accepted |
| Save status | persistence service | runtime |
| Current owner | routing layer | runtime |

## 4. State Mutation Rule
All durable mutations must pass through a command boundary.

No component may directly mutate authoritative records outside the canonical service.

## 5. State Synchronization
After durable mutation:

1. write
2. verify
3. increment persistence version
4. refresh affected state
5. confirm UI

## 6. Dirty State
Dirty state means local content differs from the last verified durable version.

The UI must distinguish:

- editing
- saving
- saved
- save failed
- conflict detected

## 7. Derived State
Progress, summaries, outlines, and action views may be derived.

Derived state must be invalidated when source content changes.

## 8. Stale State
Stale state must not:

- control routing
- overwrite newer data
- claim current ownership
- re-open old discovery loops
- replace current classification

## 9. Cross-Tab State
Use version checks or subscriptions to detect newer updates.

On conflict, offer:

- use latest
- keep mine
- compare
- merge
- duplicate as branch

## 10. State Reset
Reset actions must be scoped.

Examples:

- clear active selection
- clear stale UC session
- close panel
- reset view

Never use broad storage clearing that risks unrelated work.

## 11. State Recovery
Recovery must identify:

- last durable version
- unsaved local buffer
- source of conflict
- safest next action

## 12. State Observability
Development logs should expose:

- state owner
- version
- source
- mutation
- persistence result
- conflict
- recovery path

## 13. Certification
Prove:

- no localStorage-only success
- no stale owner capture
- correct dirty/saving/saved states
- conflict detection
- derived view refresh
- scoped reset
- recovery after browser interruption
