# 327 — Capability Execution and Contribution Runtime

## Purpose

Define the runtime contract used when Spark Estate requests, executes, validates, combines, and applies one or more certified capabilities.

This document governs the execution layer beneath Collections, Blueprints, Shari, Chamber Members, the Board, and Universal Work.

## Core principle

A capability is not merely descriptive knowledge.

A production capability must be executable through a predictable contract.

## Capability execution contract

Every executable capability must declare:

- capability ID
- owning Member
- version
- certification status
- purpose
- accepted input schema
- required context
- optional context
- output schema
- evidence requirements
- adaptation rules
- approval requirements
- mutation permissions
- timeout behavior
- fallback behavior
- error behavior
- provenance fields
- observability fields

## Execution request

A capability request must include:

- request ID
- originating user intent
- user ID
- active business ID
- canonical Work ID when applicable
- Collection ID when applicable
- Blueprint ID when applicable
- capability ID
- desired output
- current context
- capability state
- confidence state
- constraints
- source materials
- approval mode
- deadline or urgency
- originating surface
- correlation ID

## Execution modes

### Advisory

Returns reasoning, options, tradeoffs, or review.

Must not mutate Work.

### Draft

Returns a proposed artifact or change.

Requires user review before application unless prior permission explicitly allows otherwise.

### Validation

Evaluates existing Work against capability rules.

Returns findings, risks, and recommendations.

### Transformation

Converts one approved artifact or Work representation into another.

Must preserve source linkage.

### Enrichment

Adds supporting information, metadata, relationships, or evidence.

### Calculation

Returns a deterministic or bounded analytical result.

### Planning

Produces tasks, milestones, dependencies, or implementation structure.

Planning outputs must route through Universal Work and Projects contracts.

## Contribution envelope

Every contribution must return:

- contribution ID
- request ID
- capability ID
- owner Member ID
- contributing Member ID
- execution mode
- output
- assumptions
- evidence
- confidence
- risks
- unresolved questions
- approval required
- mutation proposal
- provenance
- version
- created at
- expiration or freshness when applicable

## Mutation boundary

A capability may propose changes.

It may not silently apply consequential changes unless:

- the user explicitly authorized the action
- the capability contract permits it
- the target Work Type permits it
- approval state is valid
- provenance is retained
- rollback is possible where required

## Capability dependency execution

When a capability depends on another:

1. Resolve dependency.
2. Verify certification.
3. Pass only necessary context.
4. retain the dependency's output and provenance.
5. prevent circular execution.
6. return a single parent contribution envelope.

## Parallel execution

Capabilities may execute in parallel when:

- dependencies do not conflict
- shared mutable state is not involved
- order does not affect correctness
- user context remains consistent

## Sequential execution

Use sequential execution when:

- one capability produces inputs for another
- risk validation must precede application
- Work mutation requires ordered approval
- contributor output must be reviewed by the Collection owner

## Failure handling

Failures must classify as:

- invalid input
- missing context
- uncertified capability
- dependency failure
- evidence insufficient
- conflict
- timeout
- unsafe mutation
- permission denied
- unknown implementation error

A failure must preserve:

- user intent
- Work state
- partial safe outputs
- retry information
- fallback option
- audit record

## Idempotency

Repeated execution of the same approved request must not create:

- duplicate Work
- duplicate Project tasks
- duplicate outputs
- duplicate registry records
- duplicate relationship edges

## Required tests

- advisory mode
- draft mode
- validation mode
- transformation mode
- enrichment mode
- calculation mode
- planning mode
- dependency resolution
- parallel execution
- sequential execution
- mutation lock
- approval
- rollback
- idempotency
- provenance
- failure recovery
