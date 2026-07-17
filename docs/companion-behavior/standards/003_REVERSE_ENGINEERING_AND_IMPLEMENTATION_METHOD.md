# Spark Estate™ Reverse Engineering and Implementation Method

## Purpose

Reverse engineer Spark Estate™ from the intended member experience backward into code.

Do not begin by listing existing features and assuming their behavior is correct.

## Required Direction

**Promise → experience → conversation → state → decision → action → code → live proof**

## Phase 1 — Define the Contract

For one capability:

- define what the user expects
- define the correct answer
- define required and prohibited behavior
- define hidden ADHD friction
- define the no-setup default
- define permission and state requirements
- define success

Do not inspect code until the expected behavior is clear.

## Phase 2 — Trace Existing Implementation

Identify:

- all entry points
- API routes
- routers and gates
- prompts
- local and database state
- memory sources
- pending-choice stores
- action executors
- response owners
- UI components
- early returns
- feature flags
- duplicated logic
- bypasses

## Phase 3 — Compare Contract to Reality

Classify every requirement:

- working
- partially working
- missing
- duplicated
- conflicting
- bypassed
- unverified

## Phase 4 — Design the Minimum Authoritative Fix

Prefer:

- one owner
- one state source
- one decision path
- structured results
- reusable rules
- safe defaults

Do not add another parallel router, prompt, or special-case phrase patch.

## Phase 5 — Implement

Implementation must:

- satisfy the contract
- remove or neutralize conflicting paths
- preserve unrelated working behavior
- add instrumentation
- add regression tests
- document remaining limitations

## Phase 6 — Verify

Verification must include:

- unit tests
- integration tests
- isolated conversation tests
- actual visible preview UI
- action execution
- new-chat isolation
- refresh behavior
- production parity

## Phase 7 — Release Decision

A capability ships only when the visible member experience satisfies the contract.

Passing code is not proof of passing behavior.
