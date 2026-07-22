# 307 — Spark Estate Platform Authority Hierarchy & Single-Owner Standard

## Standard ID

`standard.platform_authority_hierarchy`

## Purpose

Establish one authoritative owner for every major Spark Estate concept so Cursor does not build duplicate registries, runtimes, data models, routing systems, context systems, lifecycle owners, or certification systems.

This file must be read before implementing any Blueprint, Chamber member, Board member, Create experience, Project feature, Business Estate feature, dashboard, workflow, or integration.

## Highest governing rule

> Every major platform concept has one authoritative owner. Other features may configure it, extend it, project it, reference it, or contribute to it—but may not recreate it.

## Conflict rule

When any earlier or later file appears to create a second owner, this standard controls.

Interpret the later file as an extension of the named authoritative owner unless an explicit architecture migration has been approved.

## Platform authority hierarchy

### 1. Universal Work identity

**Authoritative owner:** Universal Work Engine and canonical Work record.

Owns:

- Work ID
- Work Type
- Work lifecycle
- status
- save
- resume
- Continue
- provenance
- source
- ownership
- relationships
- completion
- archive
- restoration

May be extended by:

- Blueprints
- Create
- Projects
- Chamber workflows
- Board workflows
- Events
- Business Estate
- industry-specific workflows

Must never be duplicated by:

- Blueprint-specific work records
- Chamber-specific work records
- separate Create work IDs
- separate Project handoff work IDs
- separate resume engines

### 2. Work Type registry

**Authoritative owner:** Existing Universal Work Type Registry.

Owns:

- stable Work Type ID
- aliases
- schema version
- launch configuration
- output support
- runtime configuration
- lifecycle metadata
- certification linkage

Blueprint rule:

> A Blueprint is a specialized registered Work Type or a Blueprint projection of a registered Work Type. It is not a separate competing registry architecture.

The Master Blueprint Registry files must be implemented as:

- Blueprint-specific metadata extensions
- taxonomy projections
- discovery projections
- dependency projections
- certification projections

They must not create a second independent registry.

### 3. Universal Create runtime

**Authoritative owner:** Universal Create runtime.

Owns:

- creation session behavior
- editing
- versioning
- drafts
- validation
- approvals
- saving
- reusable outputs
- exact resume
- export
- connection to Projects

Blueprint rule:

Blueprints configure and orchestrate Create. They do not build a second creation runtime.

### 4. Create artifact

**Authoritative owner:** Canonical Create artifact.

Owns:

- created content
- structured creation payload
- version history
- source Blueprint
- related business context
- approval state
- reuse state
- Project handoff relationship

Project rule:

Create remains the source of truth for created content. Projects manage execution through a relationship, not copied content.

### 5. Projects

**Authoritative owner:** Projects domain and canonical Project record.

Owns:

- Project identity
- execution planning
- milestones
- tasks
- dependencies
- dates
- owners
- progress
- risks
- execution status

Must never be duplicated by:

- Blueprint-specific Project tables
- Create-specific Project tables
- Chamber-specific Project models
- separate industry Project models

Industry-specific needs use extensions and relationships.

### 6. Tasks and action items

**Authoritative owner:** Canonical Task / Universal Work action layer.

Owns:

- task identity
- owner
- due date
- status
- priority
- dependencies
- recurrence
- evidence
- history

Checklists, Blueprint steps, event actions, and operational actions may instantiate or reference canonical tasks.

They must not create disconnected task systems.

### 7. Relationships

**Authoritative owner:** Creation Ecosystem Relationship Registry and canonical relationship model.

Owns:

- source object
- target object
- relationship type
- role
- status
- permissions
- provenance
- lifecycle

All new relationships must register here.

No feature may create a separate relationship registry.

### 8. Business identity

**Authoritative owner:** Canonical Business record within My Business Estate / Business Profile architecture.

Owns:

- business identity
- legal and display names
- industry
- business model
- stage
- locations
- ownership
- active status

Blueprints read and selectively update through permissioned workflows.

They do not create separate business profiles.

### 9. Business Profile and Business DNA

**Authoritative owner:** Business Profile and Business DNA canonical context.

Owns:

- mission
- vision
- values
- positioning
- differentiators
- brand promise
- voice
- terminology
- quality standards
- risk posture
- user-defined business preferences

Blueprint Context Connection extends this context-loading contract.

It must not create a Blueprint-only context database.

### 10. People I Help and client avatars

**Authoritative owner:** Canonical Client Avatar / People I Help records.

Owns:

- avatar identity
- goals
- needs
- frustrations
- objections
- buying triggers
- communication preferences
- evidence basis
- version

Blueprints may select, reference, compare, or propose updates.

They must not silently duplicate avatars in Blueprint sessions.

### 11. Person and organization identity

**Authoritative owner:** Canonical Person and Organization records.

Owns:

- identity
- contact methods
- core preferences
- privacy classification
- consent
- external references

Roles are relationships or role assignments.

Do not create separate copies of a person for client, employee, candidate, speaker, vendor, or member roles.

### 12. Client relationship

**Authoritative owner:** Canonical Client Account / relationship record.

Owns:

- business-to-client relationship
- lifecycle
- owner
- selected avatars
- engagements
- offers
- communications
- service history
- health
- privacy

CRM, Blueprints, Projects, proposals, and client experience features reference it.

### 13. Offers, products, services, and packages

**Authoritative owner:** Canonical Offer, Product, Service, and Package objects.

Owns:

- identity
- description
- scope
- inclusions
- exclusions
- delivery
- audience
- status
- version

Industry Blueprints may extend them.

They must not create incompatible offer or product models.

### 14. Pricing

**Authoritative owner:** Canonical Pricing Model.

Owns:

- pricing logic
- assumptions
- currency
- costs
- margins
- rules
- fees
- discounts
- effective dates
- approval state
- version

Blueprints may create pricing scenarios or approved models through this object.

They must not store authoritative prices only in free text.

### 15. Commercial workflow

**Authoritative owners:**

- Opportunity
- Proposal
- Agreement
- Order or Booking
- Invoice
- Payment
- Subscription

Each owns its canonical identity and lifecycle.

Blueprints may guide creation and transitions.

They must not create parallel commercial records.

### 16. Locations, assets, inventory, and reservations

**Authoritative owners:**

- Location
- Asset
- Inventory Item
- Reservation
- Work Order
- canonical Schedule and Capacity layer

Industry needs use extensions:

- property
- room
- vehicle
- rental item
- equipment
- franchise location
- warehouse
- venue

Do not create separate scheduling or reservation engines by industry.

### 17. Knowledge and content

**Authoritative owners:**

- Intelligence Library for reusable expert knowledge
- canonical Knowledge Item
- canonical Content Asset
- canonical Template
- canonical Communication

Blueprints and Chamber members may retrieve and contribute according to permissions.

They do not create isolated knowledge stores.

### 18. Decisions, approvals, risks, and incidents

**Authoritative owners:**

- Decision
- Approval
- Risk
- Incident

Board, Chamber, Projects, and Blueprints reference these shared objects.

No separate Board decision database or Blueprint risk register architecture may compete with them.

### 19. Goals, metrics, and dashboards

**Authoritative owners:**

- Goal
- Metric Definition
- Metric Observation
- Dashboard

Dashboard displays are projections.

Industry dashboards must reuse canonical metric definitions and source records.

### 20. Routing and navigation

**Authoritative owner:** Existing global routing / anywhere-origin Universal Work routing architecture.

Owns:

- destination resolution
- authorization
- source context
- launch payload
- duplicate detection
- exact resume
- return destination
- failure behavior

Blueprint routing extends this owner.

It must not create a separate router.

### 21. Context envelope

**Authoritative owner:** Canonical Universal Work context envelope.

Carries:

- user
- business
- Work
- Blueprint
- Create artifact
- Project
- selected avatar
- selected offer
- selected objects
- source route
- permissions
- context version
- overrides
- provenance

Blueprint Context Connection extends field resolution and prefill behavior.

It does not create a second context envelope.

### 22. Certification

**Authoritative owner:** Existing Universal Work Type Certification architecture.

Required certification modules may include:

- Blueprint Createability
- Blueprint Context Connection
- Shared Object Library compliance
- routing
- accessibility
- privacy
- professional boundaries
- domain validation
- Shari voice and conversation behavior

Modules report into one certification owner.

They must not create competing certification authorities.

## Authority behavior types

Every architecture reference must declare one of these relationships:

- `owns`
- `extends`
- `configures`
- `projects`
- `references`
- `contributes`
- `validates`
- `migrates_from`
- `deprecated_by`

No document may use vague language such as “creates the system” when the system already has an owner.

## No-shadow-system rule

A shadow system is any second implementation that stores, routes, resumes, certifies, or governs the same concept outside its authoritative owner.

Shadow systems are prohibited.

Examples:

- BlueprintSession storing a second copy of Business Profile as authoritative
- separate BlueprintTask table competing with Task
- separate BlueprintProject competing with Project
- separate BlueprintRegistry competing with Work Type Registry
- separate BlueprintRouter competing with global routing
- separate BlueprintCertification database competing with Universal Work Type Certification
- separate industry Client table competing with Client Account
- separate event Vendor model instead of Vendor Account plus event relationship

## Production condition

No implementation proceeds until the affected concept has:

1. an identified authoritative owner
2. a declared extension relationship
3. a shared-object mapping
4. a migration plan if duplicates exist
5. tests proving no competing owner was introduced
