# 295 — Master Shared Object Library Standard

## Standard ID

`standard.master_shared_object_library`

## Mission

Create one canonical, reusable object library for Spark Estate so every Blueprint, Chamber member, Create experience, Project, dashboard, and workflow operates on the same trusted records instead of building disconnected versions of the same information.

## Governing rule

> A common business concept must have one canonical object definition, one authoritative identity, controlled extensions, and shared lifecycle behavior across the platform.

Blueprints may extend shared objects for industry-specific needs.

Blueprints must not create incompatible duplicate versions of:

- businesses
- people
- clients
- organizations
- client avatars
- offers
- products
- services
- locations
- assets
- vendors
- partners
- opportunities
- proposals
- agreements
- pricing models
- invoices
- payments
- work
- Projects
- tasks
- appointments
- events
- inventory
- files
- approvals
- decisions
- risks
- incidents
- goals
- metrics
- dashboards
- communications
- learning resources
- content assets
- templates
- policies
- procedures
- certifications

## Platform-wide outcomes

The Shared Object Library must make it possible to:

- enter information once
- reuse it across Blueprints
- preserve one source of truth
- connect related records
- prevent cross-business contamination
- retain history and provenance
- support exact resume
- support Create-to-Project handoff
- support Chamber collaboration
- support reporting and dashboards
- support industry extensions
- support export and integration
- support privacy and access control
- support archive and restoration
- support certification

## Object design principles

Every canonical object must have:

- globally unique object ID
- object type
- owning user or organization
- business ID
- lifecycle status
- title or display name
- structured fields
- source provenance
- created date
- updated date
- version
- created by
- last modified by
- access policy
- relationships
- tags
- archive state
- validation state
- sync state
- optional external references

## Universal relationship principles

Objects must connect through explicit relationships rather than copied text.

Examples:

- a proposal references a client, offer, pricing model, and opportunity
- a Project references its originating Create artifact and Blueprint session
- an invoice references the approved proposal or agreement
- a task references a Project, owner, milestone, and dependency
- a client avatar references its business
- a product references pricing, inventory, vendors, and campaigns
- a dashboard references metric definitions and source objects

## Extension rule

Industry-specific fields must be added through controlled extension schemas.

Examples:

- a vehicle extends Asset
- a rental item extends Asset
- a candidate extends Person
- a worker assignment extends Work Assignment
- a property extends Location or Asset depending on use
- a franchise unit extends Location
- a coaching client extends Client Relationship context

Extensions must preserve the canonical object ID and shared behavior.

## No-duplication rule

A Blueprint fails architecture review if it:

- creates a second client model
- creates a second offer model
- creates a second task model
- creates a second proposal model
- stores a location as disconnected free text when a canonical location exists
- copies profile context into an unlinked record
- duplicates a Create artifact when handing work to Projects
- creates separate dashboard metrics without canonical definitions

## Ownership and stewardship

Each object category must have:

- platform owner
- domain steward
- contributor capabilities
- validation rules
- privacy classification
- retention policy
- migration policy
- certification tests

## Required registries

Implement and maintain:

- Master Object Type Registry
- Master Field Registry
- Master Relationship Registry
- Object Extension Registry
- Status and Lifecycle Registry
- Validation Rule Registry
- Permission Policy Registry
- External Mapping Registry
- Deprecation and Migration Registry

## Production rule

No new Blueprint may define a new persistent business object without first checking whether:

1. a canonical object already exists
2. an extension is sufficient
3. a new relationship type is sufficient
4. a new field belongs in the Master Field Registry
5. a genuinely new object type is justified

All new object types require architecture approval and certification.
