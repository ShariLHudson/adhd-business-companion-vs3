# 076 — Runtime Certification Standard

## 1. Purpose
Define the required evidence before the Universal Creation runtime may be considered production-ready.

## 2. Certification Principle
Code completion is not runtime certification.

Unit tests are necessary.

Browser evidence is decisive.

## 3. Required Test Environments

- local development
- production-like preview
- authenticated browser
- fresh session
- stale-session scenario
- refresh
- multiple tabs when applicable
- offline or network-failure simulation

## 4. Core Certification Matrix

### 4.1 Clear Request
Input:

> Create a Client Onboarding Checklist

Pass requires:

- Checklist classification
- new Work ID
- correct title
- correct structure
- no UC discovery loop
- durable record
- visible workspace

### 4.2 Event Enrichment
Input:

> Create a Fall Leadership Retreat

Pass requires:

- event-plan shell
- Retreat typeLabel
- event enrichment
- Retreat title
- no Checklist structure

### 4.3 Stale Session
Seed stale Universal Creation discovery state.

Then create a supported Foundation type.

Pass requires stale state bypass and direct creation.

### 4.4 Failed Handoff
Force workspace-open failure.

Pass requires truthful error and no fallthrough to another runtime.

### 4.5 Resume
Refresh and resume from:

- Welcome Home
- Create
- Projects

Pass requires same Work ID and same content.

### 4.6 Start New
From active work, request a brand-new item.

Pass requires a new Work ID and preserved old work.

### 4.7 General Conversation Exit
Ask an unrelated question while work is active.

Pass requires no mutation to the work and no forced continuation.

### 4.8 Chamber
Ask a Chamber Member for contribution.

Pass requires bounded context, correct routing, and return to same Work ID.

### 4.9 Board
Ask the Round Table for perspective.

Pass requires decision context and linked notes.

### 4.10 Persistence
Edit a section, refresh, and reopen.

Pass requires durable content.

### 4.11 Conflict
Open same work in two tabs and edit.

Pass requires conflict detection and no silent overwrite.

### 4.12 Offline
Edit offline.

Pass requires truthful state and safe recovery.

## 5. Storage Evidence
Capture:

- Work ID
- classification
- title
- originalRequest
- workingIntent
- workspace record
- section records
- persistence version
- local recovery state
- linked Project IDs
- archive/delete state

## 6. Pipeline Evidence
Capture:

- selected owner
- selected handler
- classification
- handoff outcome
- fallback blocked
- stale owner bypass
- persistence outcome

## 7. UI Evidence
Capture:

- workspace title and type
- current focus
- section structure
- save state
- next step
- no discovery question
- correct resume card
- correct Projects card

## 8. Certification Blockers

- wrong classification
- no durable Work ID
- hidden duplicate
- stale session ownership
- false saved state
- silent fallthrough
- refresh loss
- resume mismatch
- dead action
- incorrect title
- unrelated turn mutates work
- failed integration loses context
- conflict overwrite

## 9. Required Verdict

```text
076 BUNDLE 02 — PLATFORM RUNTIME AND CORE ARCHITECTURE

Universal runtime: PASS / PARTIAL / FAIL
Workspace runtime: PASS / PARTIAL / FAIL
Work identity: PASS / PARTIAL / FAIL
Lifecycle: PASS / PARTIAL / FAIL
Context model: PASS / PARTIAL / FAIL
Routing and ownership: PASS / PARTIAL / FAIL
State management: PASS / PARTIAL / FAIL
Persistence: PASS / PARTIAL / FAIL
Integration contracts: PASS / PARTIAL / FAIL
Browser certification: PASS / PARTIAL / FAIL

BUNDLE 02 READY FOR UNIVERSAL WORKSPACE IMPLEMENTATION: YES / NO
```

## 10. Regression Rule
Any future change to routing, identity, persistence, ownership, lifecycle, or integration requires rerunning this certification matrix.
