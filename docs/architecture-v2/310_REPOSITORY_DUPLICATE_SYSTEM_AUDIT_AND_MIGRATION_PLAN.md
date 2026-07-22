# 310 — Repository Duplicate-System Audit & Migration Plan

## Purpose

Require a full repository audit before Cursor implements the remaining Blueprint architecture.

## Audit scope

Inspect:

- Supabase schema and migrations
- database functions and triggers
- TypeScript domain types
- Zod schemas
- server actions
- API routes
- repositories
- services
- state stores
- hooks
- components
- route configuration
- prompt registries
- Work Type registries
- Blueprint files
- Create files
- Project files
- Chamber files
- Board files
- certification files
- analytics and dashboards
- tests
- archived code
- feature flags

## Required duplicate-system categories

Audit at minimum:

- Work
- Work Type
- Blueprint identity
- Create artifact
- Project
- Task
- Checklist
- status
- lifecycle
- resume
- routing
- context
- Business
- Business Profile
- Business DNA
- Client Avatar
- Person
- Organization
- Client
- Vendor
- Partner
- Offer
- Product
- Service
- Pricing
- Proposal
- Agreement
- Order
- Invoice
- Payment
- Subscription
- Location
- Schedule
- Appointment
- Event
- Asset
- Inventory
- Reservation
- Work Order
- Knowledge
- Content
- Communication
- Decision
- Approval
- Risk
- Incident
- Goal
- Metric
- Dashboard
- Relationship
- certification

## Required audit result per candidate

For each candidate implementation record:

- concept
- file path
- code symbol
- database object
- current owner
- active or unused
- source of truth status
- consumers
- data volume
- relationship dependencies
- conflicts
- recommended canonical owner
- disposition
- migration risk
- test coverage

## Disposition values

Use:

- `retain_as_authoritative`
- `retain_as_extension`
- `retain_as_projection`
- `retain_as_adapter`
- `convert_to_relationship`
- `convert_to_snapshot`
- `merge`
- `migrate`
- `deprecate`
- `delete_after_migration`
- `unknown_blocked`

## Required outputs

Cursor must create:

1. Duplicate System Audit Report
2. Canonical Owner Matrix
3. Duplicate Database Model Matrix
4. Duplicate Type and Schema Matrix
5. Duplicate Service and API Matrix
6. Duplicate Routing Matrix
7. Duplicate Context and Resume Matrix
8. Duplicate Certification Matrix
9. Data Migration Plan
10. Code Migration Plan
11. Test Migration Plan
12. Deprecation Plan
13. Rollback Plan
14. Unresolved Ownership Decisions

## Migration principles

- preserve user data
- preserve IDs where possible
- preserve history
- preserve provenance
- preserve relationships
- preserve authorization
- preserve exact resume
- preserve Create-to-Project connections
- avoid destructive migration before validation
- support rollback
- compare record counts
- compare relationship counts
- verify business isolation

## Migration order

Recommended order:

1. identify authoritative owners
2. freeze creation of new duplicate models
3. add missing canonical relationships
4. add extensions
5. write migration scripts
6. migrate read paths
7. migrate write paths
8. dual-read only when necessary
9. validate
10. remove duplicate writes
11. archive legacy code
12. remove legacy structures after approved retention window

## No automatic destructive cleanup

Cursor must not drop tables, delete files, or remove migrations solely because they appear duplicative.

Destructive changes require:

- confirmed canonical replacement
- data migration
- validation
- rollback
- explicit approval
