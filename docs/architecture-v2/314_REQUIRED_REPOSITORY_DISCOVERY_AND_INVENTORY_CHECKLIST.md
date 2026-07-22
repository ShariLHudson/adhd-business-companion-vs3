# 314 — Required Repository Discovery & Inventory Checklist

## Purpose

Ensure Cursor fully understands the current repository before proposing new architecture.

## Inspect repository structure

Inventory:

- application routes
- feature folders
- domain folders
- database schemas
- migrations
- generated types
- APIs
- server actions
- repositories
- services
- hooks
- state stores
- registries
- prompts
- configuration
- tests
- feature flags
- deprecated code
- archived code

## Search for authoritative concepts

Search for all names and aliases related to:

- Universal Work
- Work Type
- Work ID
- Create
- Create artifact
- Project
- Task
- Blueprint
- workflow
- routing
- resume
- context
- Business Profile
- Business DNA
- People I Help
- client avatar
- person
- organization
- client
- vendor
- partner
- offer
- product
- service
- pricing
- proposal
- agreement
- order
- invoice
- payment
- subscription
- location
- schedule
- asset
- inventory
- event
- knowledge
- content
- decision
- approval
- risk
- goal
- metric
- dashboard
- certification
- relationship

## For every discovered candidate capture

- path
- symbol name
- database object
- type
- schema
- API
- UI consumers
- write paths
- read paths
- current source of truth
- active status
- test coverage
- migration history
- known deprecation
- data sensitivity
- business isolation behavior

## Required inventory outputs

Create:

- `CURRENT_ARCHITECTURE_INVENTORY.md`
- `DOMAIN_OWNER_CANDIDATES.md`
- `DATABASE_OBJECT_INVENTORY.md`
- `TYPE_SCHEMA_INVENTORY.md`
- `ROUTE_AND_RUNTIME_INVENTORY.md`
- `CONTEXT_AND_RESUME_INVENTORY.md`
- `REGISTRY_INVENTORY.md`
- `CERTIFICATION_INVENTORY.md`
- `KNOWN_DEPRECATED_SYSTEMS.md`

## Discovery completion gate

Do not propose new persistent models until the inventory is complete enough to prove no equivalent exists.
