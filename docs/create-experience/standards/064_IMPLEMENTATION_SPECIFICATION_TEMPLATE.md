# 064 — Implementation Specification Template

## Status

Reusable production implementation template.

**Published ID:** 064  
**Governing process:** [062 Implementation & Certification](./062_IMPLEMENTATION_AND_CERTIFICATION_STANDARD.md) · [063 Traceability](./063_STANDARD_IMPLEMENTATION_TRACEABILITY_MATRIX.md)  
**Draft filename redirect:** `062_IMPLEMENTATION_SPECIFICATION_TEMPLATE.md` → this file (062 is the Certification Standard).

Copy this file for each major standard or capability.

Recommended filename:

`NNN_<CAPABILITY>_IMPLEMENTATION_SPECIFICATION.md`

---

# Governing Standard

- Standard:
- Related standards:
- Capability:
- Repository area:
- Implementation owner:
- Status:

---

# Mission

State exactly what must become true in the running platform.

Do not restate architecture without translating it into buildable behavior.

---

# User Outcome

Describe what the user can reliably do after implementation.

Example:

> A user may start a workshop from Shari, Create, Projects, Visual Thinking, Search, or Marketing and always reach the same Event Workspace without duplicate records or repeated discovery.

---

# Scope

## In Scope

- 
- 
- 

## Out of Scope

- 
- 
- 

---

# Current Repository Findings

Document what currently exists.

Include:

- relevant files
- relevant runtime services
- existing types
- current behavior
- known defects
- duplicate paths
- deprecated paths
- tests already present

Do not begin implementation before this inspection is complete.

---

# Existing Architecture to Reuse

Inspect and list:

- Universal Creation Entrypoint
- Universal Creation Engine
- canonical records
- Creation Context
- Relationship Registry
- Ownership Registry
- asset registries
- Connected Asset Editor
- Recommendation Engine
- State Machine
- Project bridge
- Cartography bridge
- persistence services
- shared UI components
- test utilities

Do not create competing implementations.

---

# Canonical Source of Truth

Identify:

- canonical record
- canonical registry
- canonical state
- canonical ownership
- canonical persistence location

Explain how all entry points and services reference it.

---

# Required Runtime Behavior

## Normal Flow

1.
2.
3.

## Existing Work Flow

1.
2.
3.

## Asset-First Entry Flow

1.
2.
3.

## Return and Resume Flow

1.
2.
3.

## Duplicate-Prevention Flow

1.
2.
3.

## Cross-Entry Flow

1.
2.
3.

## Failure and Recovery Flow

1.
2.
3.

## Archive and Reuse Flow

1.
2.
3.

---

# Module Plan

Recommended structure:

```text
path/
├── types.ts
├── resolver.ts
├── service.ts
├── persistence.ts
├── adapters/
├── tests/
└── index.ts
```

For every proposed file include:

| File | Responsibility | Reuses | Must Not Duplicate |
|---|---|---|---|
|  |  |  |  |

---

# Types and Schemas

Define production TypeScript contracts.

Include:

- required fields
- optional fields
- discriminated unions
- status enums
- version fields
- validation
- migration compatibility
- error types
- canonical identifiers

Do not introduce duplicate identifiers or competing status enums.

---

# Runtime Entry Points

List every entry point that must call this implementation.

| Entry Point | Adapter | Shared Runtime Called | Expected Result |
|---|---|---|---|
| Shari |  |  |  |
| Create |  |  |  |
| Projects |  |  |  |
| Visual Thinking |  |  |  |
| Chamber |  |  |  |
| Board |  |  |  |
| Search |  |  |  |
| Dashboard |  |  |  |
| Cartography |  |  |  |

---

# State Flow

Document:

```text
Input
 ↓
Intent and confidence resolution
 ↓
Existing-work check
 ↓
Canonical context
 ↓
Runtime action
 ↓
Persistence
 ↓
Relationship update
 ↓
Recommendation/readiness/state update
 ↓
User response
```

List every state transition and guard.

---

# Persistence

Define:

- storage location
- create behavior
- update behavior
- versioning
- optimistic updates
- conflict handling
- retry behavior
- interruption behavior
- migration requirements
- rollback behavior
- stale record handling

---

# Integration Requirements

## Universal Creation Entrypoint

- 

## Universal Creation Engine

- 

## Creation Workspace

- 

## Relationship Registry

- 

## Ownership Registry

- 

## Projects

- 

## Cartography

- 

## Recommendation Engine

- 

## State Machine

- 

## Conversation Context

- 

## Visual Thinking

- 

---

# User Interface Requirements

Define:

- primary interaction
- initial state
- loading state
- empty state
- success state
- error state
- returning-user state
- mobile behavior
- keyboard behavior
- focus behavior
- accessibility names
- progressive disclosure
- exact prohibited UI
- infrastructure that must remain hidden

Do not expose internal architecture.

---

# Conversation Requirements

Define:

- what the assistant already knows
- what may be asked
- what must not be re-asked
- transition language
- direct-answer behavior
- recommendation behavior
- failure-recovery language
- Shari voice requirements
- one-question-at-a-time rules where relevant
- no generic reset questions

---

# Recommendation Requirements

Define:

- primary recommendation
- secondary recommendation limit
- confidence thresholds
- dependency behavior
- user choice behavior
- skip/defer behavior
- explanation requirements
- cross-member merge behavior

---

# Lifecycle Requirements

Define:

- starting state
- allowed transitions
- blocked transitions
- reverse transitions
- pause/resume
- completion
- archive
- reuse
- state-specific recommendations

---

# Error Handling

Include:

- missing record
- stale record
- duplicate request
- failed persistence
- failed integration
- invalid state transition
- partial success
- permission failure
- unsupported capability
- relationship registration failure
- project sync failure
- Cartography sync failure

Every error must have a safe recovery path.

---

# Security and Privacy

Identify:

- authentication requirements
- authorization checks
- user isolation
- sensitive fields
- audit requirements
- logging restrictions
- data exposure risks

---

# Performance Requirements

Define measurable expectations for:

- initial load
- context assembly
- search
- save
- resume
- recommendation generation
- registry loading
- relationship traversal
- large-workspace rendering

---

# Accessibility Requirements

At minimum:

- keyboard access
- focus order
- semantic controls
- screen-reader labels
- readable text
- zoom
- responsive layout
- reduced motion
- error announcements
- accessible alternatives to drag-and-drop

---

# Test Plan

## Unit Tests

- 

## Integration Tests

- 

## Authenticated Browser Tests

- 

## Regression Tests

- 

## Accessibility Tests

- 

## Performance Tests

- 

---

# Acceptance Criteria

Use testable statements.

- [ ] 
- [ ] 
- [ ] 

---

# Migration Plan

Describe:

- old behavior
- new behavior
- data migration
- compatibility
- rollback
- cleanup
- deprecation
- removal of duplicate paths

---

# Completion Report Requirements

Return:

- files created
- files modified
- files removed
- existing architecture reused
- canonical source of truth
- runtime services added
- tests added
- test commands and results
- typecheck
- lint
- browser proof
- accessibility
- performance
- known limitations
- unresolved defects
- certification status
- exact next recommended step

---

# Certification Gate

This implementation may not be marked complete until its companion certification specification passes.
