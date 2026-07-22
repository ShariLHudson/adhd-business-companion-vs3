# 313 — Cursor Master Consolidation & Implementation Handoff

## Purpose

This is the execution handoff Cursor should follow after files 307–312.

Do not create new platform architecture until the repository has been audited, ownership has been resolved, duplicate systems have been mapped, and the implementation sequence has been approved.

## Primary objective

Consolidate Spark Estate into one coherent architecture where:

- one concept has one owner
- Blueprints extend existing platform systems
- no shadow systems are introduced
- existing user data is preserved
- earlier work is reused
- every promised Blueprint output is genuinely creatable
- Business Profile and Business DNA context are reused
- Create and Projects remain distinct but connected
- Work identity remains stable
- certification reflects actual runtime behavior

## Required operating mode

Cursor must work in this order:

1. inspect
2. inventory
3. map owners
4. identify duplicates
5. classify duplicates
6. propose migration
7. implement extensions
8. retrofit Blueprints
9. validate
10. certify
11. report

Do not skip directly from documentation to implementation.

## Required first deliverable

Before changing architecture, Cursor must produce:

- current architecture inventory
- canonical owner matrix
- duplicate system report
- unresolved conflicts
- recommended implementation sequence
- migration risks
- data-preservation plan
- rollback plan

## Implementation boundaries

Cursor may:

- extend existing registries
- add controlled metadata
- add relationship types
- add object extensions
- add missing validation
- add missing tests
- repair broken routes
- repair context resolution
- add migration scripts
- add adapters
- add generated views

Cursor may not:

- create a second Work Type registry
- create a second Blueprint runtime
- create a second Project model
- create a second Task system
- create a second route owner
- create a second relationship registry
- create a second context owner
- create a second certification authority
- silently delete legacy data
- overwrite canonical profile records without permission

## Required source-of-truth hierarchy

Use the authority order defined in file 307.

When uncertain:

- stop the architecture change
- document the competing candidates
- identify current consumers
- identify data ownership
- recommend one owner
- wait for explicit approval only if the conflict cannot be safely resolved from the standards

## Blueprint rule

Every Blueprint must resolve to:

- one stable Work Type identity
- Blueprint metadata extension
- one output manifest
- one context dependency map
- one capability dependency map
- one shared-object dependency map
- one routing configuration
- one exact-resume contract
- one certification record

## Final deliverable

Cursor must return a completion package containing:

- files changed
- models changed
- migrations added
- registries extended
- duplicate systems merged
- adapters retained
- systems deprecated
- user data migrated
- tests added
- certification results
- known limits
- unresolved issues
- rollback instructions
