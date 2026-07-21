# 331 — Runtime Resilience, Recovery, and Safe Degradation

## Purpose

Define how Spark Estate preserves user trust, Work integrity, and continuity when capabilities, registries, connected sources, generation services, or user interfaces fail.

## Core principle

A failure must not cost the user their thinking.

## Resilience priorities

1. preserve user input
2. preserve canonical Work
3. prevent duplicate Work
4. prevent unsafe mutation
5. preserve provenance
6. provide a useful fallback
7. support recovery
8. record the incident

## Failure categories

- registry unavailable
- capability unavailable
- contributor timeout
- connected source unavailable
- model generation failure
- database error
- conflict
- stale context
- approval failure
- export failure
- browser/navigation failure
- partial Project creation
- duplicate detection uncertainty
- permission failure

## Safe degradation

When a capability is unavailable:

- retain the request
- identify whether a certified fallback exists
- reduce scope
- provide a clearly bounded manual path
- do not simulate unavailable expert capability without disclosure

When a Collection cannot fully assemble:

- preserve usable completed contributions
- disclose what is missing
- avoid presenting incomplete synthesis as final
- allow resume after recovery

When a connected source fails:

- do not invent source content
- identify the unavailable source
- use cached content only when freshness is acceptable
- preserve the user's place

## Draft preservation

User-entered and generated drafts should support:

- autosave
- local or server recovery
- version snapshots
- conflict detection
- restore
- explicit discard

## Partial mutation protection

Use transaction or compensating-action patterns for:

- Work creation
- Project creation
- task generation
- relationship creation
- output creation
- approval application

## Retry behavior

Retries must be:

- bounded
- idempotent
- observable
- non-duplicating
- interruptible

## User-facing recovery

Recovery messages should:

- be plain and calm
- state what was preserved
- state what did not complete
- offer one next action
- avoid technical detail unless requested
- avoid sending the user through menus

## Incident severity

- minor
- moderate
- high
- critical

Critical incidents include:

- data loss
- cross-business data exposure
- duplicate canonical Work
- silent consequential mutation
- corrupted provenance
- unrecoverable Project/Work divergence

## Recovery records

Track:

- incident ID
- correlation ID
- user and business context
- affected Work
- failure category
- preserved data
- attempted actions
- rollback
- final status
- user-visible message
- follow-up requirement

## Required tests

- capability timeout
- registry outage
- connected-source failure
- partial Work creation
- partial Project creation
- duplicate-safe retry
- draft restore
- conflict recovery
- safe degradation
- rollback
- calm user messaging
- incident traceability
