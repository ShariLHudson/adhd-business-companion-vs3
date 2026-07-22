# 309 — Cursor Anti-Duplication Build Contract

## Purpose

Give Cursor explicit repository behavior rules that prevent duplicate systems from being created during implementation.

## Mandatory pre-build procedure

Before creating any:

- database table
- Prisma model
- Supabase table
- TypeScript interface
- Zod schema
- API route
- server action
- repository
- service
- state store
- registry
- router
- workflow
- certification record
- dashboard source
- context provider

Cursor must perform a repository search for existing equivalents.

## Required discovery searches

Search by:

- exact concept name
- aliases
- singular and plural
- domain language
- database table names
- TypeScript type names
- Zod schemas
- API endpoints
- repository functions
- UI labels
- route names
- migration history
- tests
- comments indicating deprecation or replacement

Examples:

Before creating `BlueprintTask`, search:

- Task
- WorkItem
- ActionItem
- ChecklistItem
- ProjectTask
- UniversalWork
- task tables
- task services
- task routes

Before creating `BlueprintRegistry`, search:

- WorkTypeRegistry
- UniversalWorkType
- create types
- workflow registry
- capability registry
- Blueprint metadata
- route registry

## Architecture decision output

Before implementation, Cursor must document:

- requested concept
- authoritative owner
- existing files and code found
- reuse decision
- extension decision
- relationship decision
- migration need
- why a new object is or is not required

## New object admission test

A new persistent object is allowed only when all are true:

1. no canonical object represents the identity
2. no extension can represent the new fields
3. no relationship can represent the role
4. no snapshot can represent the historical state
5. no temporary session state can represent the transient data
6. the object has a distinct lifecycle
7. the object has distinct permissions or retention needs
8. the new object is registered
9. migrations and tests are defined
10. architecture approval is recorded

If any test fails, reuse or extend the existing owner.

## Naming rules

Do not use prefixes to hide duplication.

Prohibited examples when canonical models already exist:

- BlueprintTask
- BlueprintProject
- BlueprintClient
- ChamberClient
- EventVendorRecord
- CoachingPerson
- RetailInventory
- BlueprintRouter
- BlueprintCertification
- BlueprintResumeState

Prefer:

- Task plus source relationship
- Project plus Blueprint relationship
- Client Account plus engagement relationship
- Vendor Account plus event relationship
- Person plus role assignment
- Inventory Item plus industry extension
- global router plus Blueprint route configuration
- universal certification plus Blueprint module
- Universal Work resume state plus Blueprint section pointer

## Database guardrails

Require:

- canonical foreign keys
- unique constraints
- stable IDs
- typed relationship constraints
- business_id isolation
- user authorization
- provenance
- created_at and updated_at
- version where needed
- archive behavior
- migration scripts
- rollback strategy

Avoid:

- copied JSON as a permanent source of truth
- free-text references where object IDs exist
- duplicated status enums
- duplicated lifecycle logic
- tables owned only by one UI component
- silent cross-business joins
- unversioned authoritative snapshots

## API guardrails

Use shared domain services.

Do not create Blueprint-only CRUD endpoints for canonical objects unless they are thin, authorized adapters that call the canonical service.

Every API write must identify:

- authoritative object
- permission
- validation
- provenance
- source Work
- affected relationships
- lifecycle transition

## UI guardrails

A different screen does not justify a different data model.

Blueprint, Chamber, Create, Project, and Business Estate views may display different projections of the same canonical object.

UI forms should bind to:

- canonical fields
- extension fields
- session-local overrides
- explicit snapshots

## State-management guardrails

Temporary UI state may exist locally.

Authoritative business state must not live only in:

- React component state
- Zustand store
- URL query parameters
- chat transcript
- Blueprint prompt memory
- unlinked JSON blobs

## Status and lifecycle guardrails

Use canonical status registries.

Do not create slightly different statuses such as:

- done
- completed
- finished
- closed

without mapping them to a canonical lifecycle.

## Failure rule

When Cursor cannot determine the owner:

- do not create the new system
- mark the implementation blocked
- produce an ownership question
- cite the competing candidates
- preserve the requested feature as a backlog item

## Definition of done

A feature is not done until it proves:

- it reused the correct owner
- it created no shadow system
- it preserved existing records
- it passes duplicate-model tests
- documentation and runtime agree
