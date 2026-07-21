# 313 — Intelligence Lifecycle, Versioning, and Maintenance

## Purpose

Define how Spark Estate intelligence changes safely over time.

## Lifecycle states

Every Member, capability, Collection, Blueprint, and asset must support:

- proposed
- draft
- in review
- conditionally certified
- production certified
- maintenance
- deprecated
- replaced
- revoked
- archived

## Versioning

Use semantic versioning where appropriate:

- major: breaking contract or behavior
- minor: backward-compatible capability or feature addition
- patch: correction, clarification, test, or non-breaking improvement

## Change classification

### Knowledge update

Examples:

- revised guidance
- new evidence
- better framework
- outdated practice removed

### Contract update

Examples:

- changed capability inputs
- changed output schema
- changed allowed consumers
- changed ownership

### Behavior update

Examples:

- routing change
- conversation change
- adaptation change
- recommendation change

### Implementation update

Examples:

- service migration
- storage change
- performance improvement
- API change

## Review requirements

Every change must identify:

- reason
- owner
- scope
- affected objects
- compatibility
- migration
- tests
- certification impact
- rollback plan
- documentation changes

## Capability deprecation

A capability may be deprecated when:

- duplicate scope is found
- ownership changes
- better replacement exists
- evidence becomes invalid
- contract is unsafe
- capability is no longer used

Deprecation must include:

- replacement ID
- migration guidance
- final supported version
- affected Collections
- affected Work
- removal date if known

## Collection lifecycle

Collections must be reviewed for:

- relevance
- asset quality
- duplicate overlap
- owner fitness
- contributor completeness
- user adoption
- user outcomes
- cognitive load
- maintenance burden

## Blueprint lifecycle

Blueprint changes must preserve:

- Work identity
- existing user Work
- resume
- approved content
- version history
- outputs
- Project links
- Research links
- Cartography relationships

When a Blueprint version changes, existing Work must know:

- version used
- available upgrade
- migration impact
- whether upgrade is optional
- whether upgrade is required for safety

## Knowledge freshness

Each knowledge domain must declare:

- review cadence
- source authority
- freshness expectations
- unstable topics
- evidence quality
- archival rules

## Maintenance ownership

Every production-certified object must have:

- accountable owner
- backup owner or escalation route
- review date
- maintenance status
- open blockers
- unresolved risks

## Regression obligations

Changes require relevant regression across:

- owner Member
- contributing Members
- affected Collections
- affected Blueprints
- routing
- Universal Work Engine
- Project integration
- Research
- Cartography
- Shari
- accessibility
- cognitive-load behavior

## Rollback

Production changes must support:

- code rollback
- registry rollback
- data migration rollback where feasible
- certification rollback
- documented manual recovery

## Required reports

- change impact report
- migration report
- deprecation report
- maintenance report
- stale intelligence report
- regression report
