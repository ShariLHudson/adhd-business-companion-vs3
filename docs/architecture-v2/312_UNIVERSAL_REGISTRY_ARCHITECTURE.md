# 312 — Universal Registry Architecture

## Purpose

Define the authoritative registry infrastructure for Spark Estate.

## Registry families

The platform must support:

- Intelligence Member Registry
- Capability Registry
- Collection Registry
- Collection Asset Registry
- Blueprint Registry
- Business Identity Registry
- Work Type Registry
- Certification Registry
- Relationship Type Registry

These may share a common registry kernel.

## Registry kernel requirements

Every registry entry must support:

- immutable canonical ID
- display name
- aliases
- semantic version
- active status
- certification status
- owner
- created date
- updated date
- deprecation state
- replacement ID
- dependencies
- compatibility
- metadata
- validation rules
- migration notes

## Canonical ID rules

IDs must be:

- stable
- unique
- lowercase
- machine-readable
- namespace-aware
- independent of display-name changes

Examples:

- `member.marketing`
- `capability.marketing.positioning`
- `collection.business.speaker`
- `blueprint.event.workshop`
- `identity.speaker`
- `work_type.event_plan`

## Registry ownership

### Member Registry

Owned by platform architecture.

### Capability Registry

Platform-owned registry with domain ownership declared per capability.

### Collection Registry

Platform-owned registry with one accountable Collection owner.

### Blueprint Registry

Universal Blueprint Framework remains authoritative.

### Business Identity Registry

Platform architecture owns the registry; identities may have contributing Members.

### Work Type Registry

Universal Work Engine remains authoritative.

## Registry operations

Required operations:

- register
- get
- list
- search
- resolve alias
- validate
- check compatibility
- resolve dependencies
- inspect owner
- inspect consumers
- deprecate
- replace
- migrate
- certify
- revoke certification
- audit usage

## Validation rules

Reject:

- duplicate IDs
- missing owners
- unknown dependencies
- invalid certification status
- cyclic required dependencies
- incompatible Work Type references
- uncertified production dependencies
- deprecated dependencies without migration
- private runtime declarations
- duplicate capability scope
- Collections without accountable owner

## Adapter strategy

Existing registries must be integrated through adapters where practical.

Adapters must:

- preserve existing IDs
- expose canonical contracts
- avoid double registration
- support migration reporting
- remain temporary when replacement is intended

## Registry query examples

- Find all capabilities owned by Marketing.
- Find all Collections relevant to speakers.
- Find all Blueprints compatible with `event_plan`.
- Find all Collections using pricing analysis.
- Find all assets contributed to by Finance.
- Find deprecated capabilities still in use.
- Find uncertified dependencies.

## Certification integration

Registry entries may be:

- draft
- in review
- conditionally certified
- production certified
- deprecated
- revoked

Production systems must reject revoked dependencies.

## Architecture health

The registry system must report:

- duplicate-risk candidates
- orphan entries
- unresolved dependencies
- deprecated usage
- uncertified production usage
- missing owners
- missing tests
- version conflicts
- stale entries

## Required tests

- canonical ID stability
- alias resolution
- dependency resolution
- cycle detection
- owner validation
- certification enforcement
- deprecation migration
- adapter compatibility
- duplicate prevention
- search
- registry health report
