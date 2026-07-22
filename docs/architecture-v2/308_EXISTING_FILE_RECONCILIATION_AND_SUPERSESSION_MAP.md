# 308 — Existing File Reconciliation & Supersession Map

## Purpose

Tell Cursor how to interpret files 233–306 without building duplicate architecture.

This is an interpretation and precedence map.

It does not discard the valuable content in those bundles.

## Files 233–236 — Blueprint Createability Standard

### Keep

Keep:

- promised-output validation
- creation-path requirements
- save, edit, resume, reuse, and validation requirements
- Create-to-Project handoff checks
- createability audit
- createability certification tests

### Reinterpret as

`extends Universal Work Type Certification`

### Must not create

- separate Blueprint runtime
- separate save system
- separate resume system
- separate output engine
- separate certification owner

### Correct implementation

Add Blueprint Createability as a mandatory certification module attached to the registered Blueprint Work Type.

## Files 273–278 — Blueprint Profile Context Connection

### Keep

Keep:

- Business Profile prefill
- Business DNA prefill
- client-avatar loading
- offer, product, and service loading
- multiple-business isolation
- local override behavior
- canonical update permission
- provenance
- stale-context behavior
- context certification

### Reinterpret as

`extends Canonical Universal Work Context Envelope and Business Profile context resolution`

### Must not create

- separate Blueprint profile
- separate Blueprint Business DNA
- separate Blueprint context database
- second launch payload
- second resume state owner

### Correct implementation

Store only:

- selected object references
- session-local overrides
- snapshots required for historical accuracy
- provenance
- context version

Canonical information remains in canonical objects.

## Files 295–300 — Master Shared Object Library

### Keep

Keep the business-domain object definitions for:

- Business
- Person
- Organization
- Client Account
- Vendor Account
- Partner Account
- Offer
- Product
- Service
- Package
- Pricing Model
- Opportunity
- Proposal
- Agreement
- Order
- Invoice
- Payment
- Subscription
- Location
- Asset
- Inventory
- Reservation
- Work Order
- Knowledge
- Content
- Decision
- Approval
- Risk
- Incident
- Goal
- Metric
- Dashboard

### Reinterpret as

`extends existing canonical Universal Work, Create, Project, Task, Relationship, and Creation Ecosystem architecture`

### Must not replace or recreate

- Work
- Work Type registry
- Create artifact
- Project
- Task
- relationship registry
- routing
- exact resume
- certification

### Required revision to implementation language

Where files 295–300 say “create one canonical object library,” interpret this as:

> Register and govern business-domain object types through the existing canonical platform object and relationship architecture.

## Files 301–306 — Master Blueprint Registry & Taxonomy

### Keep

Keep:

- Blueprint metadata
- taxonomy
- aliases
- discovery
- output dependency mapping
- capability ownership
- shared-object dependencies
- context dependencies
- routing metadata
- lifecycle metadata
- maintenance metadata
- certification projections

### Reinterpret as

`extends and projects the existing Universal Work Type Registry`

### Must not create

- second Blueprint registry database
- second route registry
- second lifecycle owner
- second certification owner
- second Work Type identity
- separate Blueprint runtime

### Correct implementation model

Use:

- one Universal Work Type Registry record
- Blueprint-specific extension fields
- Blueprint taxonomy tables or metadata
- generated Blueprint views
- generated navigation and search projections
- generated certification dashboard

The “Master Blueprint Registry” is a view or extension of the Work Type Registry, not a competing authority.

## Conflict precedence

When files conflict, apply this order:

1. Platform Authority Hierarchy & Single-Owner Standard
2. Universal Work Engine and Work Type Registry standards
3. Universal Create and Create artifact standards
4. Projects and Task canonical standards
5. Creation Ecosystem Relationship Registry
6. Business Profile and Business DNA canonical standards
7. Shared business-domain object extensions
8. Blueprint-specific standards
9. industry-specific Blueprint files
10. templates and examples

## Documentation correction rule

Cursor must not implement architecture directly from a sentence such as:

- “create a registry”
- “build a system”
- “establish a runtime”
- “create a new object”

until it checks this supersession map.

When an owner already exists, translate the instruction to:

- extend
- configure
- register
- project
- map
- validate
- migrate

## Upload and processing instruction

Process this file before files 233–306.

If files 233–306 were already uploaded, this file retroactively governs their interpretation.
