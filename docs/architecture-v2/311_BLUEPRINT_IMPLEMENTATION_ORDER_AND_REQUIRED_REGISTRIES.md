# 311 — Blueprint Implementation Order & Required Registries

## Purpose

Define what must exist so all Blueprint bundles can work together without duplicate implementation.

## Implementation order

### Stage 1 — Authority and inventory

Implement first:

- Platform Authority Hierarchy
- Existing File Reconciliation Map
- Cursor Anti-Duplication Contract
- repository duplicate-system audit

No new Blueprint runtime work should begin before this stage.

### Stage 2 — Confirm existing canonical foundations

Verify and repair:

- Universal Work Engine
- Work Type Registry
- Universal Create runtime
- Create artifact
- Projects
- Task
- Relationship Registry
- global routing
- exact resume
- Universal Work context envelope
- Universal Work Type Certification

### Stage 3 — Register business-domain objects

Extend the existing object and relationship architecture with:

- Business
- Business DNA
- Client Avatar
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
- Inventory Item
- Reservation
- Work Order
- Knowledge Item
- Content Asset
- Communication
- Decision
- Approval
- Risk
- Incident
- Goal
- Metric Definition
- Metric Observation
- Dashboard

### Stage 4 — Extend Work Type Registry for Blueprints

Add Blueprint metadata fields or related extension tables for:

- Blueprint family
- category
- subcategory
- aliases
- industries
- business models
- stages
- use cases
- context dependencies
- output dependencies
- capability dependencies
- shared-object dependencies
- recommendation metadata
- visibility
- implementation status
- certification projection
- maintenance metadata

Do not create a separate registry authority.

### Stage 5 — Implement Blueprint context connection

Implement:

- business resolution
- profile loading
- Business DNA loading
- avatar selection
- offer and service selection
- prior-work lookup
- local overrides
- canonical update permission
- provenance
- context version
- multiple-business isolation
- exact resume

### Stage 6 — Implement output manifests

For every promised output, register:

- output ID
- canonical object type
- Create template
- required inputs
- capability owner
- validation
- save destination
- export
- Project handoff
- professional-review rule
- implementation status

### Stage 7 — Retrofit existing Blueprints

For every Blueprint:

- register Work Type identity
- attach Blueprint metadata
- map aliases
- map context requirements
- map outputs
- map capabilities
- map shared objects
- map routes
- map exact resume
- map certification
- map known limitations

### Stage 8 — Generate user-facing projections

Derive from authoritative registries:

- Blueprint discovery
- Blueprint search
- category browsing
- Shari recommendations
- My Business Estate Blueprint views
- Chamber entry points
- Create launch choices
- Project handoff choices
- certification dashboards

Do not hard-code separate lists.

### Stage 9 — Certify and release

Require:

- Universal Work Type Certification
- Blueprint Createability module
- Blueprint Context Connection module
- Shared Object compliance module
- routing and resume tests
- accessibility
- privacy
- professional boundaries
- domain tests
- Shari voice tests

## Required authoritative registries

Use or create only as extensions of existing owners:

- Universal Work Type Registry
- Blueprint Metadata Extension
- Blueprint Taxonomy Projection
- Blueprint Alias Registry
- Output Type Registry
- Blueprint Output Manifest
- Capability Registry
- Blueprint Capability Dependency Map
- Canonical Object Type Registry
- Field Registry
- Relationship Type Registry
- Object Extension Registry
- Context Dependency Registry
- Route Configuration Registry
- Certification Module Registry
- Maintenance Register
- Deprecation and Migration Register

## Generated views, not new authorities

The following should be generated projections:

- Master Blueprint Registry view
- Blueprint navigation list
- Blueprint search index
- Blueprint recommendation index
- Blueprint certification dashboard
- industry Blueprint catalog
- Chamber Blueprint catalog
- My Business Estate Blueprint catalog

## Required implementation artifacts from Cursor

Cursor must produce:

- architecture owner matrix
- repository audit
- registry schemas
- extension schemas
- migrations
- seed data
- adapters
- generated registry views
- tests
- certification report
- unresolved gaps
- implementation handoff
