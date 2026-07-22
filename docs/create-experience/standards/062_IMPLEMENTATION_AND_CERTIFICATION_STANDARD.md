# 062 — Implementation and Certification Standard

## Status

Production engineering and certification standard.

**Runtime:** `lib/createCertification/`  
**Paired with:** [063 Traceability Matrix](./063_STANDARD_IMPLEMENTATION_TRACEABILITY_MATRIX.md)  
**Note:** Document ID is **062**. Draft filename `060_IMPLEMENTATION_…` redirects here (060 is Intelligent Recommendation Engine).

This standard applies to every Spark Estate™ architecture standard, runtime service, Creation Workspace, Chamber capability, Board capability, routing layer, editor, registry, recommendation engine, lifecycle service, integration, and user-facing experience.

It extends the creation architecture defined in Standards 045–061, including the Universal Creation Entrypoint, redesigned Create experience, Recommendation Engine, and Universal Creation State Machine.

---

# Mission

No Spark Estate architecture is complete merely because it has been documented, partially implemented, or reported as passing a limited test suite.

Every capability must be:

1. translated into a complete implementation specification
2. implemented in production-quality runtime code
3. connected to existing canonical platform services
4. tested at every required level
5. validated through authenticated user journeys
6. certified against explicit acceptance criteria
7. documented with known limitations and remaining risks
8. protected by permanent regression coverage

The purpose of this standard is to ensure Spark Estate works coherently and reliably for real users—not merely that files exist or isolated tests pass.

---

# Core Principle

```text
Governing Standard
        ↓
Implementation Specification
        ↓
Runtime Implementation
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Authenticated Browser Tests
        ↓
Accessibility and Performance Validation
        ↓
Regression Protection
        ↓
Certification
        ↓
Production
```

No major production capability may skip this sequence without a documented exception and explicit risk acceptance.

---

# Permanent Platform Rule

Every front door into creation must use the same underlying creation architecture.

This includes:

- Shari
- Create
- Projects
- Visual Thinking
- Chamber members
- Board members
- Dashboard
- Search
- Cartography
- notifications
- reminders
- existing conversations
- existing assets
- future entry points

All must resolve through:

- the Universal Creation Entrypoint
- the Universal Creation Engine
- one canonical Creation Record
- one canonical Creation Workspace
- one shared Creation Context
- one Relationship Registry
- one connected Project execution layer

No entry point may implement a separate version of the same creation.

---

# Definition of Done

A capability is not done because:

- code compiles
- one screen renders
- one unit test passes
- a prompt produces a plausible answer
- a markdown standard exists
- Cursor reports completion
- a developer says it should work
- the happy path works once
- the feature works only from one entry point

A capability is done only when:

- the governing standard is identified
- every applicable requirement maps to runtime behavior
- the canonical source of truth is identified
- shared architecture is reused
- no parallel implementation is introduced
- persistence is proven
- return and resume are proven
- duplicate prevention is proven
- failure recovery is proven
- authenticated browser flows pass
- accessibility requirements pass
- regression protection exists
- no unresolved critical or high-severity defect remains
- certification status is recorded
- the traceability matrix is updated

---

# Required Companion Artifacts

Every major standard or capability must have four connected artifacts.

## 1. Governing Standard

Defines:

- mission
- principles
- required behavior
- prohibited behavior
- canonical ownership
- integration rules
- failure conditions
- required tests
- completion conditions

## 2. Implementation Specification

**Template:** [064 Implementation Specification Template](./064_IMPLEMENTATION_SPECIFICATION_TEMPLATE.md)

Defines:

- exact scope
- repository areas
- existing architecture to reuse
- canonical source of truth
- module and file plan
- schemas and types
- runtime flow
- persistence
- integrations
- UI behavior
- conversation behavior
- error handling
- migration
- testing
- acceptance criteria

## 3. Certification Specification

**Template:** [065 Certification Test Specification Template](./065_CERTIFICATION_TEST_SPECIFICATION_TEMPLATE.md)

Defines:

- test scenarios
- acceptance criteria
- expected results
- evidence requirements
- severity rules
- browser validation
- accessibility validation
- performance validation
- known limitations
- certification decision

## 4. Traceability Record

**Matrix:** [063 Traceability Matrix](./063_STANDARD_IMPLEMENTATION_TRACEABILITY_MATRIX.md) · runtime `lib/createCertification/traceabilityMatrix.ts`

Maps:

- requirement
- implementation file
- runtime function
- test
- evidence
- certification status
- unresolved gap

---

# Implementation Rules

## Reuse Before Creating

Before adding code, inspect the repository for:

- equivalent types
- existing registries
- shared state services
- routing utilities
- persistence patterns
- editor frameworks
- test helpers
- conversation certification
- Creation Context
- Relationship Registry
- ownership services
- project bridges
- Cartography bridges
- readiness services
- recommendation services
- lifecycle services

Do not create parallel architecture when a canonical implementation already exists.

## One Responsibility per Module

Each module should own one clear responsibility.

Avoid:

- oversized multipurpose files
- duplicate resolver logic
- domain-specific forks of universal behavior
- hidden state mutation
- duplicate schemas
- direct database writes that bypass canonical services
- UI components that contain business logic already owned by runtime services

## Canonical Source of Truth

Every implementation must identify its authoritative source.

Examples:

- Creation Record
- Event Record
- Relationship Registry
- Ownership Registry
- Asset Registry
- Universal Creation Context
- Recommendation Engine
- Universal Creation State Machine

Do not introduce a second authoritative record for convenience.

## No Orphans

Every created runtime object must connect to its parent ecosystem.

No orphaned:

- workspaces
- assets
- projects
- conversations
- decisions
- tasks
- Cartography nodes
- readiness records
- versions
- recommendations
- lifecycle states

## No Duplicate Paths

All user entry points must converge through shared runtime services.

Do not create separate logic for:

- Create
- Shari
- Events
- Marketing
- Projects
- Visual Thinking
- Board
- Search
- Dashboard
- Cartography

These are front doors, not separate creation platforms.

## Infrastructure Remains Invisible

Do not expose internal architecture to users.

Users should see:

- their work
- their progress
- their next step
- their assets
- their conversations
- their decisions

Users should not be asked to manage:

- Project Homes
- Creation Records
- registry IDs
- workspace IDs
- Relationship Registry records
- readiness records
- internal routing
- canonical links

---

# Required Test Layers

## Unit Tests

Prove isolated logic such as:

- intent classification
- confidence routing
- state transitions
- recommendation ranking
- alias resolution
- duplicate prevention
- relationship registration
- readiness calculations
- ownership resolution
- change-impact identification

## Integration Tests

Prove coordination between services such as:

- entry point to Creation Record
- Create input to Universal Creation Engine
- asset creation to Relationship Registry
- workspace to Project execution
- state machine to recommendations
- discovery to workspace transition
- save to version history
- change impact to review recommendations
- search result to canonical asset
- Visual Thinking to canonical Creation Context

## Authenticated Browser Tests

Prove real user behavior in the authenticated application.

At minimum verify:

- entry from every supported front door
- correct workspace opens
- content persists after refresh
- return state restores
- assets open and save
- no duplicate creation occurs
- navigation works
- back and return behavior works
- errors recover safely
- user-facing language is correct
- internal infrastructure is not exposed
- narrow-screen behavior remains usable

## Regression Tests

Every fixed defect must receive a regression test when technically practical.

A bug is not considered fixed if it can silently return.

## Accessibility Tests

Validate:

- keyboard navigation
- visible focus
- readable labels
- semantic controls
- screen-reader names
- contrast
- zoom behavior
- responsive layout
- reduced-motion compatibility
- error announcements
- accessible drag-and-drop alternatives where relevant

## Performance Tests

Validate:

- workspace opening
- context assembly
- registry loading
- recommendation generation
- search
- save
- resume
- large-workspace behavior
- relationship traversal
- dynamic section loading

Performance expectations must be documented and measured.

---

# Required Scenario Coverage

Every major implementation must test:

- first use
- existing work
- return after absence
- duplicate request
- asset-first entry
- entry from a different front door
- incomplete data
- changed data
- conflicting data
- failed save
- network interruption where relevant
- archived work
- reuse or version creation
- accessibility
- mobile or narrow layout
- error recovery
- user cancellation
- user skipping a recommendation
- state reversal
- change-impact review

---

# Severity Levels

## Critical

Blocks the core user journey, corrupts data, creates duplicate canonical records, loses work, exposes sensitive information, or prevents recovery.

Certification is forbidden.

## High

Breaks a major workflow, loses context, creates orphaned work, exposes architecture, repeats discovery, or routes users to competing workspaces.

Certification is forbidden.

## Medium

Creates meaningful friction or incomplete behavior but has a safe workaround.

May be conditionally certified only with an owner and remediation plan.

## Low

Minor polish, wording, or nonblocking visual issue.

May be certified with documentation.

---

# Certification States

Every implementation must receive one status:

- NOT_STARTED
- IN_IMPLEMENTATION
- TESTING
- BLOCKED
- NOT_CERTIFIED
- CONDITIONALLY_CERTIFIED
- CERTIFIED
- DEPRECATED

Only `CERTIFIED` may be described as production complete.

---

# Certification Evidence

Certification evidence must include:

- governing standard
- implementation specification
- changed files
- test files
- test command results
- typecheck result
- lint result where applicable
- authenticated browser evidence
- accessibility result
- performance result where required
- known limitations
- unresolved defects
- final certification decision

Screenshots alone are insufficient.

Passing unit tests alone is insufficient.

A completion summary without test evidence is insufficient.

---

# Required Completion Report

Every implementation task must return:

```text
Governing Standard:
Implementation Specification:
Capability:
Status:

Files Created:
Files Modified:
Files Removed:

Existing Architecture Reused:
Canonical Source of Truth:
New Runtime Services:
New Types or Schemas:
Persistence Changes:
Migrations:

Unit Tests:
Integration Tests:
Authenticated Browser Tests:
Regression Tests:
Accessibility:
Performance:
Typecheck:
Lint:

Normal Flow Result:
Return/Resume Result:
Duplicate-Prevention Result:
Failure-Recovery Result:
Cross-Entry Consistency Result:

Known Limitations:
Unresolved Defects:
Severity:
Follow-Up Required:

Certification:
CERTIFIED / CONDITIONALLY_CERTIFIED / NOT CERTIFIED

Exact Next Recommended Step:
```

Do not claim certification when required evidence is missing.

---

# Production Hardening Rule

Once a foundational architecture stack is complete, the default work mode becomes production hardening.

Production hardening prioritizes:

- real runtime behavior
- persistence
- continuity
- duplicate prevention
- authenticated browser proof
- accessibility
- failure recovery
- performance
- regression protection
- user-facing clarity
- cross-entry consistency
- large-workspace behavior

Do not create more architecture standards unless a genuine architectural gap is proven.

---

# Change Management

Any material change to a certified capability must:

1. identify affected standards
2. identify affected runtime services
3. identify affected tests
4. run required regression suites
5. update traceability
6. reassess certification

A certified capability may return to `TESTING` or `NOT_CERTIFIED` when material changes introduce uncertainty.

---

# Required Tests for This Standard

The repository must verify that:

1. every production standard can map to an implementation specification
2. every implemented capability has traceability
3. certification cannot be marked complete without required evidence
4. critical and high defects block certification
5. missing browser validation remains visible
6. duplicate-prevention tests are mandatory for creation flows
7. return and resume tests are mandatory for persistent work
8. cross-entry consistency is tested
9. certification status is machine-readable where practical
10. completion reports follow the required structure

---

# Platform Principle

> Spark Estate is not production-ready because its architecture is impressive.  
> It is production-ready when real users can rely on that architecture repeatedly, safely, and without losing context, work, or trust.
