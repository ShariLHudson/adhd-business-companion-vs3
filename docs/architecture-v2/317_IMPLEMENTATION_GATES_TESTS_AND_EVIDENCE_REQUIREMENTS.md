# 317 — Implementation Gates, Tests & Evidence Requirements

## Purpose

Prevent Cursor from declaring success based only on code generation or UI appearance.

## Gate 1 — Architecture evidence

Provide:

- owner matrix
- registry mapping
- object mapping
- relationship mapping
- route mapping
- certification mapping

## Gate 2 — Data evidence

Provide:

- record counts before and after
- duplicate counts before and after
- relationship counts
- orphan checks
- cross-business isolation checks
- migration validation
- rollback validation

## Gate 3 — Runtime evidence

Demonstrate:

- new Blueprint start
- exact resume
- Business Profile prefill
- avatar selection
- output creation
- save
- edit
- reuse
- Create-to-Project handoff
- Project execution linkage
- completion
- archive and restore

## Gate 4 — No-duplication evidence

Demonstrate:

- one Work ID
- one Work Type identity
- one Project identity
- one Task identity
- one route owner
- one context envelope
- one relationship registry
- one certification owner
- one canonical business object per concept

## Gate 5 — User experience evidence

Verify:

- no repeated known questions
- no overwhelming catalog
- no forced navigation
- no lost context
- no unexpected canonical overwrite
- clear limitations
- usable low-energy path
- readable interface
- Shari voice continuity

## Gate 6 — Failure evidence

Test:

- unavailable capability
- stale profile context
- conflicting overrides
- broken relationship
- failed save
- failed migration
- unauthorized access
- deprecated Blueprint
- missing output implementation
- integration unavailable

## Required automated tests

Include:

- unit tests
- schema tests
- migration tests
- integration tests
- route tests
- authorization tests
- context tests
- resume tests
- output tests
- relationship tests
- duplicate detection tests
- certification tests

## Acceptance evidence package

Provide:

- screenshots or test recordings where useful
- test logs
- migration logs
- certification report
- known limitations
- unresolved issues
- rollback instructions
